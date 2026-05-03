DELETE FROM public.discovery_submissions
WHERE business LIKE 'TEST\_%' ESCAPE '\' OR business = 'TEST_NORETURN';

DROP FUNCTION IF EXISTS public._diag_discovery_policies();
