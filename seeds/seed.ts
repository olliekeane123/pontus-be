import { db } from '../db/connection'
import format from 'pg-format'
import SeedData from '../types/SeedData'

const seed = async ({users}: SeedData) => {
    await db.query('DROP TABLE IF EXISTS users')
    await db.query(`CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(25) NOT NULL,
        password VARCHAR(30) NOT NULL
        );`)

    const insertUsersQueryStr = format(`INSERT INTO users (username, password) VALUES %L`, users.map(({username, password}) => [username, password]))
    await db.query(insertUsersQueryStr)
}

export default seed