-- Why a page exists (the probe question), revealed only after it is graded.
-- Design: the probe is revealed after grading, never before, so the blind
-- signal stays pure. Probes cover GN-101..GN-110; earlier subjects stay
-- null until their notes are transcribed.

alter table public.showmob_gn_subjects
  add column probe text;

comment on column public.showmob_gn_subjects.probe is
  'The experiment this page runs (why it was created). Shown to the grader only after a grade is filed.';

update public.showmob_gn_subjects set probe = 'Is a tiny answer worth a page? (low taste anchor)' where id = 'GN-101';
update public.showmob_gn_subjects set probe = 'Useful answer vs page form - does the content earn the page? (low-middle anchor)' where id = 'GN-102';
update public.showmob_gn_subjects set probe = 'Break-even math as a page, middle taste anchor' where id = 'GN-103';
update public.showmob_gn_subjects set probe = 'Safety content with source limits, strong anchor' where id = 'GN-104';
update public.showmob_gn_subjects set probe = 'One-number answer, top anchor' where id = 'GN-105';
update public.showmob_gn_subjects set probe = 'Technical line-by-line teaching' where id = 'GN-106';
update public.showmob_gn_subjects set probe = 'Five layers deep - teaches or dumps?' where id = 'GN-107';
update public.showmob_gn_subjects set probe = 'Allegory depth probe' where id = 'GN-108';
update public.showmob_gn_subjects set probe = 'Narrative puzzles - interaction vs theme' where id = 'GN-109';
update public.showmob_gn_subjects set probe = 'Certainty bait - does critique catch false precision?' where id = 'GN-110';
