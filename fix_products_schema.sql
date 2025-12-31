-- =============================================
-- FIX PRODUCTS TABLE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Check if 'images' column exists (incorrect plural)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'images'
    ) THEN
        -- Rename 'images' to 'image' (correct singular)
        ALTER TABLE products RENAME COLUMN images TO image;
        RAISE NOTICE 'Renamed column images to image';
    ELSE
        RAISE NOTICE 'Column images does not exist, no action needed';
    END IF;
END $$;

-- Ensure 'image' column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'image'
    ) THEN
        -- Add 'image' column if it doesn't exist
        ALTER TABLE products ADD COLUMN image TEXT;
        RAISE NOTICE 'Added image column';
    ELSE
        RAISE NOTICE 'Column image already exists';
    END IF;
END $$;

-- Verify the schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('image', 'images')
ORDER BY column_name;

-- =============================================
-- DONE! Products table schema fixed.
-- =============================================
