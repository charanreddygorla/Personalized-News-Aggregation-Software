const request = require("supertest");
const { app, db } = require("../server");
const bcrypt = require("bcrypt");

describe("User API Tests", () => {
    let testUser = {
        name: "Test User",
        email: `testuser${Date.now()}@example.com`,
        password: "Test@123",
    };
    let newEmail = `updateduser${Date.now()}@example.com`;
    let hashedPassword;

    beforeAll(async () => {
        // Hash the password and create a test user in the database
        hashedPassword = await bcrypt.hash(testUser.password, 10);
        await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [testUser.name, testUser.email, hashedPassword],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    });

    afterAll(async () => {
        // Clean up test user
        await new Promise((resolve, reject) => {
            db.query("DELETE FROM users WHERE email = ? OR email = ?", [testUser.email, newEmail], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
        db.end(); // Close DB connection
    });

    // ✅ Test getting user details by email
    test("Should fetch user details", async () => {
        const res = await request(app).get(`/user/email/${testUser.email}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("name", testUser.name);
        expect(res.body).toHaveProperty("email", testUser.email);
    });

    // ❌ Test fetching non-existent user
    test("Should return 404 for non-existent user", async () => {
        const res = await request(app).get(`/user/email/nonexistent@example.com`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error", "User not found");
    });

    // ✅ Test updating user details
    test("Should update user name and email", async () => {
        const res = await request(app).post("/update-user").send({
            email: testUser.email,
            name: "Updated Name",
            newEmail: newEmail,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User updated successfully!");

        // Verify the update
        const verifyRes = await request(app).get(`/user/email/${newEmail}`);
        expect(verifyRes.statusCode).toBe(200);
        expect(verifyRes.body).toHaveProperty("name", "Updated Name");
        expect(verifyRes.body).toHaveProperty("email", newEmail);
    });

    // ❌ Test updating non-existent user
    test("Should return 404 when updating non-existent user", async () => {
        const res = await request(app).post("/update-user").send({
            email: "nonexistent@example.com",
            name: "New Name",
            newEmail: "newemail@example.com",
        });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("message", "User not found");
    });

    // ✅ Test password update
    test("Should update user password", async () => {
        const res = await request(app).post("/update-password").send({
            email: newEmail, // Updated email from previous test
            oldPassword: testUser.password,
            newPassword: "NewPass@123",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Password updated successfully!");

        // Verify login with the new password
        const fetchRes = await new Promise((resolve, reject) => {
            db.query("SELECT password FROM users WHERE email = ?", [newEmail], (err, results) => {
                if (err) reject(err);
                resolve(results[0].password);
            });
        });

        const isMatch = await bcrypt.compare("NewPass@123", fetchRes);
        expect(isMatch).toBe(true);
    });

    // ❌ Test password update with incorrect old password
    test("Should return 401 for incorrect old password", async () => {
        const res = await request(app).post("/update-password").send({
            email: newEmail,
            oldPassword: "WrongPassword",
            newPassword: "AnotherPass@123",
        });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "Incorrect old password");
    });

    // ❌ Test updating password for non-existent user
    test("Should return 404 when updating password for a non-existent user", async () => {
        const res = await request(app).post("/update-password").send({
            email: "nonexistent@example.com",
            oldPassword: "Test@123",
            newPassword: "NewPass@123",
        });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("message", "User not found");
    });
});
