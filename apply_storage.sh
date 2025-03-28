#!/bin/bash

echo "Applying storage configuration..."
# Apply the storage configuration
cat supabase/storage.sql | supabase db execute

echo "Storage configuration applied successfully!" 