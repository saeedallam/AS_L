-- The design uses six index colours, one per category. Replace the old
-- four-value accent constraint with the new keys, and map existing rows.

alter table public.categories drop constraint if exists categories_accent_check;

update public.categories set accent = case accent
  when 'pencil' then 'school'
  when 'ruler'  then 'office'
  when 'eraser' then 'art'
  when 'marker' then 'learning'
  else accent
end;

alter table public.categories alter column accent set default 'school';

alter table public.categories add constraint categories_accent_check
  check (accent in ('school', 'paper', 'writing', 'art', 'office', 'learning'));
