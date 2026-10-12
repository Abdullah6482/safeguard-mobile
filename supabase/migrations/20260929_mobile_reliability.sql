-- Context-aware migration for the deployed SafeGuard schema, reviewed 2026-09-29.
-- Existing location_lat/location_lng, investigator_id, reference generation,
-- and 5x5 risk calculation are deliberately reused.

alter table public.incidents
  add column if not exists client_submission_id text,
  add column if not exists incident_at timestamptz;

create unique index if not exists incidents_client_submission_id_uidx
  on public.incidents(client_submission_id)
  where client_submission_id is not null;

create index if not exists incidents_investigator_created_idx
  on public.incidents(investigator_id, created_at desc);

update public.incidents
set incident_at = created_at
where incident_at is null;

-- Map historical text assignments where they exactly match the old UI format.
update public.incidents i
set investigator_id = p.id
from public.profiles p
where i.investigator_id is null
  and p.role = 'investigator'::public.user_role
  and i.reported_to = p.full_name || ' (' || p.job_title || ')';

-- Only add the uniqueness guarantee when existing data is already clean.
do $$
begin
  if exists (
    select 1 from public.safety_points
    where incident_id is not null
    group by incident_id having count(*) > 1
  ) then
    raise exception 'Duplicate safety_points incident_id values exist; review them before applying this migration.';
  end if;
  create unique index if not exists safety_points_incident_id_uidx
    on public.safety_points(incident_id)
    where incident_id is not null;
end $$;

-- Reporters see their own incidents; HSE investigators/managers retain global
-- visibility required by the existing mobile and web workflows.
drop policy if exists "Incidents are viewable by authenticated users" on public.incidents;
drop policy if exists "Role-scoped incident visibility" on public.incidents;
create policy "Role-scoped incident visibility"
  on public.incidents for select to authenticated
  using (
    reporter_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('investigator'::public.user_role, 'manager'::public.user_role)
    )
  );

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
  on public.profiles for select to authenticated
  using (true);

-- Replace the current ALL/public storage mutation policy. The bucket remains
-- public for read compatibility with the web dashboard, but writes require auth.
drop policy if exists "Allow all authenticated users full access" on storage.objects;
drop policy if exists "Authenticated users can read incident photos" on storage.objects;
drop policy if exists "Users can upload incident photos" on storage.objects;
drop policy if exists "Owners can update incident photos" on storage.objects;
drop policy if exists "Owners can delete incident photos" on storage.objects;

create policy "Authenticated users can read incident photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'incident-photos');

create policy "Users can upload incident photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'incident-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners can update incident photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'incident-photos' and owner_id = auth.uid()::text)
  with check (bucket_id = 'incident-photos' and owner_id = auth.uid()::text);

create policy "Owners can delete incident photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'incident-photos' and owner_id = auth.uid()::text);

revoke all on table public.incidents from anon;
revoke all on table public.profiles from anon;
revoke all on table public.safety_points from anon;
