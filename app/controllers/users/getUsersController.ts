import { Request, Response, NextFunction } from 'express';
import getUsersService from '../../services/users/getUsersService';

const getUsersController = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const users = await getUsersService()
        res.status(200).send({users})
    } catch (error) {
        res.status(500).send({error: 'Failed to fetch users'})
    }
}

export default getUsersController