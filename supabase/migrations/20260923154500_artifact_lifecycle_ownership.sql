-- Foundation follow-up: denormalized lifecycle status + ownership column.
--
-- Lifecycle (`draft` | `preview` | `published` | `archived`) already lives inside
-- every immutable revision document. This adds a queryable copy on the artifact
-- row and an owner_id placeholder for Phase 4 Auth. RLS remains deny-by-default
-- for anon/authenticated; no browser grants are added.
-- preview is a repository/catalog lifecycle flag and is independent of Supabase.

alter table public.showmob_artifacts
  add column if not exists status text
    constraint showmob_artifacts_status_check
    check (status is null or status in ('draft', 'preview', 'published', 'archived')),
  add column if not exists owner_id uuid;

comment on column public.showmob_artifacts.status is
  'Denormalized from document.status for queries. The authoritative value remains inside each revision JSONB document. preview is catalog lifecycle, not a Supabase feature.';
comment on column public.showmob_artifacts.owner_id is
  'Ownership boundary placeholder. Remains null until Auth/membership (Phase 4). RLS still denies anon and authenticated; never authorize from client-editable metadata alone.';

-- Backfill status from the current revision document when present.
update public.showmob_artifacts a
set status = r.document ->> 'status'
from public.showmob_artifact_revisions r
where r.artifact_id = a.id
  and r.revision = a.current_revision
  and a.status is null
  and (r.document ->> 'status') in ('draft', 'preview', 'published', 'archived');

-- Keep save_revision in sync: validate status and write the denormalized column.
create or replace function public.showmob_save_revision(
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
  v_status text;
begin
  if p_request_id is null then
    raise exception 'request id is required' using errcode = '22023';
  end if;
  if p_document ->> 'slug' is distinct from p_slug then
    raise exception 'document slug does not match %', p_slug using errcode = '22023';
  end if;

  v_status := p_document ->> 'status';
  if v_status is null or v_status not in ('draft', 'preview', 'published', 'archived') then
    raise exception 'document status must be draft, preview, published, or archived'
      using errcode = '22023';
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
  update public.showmob_artifacts a
    set current_revision = v_next,
        status = v_status,
        updated_at = now()
    where a.id = v_artifact.id;

  return query select p_slug, v_next, v_sha, now(), false;
end;
$$;

revoke all on function public.showmob_save_revision(text, jsonb, integer, uuid, text) from public, anon, authenticated;
grant execute on function public.showmob_save_revision(text, jsonb, integer, uuid, text) to service_role;
