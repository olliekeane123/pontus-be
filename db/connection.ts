import { Pool, type PoolConfig } from 'pg'
import { config } from 'dotenv'
import path from 'path'

const env = process.env.NODE_ENV || 'development'

config({
    path: path.resolve(__dirname, `../.env.${env}`)
})

const poolConfig: PoolConfig = {}

if (env === 'production') {
    poolConfig.connectionString = process.env.DATABASE_URL
    poolConfig.max = 2
}

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
    throw new Error("PGDATABASE or DATABASE_URL not set");
}
const db = new Pool(poolConfig)

export default db