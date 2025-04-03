-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "temp_users";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateEnum
CREATE TYPE "public"."provider_type" AS ENUM ('google', 'naver', 'kakao', 'apple', 'facebook', 'github');

-- CreateEnum
CREATE TYPE "public"."role" AS ENUM ('super', 'admin', 'user', 'guest');

-- CreateTable
CREATE TABLE "auth"."auth_accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "login_id" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."oauth_accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "provider" "public"."provider_type" NOT NULL,
    "provider_id" VARCHAR(256) NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."users" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "role" "public"."role" NOT NULL DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."profile" (
    "id" SERIAL NOT NULL,
    "nickname" VARCHAR(32) NOT NULL,
    "profile_image" VARCHAR(256),
    "join_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_date" TIMESTAMPTZ(6) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_users"."temp_users" (
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

    CONSTRAINT "temp_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_user_id_key" ON "auth"."auth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_login_id_key" ON "auth"."auth_accounts"("login_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_email_key" ON "auth"."auth_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_id_key" ON "auth"."oauth_accounts"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_email_key" ON "auth"."oauth_accounts"("provider", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"."users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "profile_nickname_key" ON "users"."profile"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "users"."profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "temp_users_email_key" ON "temp_users"."temp_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "temp_users_login_id_key" ON "temp_users"."temp_users"("login_id");

-- AddForeignKey
ALTER TABLE "auth"."auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
