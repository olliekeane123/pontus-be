import request from "supertest"
import { type Express } from "express"
import createApp from "../../app/app"
import seed from "../../seeds/seed"
import * as testData from "../../data/test-data/index"
import db from "../../db/connection"
import endpoints from "../../endpoints.json"

let app: Express

beforeAll(async () => {
    await seed(testData).catch(console.error)
    app = createApp()
})

afterAll(async () => {
    await db.end().catch(console.error)
})

describe("GET /api", () => {
    test("200: Responds with an object detailing the documentation for each endpoint", async () => {
        const res = await request(app).get("/api")
        expect(res.status).toBe(200)
        expect(res.body).toEqual({ endpoints })
    })
})

describe("GET /api/health", () => {
    test("200: Responds with status OK", async () => {
        const res = await request(app).get("/api/health")
        expect(res.status).toBe(200)
        expect(res.body.status).toBe("OK")
    })
})
