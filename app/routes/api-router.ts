import { Router } from 'express'
import usersRouter from './sub-routes/users-router'
import getApiController from '../controllers/getApiController'

const router = Router()

router.get("/", getApiController)

router.get('/health', (req, res) => {
    res.send({status: 'OK'})
})

router.use("/users", usersRouter)

export default router
