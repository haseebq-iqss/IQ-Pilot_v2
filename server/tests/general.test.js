const supertest = require("supertest")
const app = require("../app")
describe("General API Tests", () => {
    it("should return 200 OK", async () => {
        const response = await supertest(app).get("/ping")
        expect(response.status).toBe(200)
    })

    it("should return an object", async () => {
        const response = await supertest(app).get("/ping")
        expect(response.body).toBeInstanceOf(Object)
    })

    it("should return an success message", async () => {
        const response = await supertest(app).get("/ping")
        expect(response.body.message).toBe("Server is up and running")
    })
})