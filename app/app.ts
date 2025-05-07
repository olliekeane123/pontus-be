import express, { type Express} from "express"
import apiRouter from "./routes/api-router"

const createApp = (): Express => {
    const app = express()

    app.use(express.json())

    app.use("/api", apiRouter)

    return app
}

export default createApp
