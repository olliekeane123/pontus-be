import logger from "../lib/logger"
import { ETLProgress, RunETLConfig } from "../types/etl/etl"
import { getETLConfig } from "./config/getETLConfig"
import sleep from "./lib/sleep"

export const runETL = async (
    options: RunETLConfig = getETLConfig()
): Promise<void> => {
    const {
        sources,
        resume,
        batchSize,
        concurrency,
        delayBetweenBatches,
        maxItems,
    } = options

    logger.info(
        `[ETL] Starting ETL process with options: ${JSON.stringify({
            sources,
            resume,
            batchSize,
            concurrency,
            delayBetweenBatches,
            maxItems,
        })}`
    )

    for (const source of sources) {
        let progress: ETLProgress | null = null

        if (resume) {
            progress = importProgressFromFile(source)
        }
    }
}

runETL()
