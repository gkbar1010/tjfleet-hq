-- Add thumbnail and external links to vehicles
ALTER TABLE "vehicles" ADD COLUMN "thumbnail_url" TEXT;
ALTER TABLE "vehicles" ADD COLUMN "turo_link" TEXT;
ALTER TABLE "vehicles" ADD COLUMN "drive_link" TEXT;
ALTER TABLE "vehicles" ADD COLUMN "superior_link" TEXT;
ALTER TABLE "vehicles" ADD COLUMN "exotic_drive_link" TEXT;
