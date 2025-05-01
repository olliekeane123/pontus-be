import { findAllUsers } from "../../models/userModel"

const getUsersService = async () => {
    return await findAllUsers()
}

export default getUsersService