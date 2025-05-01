import request from "supertest"
import { type Express } from "express"
import createApp from "../../src/app"
import seed from "../../seeds/seed"
import * as testData from "../../data/test-data/index"
import db from "../../db/connection"
import { UserListResponse, UsersResponse } from "../../types/api/users"

let app: Express

beforeAll(async () => {
    await seed(testData).catch(console.error)
    app = createApp()
})

afterAll(async () => {
    await db.end().catch(console.error)
})

describe("GET /api/users", () => {
    test("200: Responds with array of objects (users)", async () => {
        const res = await request(app).get("/api/users")
        expect(res.status).toBe(200)

        const { users }: UsersResponse = res.body
        users.forEach((user: UserListResponse) => {
            expect(user).toEqual<UserListResponse>({
                user_id: expect.any(Number),
                username: expect.any(String),
                password: expect.any(String),
            })
        })
    })
})
