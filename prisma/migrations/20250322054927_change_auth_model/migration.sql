/*
  Warnings:

  - You are about to drop the column `access_token` on the `oauth_account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `oauth_account` table. All the data in the column will be lost.
  - Added the required column `provider_id` to the `oauth_account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auth"."oauth_account" DROP COLUMN "access_token",
DROP COLUMN "refresh_token",
ADD COLUMN     "provider_id" VARCHAR(256) NOT NULL;

-- AlterTable
ALTER TABLE "temp_user"."temp_user" ALTER COLUMN "expiry_date" SET DEFAULT now() + interval '1 day';
