-- Allow ENTER users to complete the weekly rhythm before they earn a squad.

ALTER TABLE public.declarations
  ALTER COLUMN squad_id DROP NOT NULL;

ALTER TABLE public.checkins
  ALTER COLUMN squad_id DROP NOT NULL;

ALTER TABLE public.reflections
  ALTER COLUMN squad_id DROP NOT NULL;

COMMENT ON COLUMN public.declarations.squad_id IS 'Nullable for ENTER users before PROVEN squad assignment.';
COMMENT ON COLUMN public.checkins.squad_id IS 'Nullable for ENTER users before PROVEN squad assignment.';
COMMENT ON COLUMN public.reflections.squad_id IS 'Nullable for ENTER users before PROVEN squad assignment.';
