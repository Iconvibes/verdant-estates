-- Add property_name column to enquiries table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS property_name TEXT;
