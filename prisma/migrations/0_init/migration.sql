-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "member";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "temp_member";

-- CreateEnum
CREATE TYPE "public"."provider_type" AS ENUM ('local', 'google');

-- CreateEnum
CREATE TYPE "public"."grade_type" AS ENUM ('admin', 'normal');

-- CreateTable
CREATE TABLE "auth"."auto_login_code" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(256) NOT NULL,
    "create_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_date" TIMESTAMPTZ(6) NOT NULL,
    "ssid" BIGINT NOT NULL,

    CONSTRAINT "pk_regen_code" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."password" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "update_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_password" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."provider" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "public"."provider_type" NOT NULL DEFAULT 'local',

    CONSTRAINT "pk_provider" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."social_info" (
    "id" SERIAL NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "social_code" VARCHAR(128) NOT NULL,
    "access_token" VARCHAR(256),

    CONSTRAINT "pk_social_info" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member"."member" (
    "id" SERIAL NOT NULL,
    "uuid_key" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(256) NOT NULL,

    CONSTRAINT "pk_users" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member"."profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nickname" VARCHAR(32) NOT NULL,
    "image_url" VARCHAR(256),
    "join_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_profile" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member"."ssid" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "SSID" VARCHAR(256) NOT NULL,
    "create_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_ssid" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member"."member_grade" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER,
    "update_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "grade" "public"."grade_type" NOT NULL DEFAULT 'normal',

    CONSTRAINT "member_grade_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_member"."temp_member" (
    "id" BIGSERIAL NOT NULL,
    "code" CHAR(16) NOT NULL,
    "create_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temp_member_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_member"."temp_member_info" (
    "id" BIGSERIAL NOT NULL,
    "temp_member_id" BIGINT NOT NULL,
    "nickname" VARCHAR(32) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256) NOT NULL,

    CONSTRAINT "temp_member_info_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uni_regen_code" ON "auth"."auto_login_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uni_ssid" ON "auth"."auto_login_code"("ssid");

-- CreateIndex
CREATE UNIQUE INDEX "uni_password" ON "auth"."password"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uni_provider" ON "auth"."provider"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uni_social_info" ON "auth"."social_info"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "uni_uuid_key" ON "member"."member"("uuid_key");

-- CreateIndex
CREATE UNIQUE INDEX "uni_email" ON "member"."member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "uni_profile" ON "member"."profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uni_nickname" ON "member"."profile"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "uni_user_ssid" ON "member"."ssid"("user_id", "SSID");

-- CreateIndex
CREATE UNIQUE INDEX "uni_temp_member_info_email" ON "temp_member"."temp_member_info"("email");

-- AddForeignKey
ALTER TABLE "auth"."auto_login_code" ADD CONSTRAINT "fk_ssid" FOREIGN KEY ("ssid") REFERENCES "member"."ssid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."password" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "member"."member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."provider" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "member"."member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."social_info" ADD CONSTRAINT "fk_provider_id" FOREIGN KEY ("provider_id") REFERENCES "auth"."provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member"."profile" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "member"."member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member"."ssid" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "member"."member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member"."member_grade" ADD CONSTRAINT "member_grade_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "member"."member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "temp_member"."temp_member_info" ADD CONSTRAINT "temp_member_info_temp_member_id_fk" FOREIGN KEY ("temp_member_id") REFERENCES "temp_member"."temp_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

