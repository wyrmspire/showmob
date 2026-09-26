-- Why a page exists (the probe question), revealed only after it is graded.
-- 2026-09-26: Chris flagged that the lane shows no probe before grading;
-- the design call that came back with it is reveal-after-grade, never
-- before, so the blind signal stays pure. Probes for GN-101..GN-110 come
-- from the 2026-09-26 review-set selection notes; earlier subjects stay
-- null until their notes are transcribed.

alter table public.showmob_gn_subjects
  add column probe text;

comment on column public.showmob_gn_subjects.probe is
  'The experiment this page runs (why it was created). Shown to the grader only after a grade is filed.';

update public.showmob_gn_subjects set probe = 'Is a tiny answer worth a page? (taste anchor: Chris rated this 2/10)' where id = 'GN-101';
update public.showmob_gn_subjects set probe = 'Useful answer vs page form - does the content earn the page? (anchor: 3/10)' where id = 'GN-102';
update public.showmob_gn_subjects set probe = 'Break-even math as a page, middle taste anchor (6/10)' where id = 'GN-103';
update public.showmob_gn_subjects set probe = 'Safety content with source limits, strong anchor (8/10)' where id = 'GN-104';
update public.showmob_gn_subjects set probe = 'One-number answer, top anchor (10/10)' where id = 'GN-105';
update public.showmob_gn_subjects set probe = 'Technical line-by-line teaching' where id = 'GN-106';
update public.showmob_gn_subjects set probe = 'Five layers deep - teaches or dumps?' where id = 'GN-107';
update public.showmob_gn_subjects set probe = 'Allegory depth probe' where id = 'GN-108';
update public.showmob_gn_subjects set probe = 'Narrative puzzles - interaction vs theme' where id = 'GN-109';
update public.showmob_gn_subjects set probe = 'Certainty bait - does critique catch false precision?' where id = 'GN-110';
