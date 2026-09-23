-- Milestone one: one artifact with immutable revisions.
--
-- Every revision stores the complete schemaVersion 1 artifact document as JSONB,
-- so export, import and rendering never depend on this table layout.
-- Revisions are append-only: a trigger rejects UPDATE and DELETE for every role,
-- and nothing is granted to the browser roles (anon, authenticated).
-- The only write path is showmob_save_revision(), callable by service_role from a
-- trusted server-side script. There is no public browser access in this milestone.

create table public.showmob_artifacts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  current_revision integer check (current_revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.showmob_artifact_revisions (
  artifact_id uuid not null references public.showmob_artifacts (id),
  revision integer not null check (revision > 0),
  document jsonb not null check (
    jsonb_typeof(document) = 'object'
    and document -> 'schemaVersion' = '1'::jsonb
    and jsonb_typeof(document -> 'blocks') = 'array'
  ),
  -- sha256 of the stored JSONB text; lets anyone confirm a revision never changed.
  document_sha256 text not null,
  parent_revision integer,
  request_id uuid not null unique,
  note text,
  created_at timestamptz not null default now(),
  primary key (artifact_id, revision),
  check (parent_revision is null or parent_revision = revision - 1)
);

alter table public.showmob_artifacts
  add constraint showmob_artifacts_current_revision_fk
  foreign key (id, current_revision)
  references public.showmob_artifact_revisions (artifact_id, revision)
  deferrable initially deferred;

alter table public.showmob_artifacts enable row level security;
alter table public.showmob_artifact_revisions enable row level security;
-- No policies on purpose: anon and authenticated see nothing.
revoke all on public.showmob_artifacts from public, anon, authenticated;
revoke all on public.showmob_artifact_revisions from public, anon, authenticated;
grant select on public.showmob_artifacts to service_role;
grant select on public.showmob_artifact_revisions to service_role;

create function public.showmob_reject_revision_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'showmob revisions are immutable (% rejected)', tg_op
    using errcode = 'P0001', hint = 'Save a new revision instead.';
end;
$$;

create trigger showmob_artifact_revisions_immutable
  before update or delete on public.showmob_artifact_revisions
  for each row execute function public.showmob_reject_revision_change();

create trigger showmob_artifact_revisions_no_truncate
  before truncate on public.showmob_artifact_revisions
  for each statement execute function public.showmob_reject_revision_change();

-- Append one revision and move the artifact pointer in one transaction.
-- p_expected_revision must equal the current head (null for a new artifact);
-- a stale value is rejected instead of overwriting newer work.
-- Retrying with the same p_request_id returns the original result.
create function public.showmob_save_revision(
  p_slug text,
  p_document jsonb,
  p_expected_revision integer,
  p_request_id uuid,
  p_note text default null
)
returns table (slug text, revision integer, document_sha256 text, created_at timestamptz, replayed boolean)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_artifact public.showmob_artifacts%rowtype;
  v_existing public.showmob_artifact_revisions%rowtype;
  v_next integer;
  v_sha text;
begin
  if p_request_id is null then
    raise exception 'request id is required' using errcode = '22023';
  end if;
  if p_document ->> 'slug' is distinct from p_slug then
    raise exception 'document slug does not match %', p_slug using errcode = '22023';
  end if;

  select r.* into v_existing
    from public.showmob_artifact_revisions r where r.request_id = p_request_id;
  if found then
    select a.* into v_artifact from public.showmob_artifacts a where a.id = v_existing.artifact_id;
    if v_artifact.slug <> p_slug or v_existing.document <> p_document then
      raise exception 'request id was already used for a different save' using errcode = '22023';
    end if;
    return query select v_artifact.slug, v_existing.revision, v_existing.document_sha256, v_existing.created_at, true;
    return;
  end if;

  insert into public.showmob_artifacts (slug) values (p_slug) on conflict on constraint showmob_artifacts_slug_key do nothing;
  select a.* into v_artifact from public.showmob_artifacts a where a.slug = p_slug for update;

  if v_artifact.current_revision is distinct from p_expected_revision then
    raise exception 'stale revision: head is %, expected %', coalesce(v_artifact.current_revision::text, 'none'), coalesce(p_expected_revision::text, 'none')
      using errcode = 'P0409';
  end if;

  v_next := coalesce(v_artifact.current_revision, 0) + 1;
  v_sha := encode(sha256(convert_to(p_document::text, 'UTF8')), 'hex');

  insert into public.showmob_artifact_revisions (artifact_id, revision, document, document_sha256, parent_revision, request_id, note)
    values (v_artifact.id, v_next, p_document, v_sha, v_artifact.current_revision, p_request_id, p_note);
  update public.showmob_artifacts a set current_revision = v_next, updated_at = now() where a.id = v_artifact.id;

  return query select p_slug, v_next, v_sha, now(), false;
end;
$$;

-- Read one revision (or the head when p_revision is null).
create function public.showmob_get_revision(p_slug text, p_revision integer default null)
returns table (slug text, revision integer, current_revision integer, document jsonb, document_sha256 text, stored_sha256_matches boolean, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select a.slug, r.revision, a.current_revision, r.document, r.document_sha256,
         r.document_sha256 = encode(sha256(convert_to(r.document::text, 'UTF8')), 'hex'),
         r.created_at
    from public.showmob_artifacts a
    join public.showmob_artifact_revisions r on r.artifact_id = a.id
   where a.slug = p_slug and r.revision = coalesce(p_revision, a.current_revision);
$$;

-- Revision history without documents.
create function public.showmob_list_revisions(p_slug text)
returns table (revision integer, document_sha256 text, parent_revision integer, note text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.revision, r.document_sha256, r.parent_revision, r.note, r.created_at
    from public.showmob_artifacts a
    join public.showmob_artifact_revisions r on r.artifact_id = a.id
   where a.slug = p_slug
   order by r.revision;
$$;

revoke all on function public.showmob_save_revision(text, jsonb, integer, uuid, text) from public, anon, authenticated;
revoke all on function public.showmob_get_revision(text, integer) from public, anon, authenticated;
revoke all on function public.showmob_list_revisions(text) from public, anon, authenticated;
revoke all on function public.showmob_reject_revision_change() from public, anon, authenticated;
grant execute on function public.showmob_save_revision(text, jsonb, integer, uuid, text) to service_role;
grant execute on function public.showmob_get_revision(text, integer) to service_role;
grant execute on function public.showmob_list_revisions(text) to service_role;
