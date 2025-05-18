const isRetryable = (errorMessage: string): boolean => {
    return (
        errorMessage.includes("timeout") ||
        errorMessage.includes("429") ||
        errorMessage.includes("5")
    )
}

export default isRetryable
