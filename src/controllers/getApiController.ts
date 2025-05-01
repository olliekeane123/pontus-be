import { Request, Response, NextFunction } from "express"
import endpoints from '../../endpoints.json'

const getApiController = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send({endpoints})
}

export default getApiController