import { RunETLConfig } from "../../types/etl/etl"

export const getETLConfig = (): RunETLConfig => {
    const config: RunETLConfig = { sources: ["MET", "AIC"], resume: true }

    const env = process.env.NODE_ENV || "development"

    if (env === "test") {
        config.batchSize = 10
        config.concurrency = 2
        config.delayBetweenBatches = 100
        config.maxItems = 30
    } else if (env === "development") {
        ;(config.batchSize = 50), (config.concurrency = 5)
        config.delayBetweenBatches = 2000
        config.maxItems = 500
    } else if (env === "production") {
        ;(config.batchSize = 50), (config.concurrency = 5)
        config.delayBetweenBatches = 2000
    } else {
        throw new Error(
            `[ETL] Invalid NODE_ENV: '${env}'. Expected 'test', 'development', or 'production'`
        )
    }

    return config
}
