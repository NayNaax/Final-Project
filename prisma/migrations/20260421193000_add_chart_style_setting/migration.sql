-- Add chart style preference to user settings
ALTER TABLE "UserSettings"
    ADD COLUMN "chartStyle" TEXT NOT NULL DEFAULT 'line';
