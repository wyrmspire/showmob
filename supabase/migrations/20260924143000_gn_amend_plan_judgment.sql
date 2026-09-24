-- Amend scores on an existing grade row (merge jsonb). Used for post-grade plan judgment.
-- Does not touch suggestion, behavior, or graded_at — those stay with the original cold grade.

create function public.showmob_gn_amend_grade_scores(
  p_grade_id uuid,
  p_scores_patch jsonb
)
returns setof public.showmob_gn_grades
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_grade_id is null then
    raise exception 'grade id is required' using errcode = '22023';
  end if;
  if p_scores_patch is null or jsonb_typeof(p_scores_patch) <> 'object' then
    raise exception 'scores patch must be a JSON object' using errcode = '22023';
  end if;

  return query
    update public.showmob_gn_grades
       set scores = scores || p_scores_patch
     where id = p_grade_id
    returning *;
end;
$$;

revoke all on function public.showmob_gn_amend_grade_scores(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.showmob_gn_amend_grade_scores(uuid, jsonb) to service_role;
