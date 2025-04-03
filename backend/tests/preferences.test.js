const request = require("supertest");
const { app, db } = require("../server");

describe("Feedback & Preferences API", () => {
    let testUser = {
        email: `testuser${Date.now()}@example.com`,
        feedback: "This is a test feedback.",
        preferences: "dark-mode,english",
    };

    beforeAll(async () => {
        // Ensure the test user exists
        await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO users (email) VALUES (?)",
                [testUser.email],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    });

    afterAll(async () => {
        // Clean up test user from the database
        await new Promise((resolve, reject) => {
            db.query("DELETE FROM users WHERE email = ?", [testUser.email], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
        db.end(); // Close DB connection to prevent open handles
    });

    // ✅ Test feedback submission
    test("Should submit feedback successfully", async () => {
        const res = await request(app).post("/submit-feedback").send({
            email: testUser.email,
            feedback: testUser.feedback,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Feedback updated successfully!");
    });

    // ❌ Test missing email or feedback
    test("Should return 400 if email or feedback is missing", async () => {
        const res = await request(app).post("/submit-feedback").send({
            email: "",
            feedback: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email and feedback are required");
    });

    // ✅ Test saving preferences
    test("Should save user preferences successfully", async () => {
        const res = await request(app).post("/save-preferences").send({
            email: testUser.email,
            preferences: testUser.preferences,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Preferences updated successfully!");
    });

    // ❌ Test missing email or preferences
    test("Should return 400 if email or preferences are missing", async () => {
        const res = await request(app).post("/save-preferences").send({
            email: "",
            preferences: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email and preferences are required");
    });

    // ✅ Test fetching preferences
    test("Should retrieve saved preferences", async () => {
        const res = await request(app).get("/get-preferences").query({
            email: testUser.email,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("preferences", testUser.preferences);
    });

    // ❌ Test fetching preferences for non-existing user
    test("Should return empty preferences for non-existing user", async () => {
        const res = await request(app).get("/get-preferences").query({
            email: "nonexistent@example.com",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("preferences", "");
    });

    // ❌ Test missing email in query
    test("Should return 400 if email is missing in get-preferences", async () => {
        const res = await request(app).get("/get-preferences").query({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email is required");
    });
});
