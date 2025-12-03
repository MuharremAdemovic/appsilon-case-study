-- Row Level Security (RLS) Implementation Guide for Appsilon Case Study

-- 1. Enable RLS on the Employees table
ALTER TABLE "Employees" ENABLE ROW LEVEL SECURITY;

-- 2. Create a Policy
-- Scenario: Users can only view employees in their own department.
-- We assume the application sets a session variable 'app.current_user_department' 
-- after authenticating the user.

CREATE POLICY department_isolation_policy ON "Employees"
    FOR SELECT
    USING (
        "Department" = current_setting('app.current_user_department', true)
        OR
        -- Optional: Allow 'Admin' department to see everything
        current_setting('app.current_user_department', true) = 'Admin'
    );

-- 3. How to use in Backend (.NET API)
-- When a request comes in, the API middleware should:
-- a) Authenticate the user (e.g., via JWT).
-- b) Extract the 'Department' claim from the token.
-- c) Set the session variable in the database connection before executing queries.

/*
    // C# Pseudocode for Middleware/Interceptor:
    
    public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
    {
        var userDepartment = context.User.Claims.FirstOrDefault(c => c.Type == "Department")?.Value;
        
        if (!string.IsNullOrEmpty(userDepartment))
        {
            // Set the session variable for the current transaction
            await dbContext.Database.ExecuteSqlRawAsync(
                $"SET LOCAL app.current_user_department = '{userDepartment}'");
        }
        
        await _next(context);
    }
*/

-- 4. Testing the Policy (SQL)

-- Simulate a user from 'IT' department
BEGIN;
SET LOCAL app.current_user_department = 'IT';
SELECT * FROM "Employees"; -- Should only return IT employees
COMMIT;

-- Simulate a user from 'HR' department
BEGIN;
SET LOCAL app.current_user_department = 'HR';
SELECT * FROM "Employees"; -- Should only return HR employees
COMMIT;
