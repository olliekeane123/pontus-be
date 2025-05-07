import axios, { type AxiosResponse, type AxiosInstance, type AxiosError } from "axios"
import ApiError from "../../types/external-api/ApiError"

const apiClient: AxiosInstance = axios.create({
    timeout: 5000,
    headers: {
        Accept: "application/json",
    },
})

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        let rejectedError: ApiError 

        if (error.response) {
            rejectedError = {
                message: (error.response.data as any)?.message || "External API error",
                statusCode: error.response.status,
                details: error.response.data,
            }
        } else if (error.request) {
            rejectedError = {
                message: 'No response from external API',
                statusCode: 503,
                details: error.request 
            }
        } else {
            rejectedError = {
                message: error.message,
                statusCode: 500,
                details: error.config
            }
        }

        return Promise.reject(rejectedError)
    }
)

export default apiClient
