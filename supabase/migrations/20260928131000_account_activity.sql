-- Account spine. Apply on showmob-dev after reviewing prior migration history.
-- No account can set its own role. Provision the first admin via a private
-- dashboard INSERT into showmob_admin_allowlist before that address signs in.
create table public.showmob_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.showmob_profiles enable row level security;
revoke all on public.showmob_profiles from anon, authenticated;
grant select on public.showmob_profiles to authenticated;
create policy "profile owner can read role" on public.showmob_profiles
  for select to authenticated using ((select auth.uid()) = id);

create table public.showmob_admin_allowlist (
  email text primary key check (email = lower(trim(email)) and length(email) <= 320),
  created_at timestamptz not null default now()
);
revoke all on public.showmob_admin_allowlist from public, anon, authenticated;
alter table public.showmob_admin_allowlist enable row level security;
-- No browser policy or grant for the allowlist.

create function public.showmob_create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.showmob_profiles (id, is_admin)
  values (new.id, false);
  return new;
end;
$$;
revoke all on function public.showmob_create_profile() from public, anon, authenticated;
create trigger showmob_auth_user_created after insert on auth.users
  for each row execute function public.showmob_create_profile();

-- An unverified signup with the reserved address cannot claim admin. Only
-- Auth's verified email confirmation can promote the matching profile.
create function public.showmob_confirm_admin() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is not null
     and (old.email_confirmed_at is null or new.email is distinct from old.email)
     and exists (select 1 from public.showmob_admin_allowlist
                 where email = lower(trim(new.email))) then
    update public.showmob_profiles set is_admin = true where id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function public.showmob_confirm_admin() from public, anon, authenticated;
create trigger showmob_auth_email_confirmed after update of email_confirmed_at, email on auth.users
  for each row execute function public.showmob_confirm_admin();

-- One row per person, artifact block and Monday-start week. A new week cannot
-- erase the previous week's log. Browser writes use authenticated role + RLS.
create table public.showmob_activity_weeks (
  user_id uuid not null references auth.users(id) on delete cascade,
  artifact_slug text not null check (artifact_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  block_id text not null check (length(block_id) between 1 and 120),
  week_start date not null check (extract(isodow from week_start) = 1),
  days jsonb not null check (
    jsonb_typeof(days) = 'array' and jsonb_array_length(days) = 7
    and length(days::text) < 4096
  ),
  updated_at timestamptz not null default now(),
  primary key (user_id, artifact_slug, block_id, week_start)
);
alter table public.showmob_activity_weeks enable row level security;
revoke all on public.showmob_activity_weeks from anon, authenticated;
grant select, insert, update, delete on public.showmob_activity_weeks to authenticated;
create policy "owner reads activity" on public.showmob_activity_weeks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "owner inserts activity" on public.showmob_activity_weeks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owner updates activity" on public.showmob_activity_weeks
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "owner deletes activity" on public.showmob_activity_weeks
  for delete to authenticated using ((select auth.uid()) = user_id);
-- Reject malformed or oversized day values even if a client bypasses UI validation.
create function public.showmob_validate_activity_days() returns trigger
language plpgsql set search_path = '' as $$
declare day jsonb;
begin
  for day in select value from jsonb_array_elements(new.days) loop
    if jsonb_typeof(day) <> 'object'
      or jsonb_typeof(day->'minutes') <> 'number'
      or (day->>'minutes') !~ '^([0-9]|[1-9][0-9]{1,3})$'
      or (day->>'minutes')::integer > 1440
      or jsonb_typeof(day->'strength') <> 'boolean' then
      raise exception 'invalid activity day';
    end if;
  end loop;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.showmob_validate_activity_days() from public, anon, authenticated;
create trigger showmob_activity_validate before insert or update on public.showmob_activity_weeks
  for each row execute function public.showmob_validate_activity_days();
