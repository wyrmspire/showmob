-- Grading night: the machinery tables (see docs/grading-night.md).
--
-- showmob_gn_subjects holds the ~100 presentation situations generators pull from.
-- showmob_gn_grades holds one row per grade Chris gives a page.
-- Content stays in repo JSON; these tables are plumbing only.
-- Same posture as the revision tables: RLS on with zero policies, nothing granted
-- to anon/authenticated, and service_role-only functions as the access path.

create table public.showmob_gn_subjects (
  id text primary key check (id ~ '^GN-[0-9]{3}$'),
  title text not null,
  bucket integer not null check (bucket > 0),
  density text,
  interaction text,
  shape text,
  register text,
  lifetime text,
  generator text,
  axis_note text,
  ab_pair integer check (ab_pair is null or ab_pair > 0),
  status text not null default 'pending'
    constraint showmob_gn_subjects_status_check
    check (status in ('pending', 'assigned', 'built', 'graded')),
  artifact_slug text check (artifact_slug is null or artifact_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

comment on column public.showmob_gn_subjects.bucket is
  'Coverage bucket number from the subjects list (1 Mundane everyday restraint tests, 2 Plans & projects, 3 Courses & learning, 4 Worksheets & forms, 5 Day organizers & personal ops, 6 Time & history, 7 Uncertain & incomplete, 8 Complex worlds, 9 Playful & strange, 10 Pitch & persuade, 11 Living & operational, 12 Beautiful failures).';
comment on column public.showmob_gn_subjects.ab_pair is
  'Blind A/B pair number; the two subjects sharing a number are the same situation rendered two ways.';

create table public.showmob_gn_grades (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.showmob_gn_subjects (id),
  artifact_slug text,
  -- content / representation / interaction / scan / one_to_ten / more_less_likely / density_judgment
  scores jsonb not null default '{}'::jsonb check (jsonb_typeof(scores) = 'object'),
  suggestion text,
  -- time_on_page / scroll_depth / finished / widget_events / ab_choice
  behavior jsonb not null default '{}'::jsonb check (jsonb_typeof(behavior) = 'object'),
  graded_at timestamptz not null default now()
);

create index showmob_gn_grades_subject_idx on public.showmob_gn_grades (subject_id, graded_at);

alter table public.showmob_gn_subjects enable row level security;
alter table public.showmob_gn_grades enable row level security;

-- No policies on purpose: anon and authenticated see nothing.
revoke all on public.showmob_gn_subjects from public, anon, authenticated;
revoke all on public.showmob_gn_grades from public, anon, authenticated;
grant select on public.showmob_gn_subjects to service_role;
grant select on public.showmob_gn_grades to service_role;

-- Subjects, optionally filtered by status and/or generator.
create function public.showmob_gn_list_subjects(p_status text default null, p_generator text default null)
returns setof public.showmob_gn_subjects
language sql
stable
security definer
set search_path = ''
as $$
  select s.*
    from public.showmob_gn_subjects s
   where (p_status is null or s.status = p_status)
     and (p_generator is null or s.generator = p_generator)
   order by s.id;
$$;

-- Record one grade. Returns the stored row.
create function public.showmob_gn_record_grade(
  p_subject_id text,
  p_artifact_slug text,
  p_scores jsonb,
  p_suggestion text default null,
  p_behavior jsonb default null
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

  return query
    insert into public.showmob_gn_grades (subject_id, artifact_slug, scores, suggestion, behavior)
    values (p_subject_id, p_artifact_slug, p_scores, p_suggestion, coalesce(p_behavior, '{}'::jsonb))
    returning *;
end;
$$;

-- Grades, newest first, optionally for one subject.
create function public.showmob_gn_list_grades(p_subject_id text default null)
returns setof public.showmob_gn_grades
language sql
stable
security definer
set search_path = ''
as $$
  select g.*
    from public.showmob_gn_grades g
   where p_subject_id is null or g.subject_id = p_subject_id
   order by g.graded_at desc;
$$;

revoke all on function public.showmob_gn_list_subjects(text, text) from public, anon, authenticated;
revoke all on function public.showmob_gn_record_grade(text, text, jsonb, text, jsonb) from public, anon, authenticated;
revoke all on function public.showmob_gn_list_grades(text) from public, anon, authenticated;
grant execute on function public.showmob_gn_list_subjects(text, text) to service_role;
grant execute on function public.showmob_gn_record_grade(text, text, jsonb, text, jsonb) to service_role;
grant execute on function public.showmob_gn_list_grades(text) to service_role;
