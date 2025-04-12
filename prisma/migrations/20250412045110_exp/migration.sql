-- AlterTable
ALTER TABLE "temp_users"."temp_users" ALTER COLUMN "expiry_date" SET DEFAULT now() + interval '1 day';
