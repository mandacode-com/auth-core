-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "temp_user";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user";

-- CreateEnum
CREATE TYPE "public"."provider_type" AS ENUM ('google', 'naver', 'kakao', 'apple', 'facebook', 'github');

-- CreateEnum
CREATE TYPE "public"."role" AS ENUM ('super', 'admin', 'user', 'guest');

-- CreateTable
CREATE TABLE "auth"."auth_account" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "login_id" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."oauth_account" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "public"."provider_type" NOT NULL,
    "access_token" VARCHAR(256),
    "refresh_token" VARCHAR(256),

    CONSTRAINT "oauth_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."user" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "email" VARCHAR(256),
    "role" "public"."role" NOT NULL DEFAULT 'user',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."profile" (
    "id" SERIAL NOT NULL,
    "nickname" VARCHAR(32) NOT NULL,
    "profile_image" VARCHAR(256),
    "join_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_date" TIMESTAMPTZ(6) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_user"."temp_user" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "nickname" VARCHAR(32) NOT NULL,
    "login_id" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "create_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_date" TIMESTAMPTZ(6) NOT NULL,
    "expiry_date" TIMESTAMPTZ(6) NOT NULL DEFAULT now() + interval '1 day',
    "email_verification_code" CHAR(16) NOT NULL,
    "resend_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "temp_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_account_user_id_key" ON "auth"."auth_account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_account_login_id_key" ON "auth"."auth_account"("login_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_uuid_key" ON "user"."user"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_nickname_key" ON "user"."profile"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "user"."profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "temp_user_email_key" ON "temp_user"."temp_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "temp_user_login_id_key" ON "temp_user"."temp_user"("login_id");

-- AddForeignKey
ALTER TABLE "auth"."auth_account" ADD CONSTRAINT "auth_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauth_account" ADD CONSTRAINT "oauth_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
