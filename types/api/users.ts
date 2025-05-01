export type BaseUser = {
    username: string
    password: string
}

export type UserListResponse = BaseUser & {
    user_id: number
}

export type UsersResponse = {
    users: UserListResponse[]
}
