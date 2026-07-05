-- Migration 003 — seed the initial rental dress inventory.
-- Run in the Supabase SQL Editor after migrations 001 (schema) and 002 (RLS).
-- See skills/backend-data-model.md. These are placeholders — Linda edits
-- names, sizes, and prices to match her real stock once the dashboard has
-- edit actions.

insert into dresses (name, size, rental_price, status) values
  ('Aria', '2', 150, 'available'),
  ('Celeste', '4', 165, 'available'),
  ('Noor', '6', 180, 'available'),
  ('Amara', '8', 195, 'available'),
  ('Seraphine', '10', 210, 'available'),
  ('Odile', '12', 225, 'available'),
  ('Liora', '14', 240, 'available'),
  ('Freya', '16', 265, 'available'),
  ('Zaria', '18', 290, 'available'),
  ('Elowen', '20', 320, 'available');
