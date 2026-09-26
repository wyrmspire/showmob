-- Pin each grade to the exact page version it judged, and keep amendment
-- history. Outside review, 2026-09-26: grades stored only artifact_slug, so
-- a page edited after grading left the grade describing a page that no
-- longer exists; and the amend RPC rewrote scores in place with no history.

alter table public.showmob_gn_grades
  add column document_sha256 text,
  add column supersedes uuid references public.showmob_gn_grades(id);

alter table public.showmob_gn_grades
  add constraint showmob_gn_grades_document_sha256_check
  check (document_sha256 is null or document_sha256 ~ '^[0-9a-f]{64}$');

comment on column public.showmob_gn_grades.document_sha256 is
  'SHA-256 (hex) of the artifact document exactly as rendered when graded - JSON.stringify of the catalog entry. Pins the grade to a page version.';
comment on column public.showmob_gn_grades.supersedes is
  'Set when this row amends an earlier grade: points at the row it supersedes. Original rows are never rewritten.';

-- Record one grade, pinned to the rendered document. Returns the stored row.
-- The 5-argument shape still resolves here via the default, so a caller
-- deployed before this migration keeps working.
drop function public.showmob_gn_record_grade(text, text, jsonb, text, jsonb);
create function public.showmob_gn_record_grade(
  p_subject_id text,
  p_artifact_slug text,
  p_scores jsonb,
  p_suggestion text default null,
  p_behavior jsonb default null,
  p_document_sha256 text default null
)
returns setof public.showmob_gn_grades
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_subject_id is null then
    raise exception 'subject id is required' using errcode = '22023';
  end if;
  if p_scores is null or jsonb_typeof(p_scores) <> 'object' then
    raise exception 'scores must be a JSON object' using errcode = '22023';
  end if;
  if p_behavior is not null and jsonb_typeof(p_behavior) <> 'object' then
    raise exception 'behavior must be a JSON object' using errcode = '22023';
  end if;
  if p_document_sha256 is not null and p_document_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'document_sha256 must be 64 lowercase hex characters' using errcode = '22023';
  end if;

  return query
    insert into public.showmob_gn_grades (subject_id, artifact_slug, scores, suggestion, behavior, document_sha256)
    values (p_subject_id, p_artifact_slug, p_scores, p_suggestion, coalesce(p_behavior, '{}'::jsonb), p_document_sha256)
    returning *;
end;
$$;

-- Amend a grade by APPENDING a superseding row. The original keeps its
-- scores, suggestion, behavior and graded_at; the new row carries the
-- merged scores and points back at what it supersedes.
drop function public.showmob_gn_amend_grade_scores(uuid, jsonb);
create function public.showmob_gn_amend_grade_scores(
  p_grade_id uuid,
  p_scores_patch jsonb
)
returns setof public.showmob_gn_grades
language plpgsql
security definer
set search_path = ''
as $$
declare
  original public.showmob_gn_grades%rowtype;
begin
  if p_grade_id is null then
    raise exception 'grade id is required' using errcode = '22023';
  end if;
  if p_scores_patch is null or jsonb_typeof(p_scores_patch) <> 'object' then
    raise exception 'scores patch must be a JSON object' using errcode = '22023';
  end if;

  select * into original
    from public.showmob_gn_grades
   where id = p_grade_id;
  if not found then
    return; -- empty set; the API maps that to 404
  end if;

  return query
    insert into public.showmob_gn_grades (subject_id, artifact_slug, scores, suggestion, behavior, document_sha256, supersedes)
    values (original.subject_id, original.artifact_slug, original.scores || p_scores_patch,
            original.suggestion, original.behavior, original.document_sha256, p_grade_id)
    returning *;
end;
$$;

revoke all on function public.showmob_gn_record_grade(text, text, jsonb, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.showmob_gn_amend_grade_scores(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.showmob_gn_record_grade(text, text, jsonb, text, jsonb, text) to service_role;
grant execute on function public.showmob_gn_amend_grade_scores(uuid, jsonb) to service_role;
