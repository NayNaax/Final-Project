-- Add usernames to users while keeping existing rows valid.
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "username" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
