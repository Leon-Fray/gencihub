-- Delete IP proxies from line 1 to 120 (already used)
-- Run this in Supabase SQL Editor

-- First, let's see what we're deleting (optional check)
-- Uncomment to preview before deleting:
-- SELECT id, line_number, ip_proxy, last_used_by_id 
-- FROM public.ip_proxies 
-- WHERE line_number <= 120
-- ORDER BY line_number;

-- Delete the proxies up to line 120
DELETE FROM public.ip_proxies 
WHERE line_number <= 120;

-- Optional: Verify deletion
-- Uncomment to see remaining proxies:
-- SELECT COUNT(*) as remaining_proxies,
--        MIN(line_number) as first_line,
--        MAX(line_number) as last_line
-- FROM public.ip_proxies;

