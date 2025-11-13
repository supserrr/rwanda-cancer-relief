/**
 * Allow Article Images in Resources Bucket
 * 
 * Updates the resources bucket to allow image uploads for article content.
 * Adds image MIME types and creates RLS policies for the article-images folder.
 */

-- Update the resources bucket to include image MIME types
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  -- Audio types
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/vorbis',
  'audio/flac',
  -- Video types
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
  'video/x-flv',
  -- PDF types
  'application/pdf',
  -- Image types (for article images)
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]
WHERE id = 'resources';

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own article images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own article images" ON storage.objects;

-- Create RLS policy for article images upload
-- Allow authenticated users to upload images to article-images folder
CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = 'article-images'
);

-- Allow authenticated users to update article images they uploaded
CREATE POLICY "Users can update own article images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = 'article-images' AND
  (storage.foldername(name))[2] LIKE (select auth.uid())::text || '%'
);

-- Allow authenticated users to delete article images they uploaded
CREATE POLICY "Users can delete own article images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = 'article-images' AND
  (storage.foldername(name))[2] LIKE (select auth.uid())::text || '%'
);

