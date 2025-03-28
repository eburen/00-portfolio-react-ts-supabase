#!/bin/bash

# Apply the main schema
echo "Applying database schema..."
supabase db reset

echo "Applying storage configuration..."
# Apply the storage configuration
cat supabase/storage.sql | supabase db execute

echo "Schema applied successfully!" 