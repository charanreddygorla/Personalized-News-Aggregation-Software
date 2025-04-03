const request = require("supertest");
const { app, db } = require("../server");  // Ensure db is imported
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("Password Reset API", () => {
    let testUser = {
        name: "Test User",
        email: `testuser${Date.now()}@example.com`,
        password: "testpassword",
    };

    beforeAll(async () => {
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
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
        await new Promise((resolve, reject) => {
            db.query("DELETE FROM users WHERE email = ?", [testUser.email], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
        db.end();  // Close DB connection to prevent open handles
    });


    test("Should return 400 if email is not registered", async () => {
        const res = await request(app).post("/forgot-password").send({ email: "nonexistent@example.com" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email not found");
    });

    test("Should reset the password with a valid token", async () => {
        const token = jwt.sign({ email: testUser.email }, "secretKey", { expiresIn: "1h" });
        const newPassword = "newpassword123";

        const res = await request(app)
            .post(`/reset-password/${token}`)
            .send({ password: newPassword });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Password successfully reset");
    });

    test("Should return 400 for invalid or expired token", async () => {
        const res = await request(app).post("/reset-password/invalidtoken").send({ password: "newpassword123" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Invalid or expired token");
    });
});
