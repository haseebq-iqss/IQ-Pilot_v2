const supertest = require("supertest");
const app = require("../app");
const { default: mongoose } = require("mongoose");

// A LOT OF TESTS WILL FAIL BECAUSE THE SERVER IS NOT SET UP CORRECTLY !

describe("Auth API Tests - Basic Error Handling", () => {
    beforeAll(async () => {
        const DB_URI = process.env.MONGO_URI;
        await mongoose.connect(DB_URI);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe("Signup Routes", () => {
        it("Should return 400 if no body is passed", async () => {
            const response = await supertest(app).post("/api/v2/auth/signup").send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("status", "Error");
            expect(response.body).toHaveProperty("message");
        });

        it("Should return 400 if an incomplete body is passed", async () => {
            const incompleteData = {
                email: "test@example.com",
                fname: "John",
            };
            const response = await supertest(app).post("/api/v2/auth/signup").send(incompleteData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("status", "Error");
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("Login Routes", () => {
        it("Should return 400 if no body is passed", async () => {
            const response = await supertest(app).post("/api/v2/auth/login").send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("status", "Error");
            expect(response.body).toHaveProperty("message");
        });

        it("Should return 401 if incorrect email or password is passed", async () => {
            const invalidCredentials = {
                email: "wrong@example.com",
                password: "wrongpassword",
            };
            const response = await supertest(app).post("/api/v2/auth/login").send(invalidCredentials);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("status", "Error");
            expect(response.body).toHaveProperty("message", "Incorrect email or password");
        });
    });
});
