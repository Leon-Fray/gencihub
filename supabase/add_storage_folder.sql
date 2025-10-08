-- Add storage_folder column to models table
ALTER TABLE public.models 
ADD COLUMN IF NOT EXISTS storage_folder TEXT;

-- Example: Update Annie's storage folder
-- UPDATE public.models 
-- SET storage_folder = 'annie'
-- WHERE name = 'Annie';

COMMENT ON COLUMN public.models.storage_folder IS 'Folder name in the model-images storage bucket where this models images are stored';

