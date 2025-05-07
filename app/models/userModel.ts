import db from "../../db/connection"
import format from 'pg-format'

export const findAllUsers = async () => {
    const query = `SELECT * FROM users`

    const { rows } = await db.query(query)

    return rows
}