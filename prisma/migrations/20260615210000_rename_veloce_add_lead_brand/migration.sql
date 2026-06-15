-- CreateEnum
CREATE TYPE "LeadBrand" AS ENUM ('TJ', 'SUPERIOR_MOTOR_CLUB', 'EXOTIC_DRIVE', 'TURO');

-- Rename BookingSource enum value VELOCE_WEBSITE -> EXOTIC_DRIVE_WEBSITE
ALTER TYPE "BookingSource" RENAME VALUE 'VELOCE_WEBSITE' TO 'EXOTIC_DRIVE_WEBSITE';

-- Rename vehicles column veloce_listing_status -> exotic_drive_listing_status
ALTER TABLE "vehicles" RENAME COLUMN "veloce_listing_status" TO "exotic_drive_listing_status";

-- Add lead_brand column to bookings
ALTER TABLE "bookings" ADD COLUMN "lead_brand" "LeadBrand";
