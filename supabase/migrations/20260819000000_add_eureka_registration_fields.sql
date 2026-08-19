-- Add the required Eureka prerequisite data without changing existing records.
alter table public.registrations
  add column if not exists eureka_id text,
  add column if not exists idea_description text;

comment on column public.registrations.eureka_id is
  'Eureka registration identifier supplied by the participant';
comment on column public.registrations.idea_description is
  'Participant''s description of their idea';
