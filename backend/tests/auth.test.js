const request = require("supertest");
const { app, db } = require("../server");

describe("Authentication API - Register", () => {
    test("Should register a new user successfully", async () => {
        const uniqueEmail = `test${Date.now()}@example.com`;

        const res = await request(app)
            .post("/register")
            .send({
                name: "John Doe",
                email: uniqueEmail,
                password: "password123",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });

    test("Should fail if email is already registered", async () => {
        const existingUser = {
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "password123",
        };

        // First Registration (Successful)
        await request(app).post("/register").send(existingUser);

        // Second Registration (Should Fail)
        const res = await request(app).post("/register").send(existingUser);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email already exists");
    });

    test("Should return 400 if fields are missing", async () => {
        const res = await request(app).post("/register").send({
            name: "",
            email: "",
            password: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "All fields are required");
    });
});

describe("Authentication API - Login", () => {
    let testUser = {
        name: "Test User",
        email: `testuser${Date.now()}@example.com`,
        password: "testpassword",
    };

    beforeAll(async () => {
        await request(app).post("/register").send(testUser); // Ensure the user is registered
    });

    afterAll((done) => {
        db.end((err) => {
            if (err) console.error("Error closing database:", err);
            done();
        });
    });

    test("Should log in successfully with correct credentials", async () => {
        const res = await request(app).post("/login").send({
            email: testUser.email,
            password: testUser.password,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Login successful");
        expect(res.body).toHaveProperty("token");
    });

    test("Should fail with incorrect password", async () => {
        const res = await request(app).post("/login").send({
            email: testUser.email,
            password: "wrongpassword",
        });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "Invalid email or password");
    });

    test("Should fail if email is not registered", async () => {
        const res = await request(app).post("/login").send({
            email: "nonexistent@example.com",
            password: "password123",
        });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "Invalid email or password");
    });

    test("Should return 400 if fields are missing", async () => {
        const res = await request(app).post("/login").send({
            email: "",
            password: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "All fields are required");
    });
});
