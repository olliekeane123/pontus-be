import * as devData from '../data/dev-data/index'
import seed from "./seed";
import db from "../db/connection";

const runSeed = async () => {
    try {
        await seed(devData)
        await db.end()
    } catch (error) {
        throw error
    }
}

runSeed();
