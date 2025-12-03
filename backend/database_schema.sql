-- Database Schema for Appsilon Case Study

-- Employees Table
CREATE TABLE IF NOT EXISTS "Employees" (
    "Id" UUID PRIMARY KEY,
    "Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Department" TEXT NOT NULL,
    "PasswordHash" TEXT, -- Added for consistency with C# model
    "UpdatedAt" TIMESTAMP WITH TIME ZONE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CameraLogs Table
CREATE TABLE IF NOT EXISTS "CameraLogs" (
    "Id" UUID PRIMARY KEY,
    "ImageUrl" TEXT NOT NULL,
    "ModelOutputJson" TEXT, -- Stores JSON output from ML model
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes (Optional for performance)
CREATE INDEX IF NOT EXISTS "IX_Employees_Email" ON "Employees" ("Email");
CREATE INDEX IF NOT EXISTS "IX_CameraLogs_CreatedAt" ON "CameraLogs" ("CreatedAt");
