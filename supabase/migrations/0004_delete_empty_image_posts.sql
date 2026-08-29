-- Migration 0004: Delete posts without valid images
-- Removes the test posts that have empty or broken image placeholders

DELETE FROM public.found_items
WHERE reference_code = 'FND-ZNX-1855'
   OR photos = '{"data:image/jpeg;base64,/9j/4AAQSkZJRg=="}'
   OR cardinality(photos) = 0
   OR photos IS NULL;

DELETE FROM public.lost_reports
WHERE ticket_id = 'LST-2026-7736'
   OR photos = '{"data:image/jpeg;base64,/9j/4AAQSkZJRg=="}'
   OR cardinality(photos) = 0
   OR photos IS NULL;
