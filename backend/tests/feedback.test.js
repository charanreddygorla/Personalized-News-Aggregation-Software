const request = require("supertest");
const { app, db } = require("../server");

describe("Feedback API Tests", () => {
    let testUser = {
        email: `testuser${Date.now()}@example.com`,
        feedback: "This is a test feedback message.",
    };

    afterAll(() => {
        db.end(); // Close database connection
        app.close && app.close(); // Close Express server if applicable
    });
    

    // ✅ Test submitting feedback for a new user
    test("Should submit feedback for a new user", async () => {
        const res = await request(app).post("/submit-feedback").send({
            email: testUser.email,
            feedback: testUser.feedback,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Feedback submitted successfully!");

        // Verify data was saved
        const verifyRes = await new Promise((resolve, reject) => {
            db.query("SELECT feedback FROM users WHERE email = ?", [testUser.email], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        expect(verifyRes.length).toBe(1);
        expect(verifyRes[0].feedback).toBe(testUser.feedback);
    });

    // ✅ Test updating feedback for an existing user
    test("Should update feedback for an existing user", async () => {
        const newFeedback = "Updated feedback message.";

        const res = await request(app).post("/submit-feedback").send({
            email: testUser.email,
            feedback: newFeedback,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Feedback updated successfully!");

        // Verify update
        const verifyRes = await new Promise((resolve, reject) => {
            db.query("SELECT feedback FROM users WHERE email = ?", [testUser.email], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        expect(verifyRes.length).toBe(1);
        expect(verifyRes[0].feedback).toBe(newFeedback);
    });

    // ❌ Test submitting feedback with missing fields
    test("Should return 400 for missing fields", async () => {
        const res = await request(app).post("/submit-feedback").send({ email: testUser.email });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email and feedback are required");
    });

    // ❌ Test submitting feedback with empty email
    test("Should return 400 when email is missing", async () => {
        const res = await request(app).post("/submit-feedback").send({ feedback: "Some feedback" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email and feedback are required");
    });

    // ❌ Test submitting feedback with an empty feedback message
    test("Should return 400 when feedback message is empty", async () => {
        const res = await request(app).post("/submit-feedback").send({
            email: testUser.email,
            feedback: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email and feedback are required");
    });

    // ✅ Test submitting excessively long feedback
    test("Should handle excessively long feedback message", async () => {
        const longFeedback = "A".repeat(10000); // 10,000 characters long

        const res = await request(app).post("/submit-feedback").send({
            email: testUser.email,
            feedback: longFeedback,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Feedback updated successfully!");
    });
});
