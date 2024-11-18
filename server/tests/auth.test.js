const supertest = require("supertest");
const app = require("../app");
const { default: mongoose } = require("mongoose");

describe("Auth API Tests", () => {

    beforeAll(async () => {
        const DB_URI = process.env.MONGO_URI
        // console.log(DB_URI)
        await mongoose.connect(DB_URI);
      });

    describe("Signup Routes", () => {
        it("Should return 400 if no body is passed", async () => {
            const response = await supertest(app).post("/api/v2/auth/signup").send({})
            expect(response.status).toBe(400)
        })
        it("Should return 400 if an incomplete body is sent", async () => {
            const singupBody = {
                email: "test@test.com",
                fname: "Haseeb",
                lname: "Qureshi",
                password: "password123"
            }
            const response = await supertest(app).post("/api/v2/auth/signup").send(singupBody)
            expect(response.status).toBe(400)
        })
        it("Should return 400 if a duplicate user is sent", async () => {
            const singupBody =
            {
                "fname": "Aamir",
                "lname": "Buchh",
                "password": "$2a$12$w5GMgvcevksmIg50VsOYeeYmT2Q9wboLBCaCKGtf2aMRj4lmAfBI6",
                "phone": "7889806741",
                "email": "adam.buchh@iquasar.com",
                "role": "employee",
                "department": "Proposal Development",
                "pickUp": {
                    "type": "Point",
                    "coordinates": [
                        34.016607,
                        74.802994
                    ],
                    "address": "H.no.29, Lane-D, Fair Banks Colony, Rawalpora, Srinagar, Kashmir",
                    "_id": {
                        "$oid": "66fe7cebd99c3dc6da876345"
                    }
                },
                "isCabCancelled": true,
                "currentShift": "14:00-23:00",
                "workLocation": "Rangreth",
                "createdAt": {
                    "$date": "2024-10-03T11:15:55.902Z"
                },
                "updatedAt": {
                    "$date": "2024-11-05T11:26:52.652Z"
                },
                "__v": 0,
                "profilePicture": "aamir_buchh_1730806012650.jpg"
            }
            const response = await supertest(app).post("/api/v2/auth/signup").send(singupBody)
            expect(response.status).toBe(400)
        })
        // THIS TEST FAILS !
        it("Should return 201 if a valid new user is sent", async () => {
            const userData = {
                "fname": "Supertest",
                "lname": "User - 0001",
                "password": "testPassword123",
                "phone": "7889806000",
                "email": "supertest.user0001@iquasar.com",
                "role": "employee",
                "department": "Proposal Development",
                "pickUp": {
                    "type": "Point",
                    "coordinates": [34.016407, 74.802994],
                    "address": "H.no.29, Lane-D, Fair Banks Colony, Rawalpora, Srinagar, Kashmir"
                },
                "isCabCancelled": false,
                "currentShift": "14:00-23:00",
                "workLocation": "Rangreth"
            };
        
            const response = await supertest(app)
                .post("/api/v2/auth/signup")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .send(userData);
        
            // console.log("RESPONSE ------------>", response.body);
        
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Created Successfully");
        });
        
    })

    describe("Login Routes", () => {
        it("Should return 400 if no body is passed", async () => {
            const response = await supertest(app).post("/api/v2/auth/login").send({})
            console.log(response)
            expect(response.status).toBe(400)
        })
    })
})