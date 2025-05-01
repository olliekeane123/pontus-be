import request from "supertest";
import app from "../src/app";

describe('GET /api/health', () => {
    test('200: Responds with status OK', async () => {
        const res = await request(app).get('/api/health')
        expect(res.status).toBe(200)
        expect(res.body.status).toBe('OK')
    })
})