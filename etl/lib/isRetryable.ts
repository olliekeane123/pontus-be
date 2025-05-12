import { config } from "../extract/extract-met-api"



const isRetryable = (errorMessage: string, retries: number): boolean => {
    return (errorMessage.includes('timeout') ||
    errorMessage.includes('429') ||
    errorMessage.includes('5')) && retries < config.MAX_RETRIES
}

export default isRetryable