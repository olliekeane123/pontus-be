type ApiError = {
    message: string,
    statusCode: number,
    details?: unknown
}

export default ApiError