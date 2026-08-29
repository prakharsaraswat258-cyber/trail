-- Migration 0010: Enhance matches table with confidence_label and ai_reasoning for AI matching engine

-- 1. Add new columns if they do not exist
alter table public.matches
  add column if not exists confidence_label text check (confidence_label in ('strong', 'possible', 'weak'));

alter table public.matches
  add column if not exists ai_reasoning text;

-- 2. Backfill confidence_label for any existing records based on confidence_score
update public.matches
set confidence_label = case
  when confidence_score >= 70 then 'strong'
  when confidence_score >= 40 then 'possible'
  else 'weak'
end
where confidence_label is null;
