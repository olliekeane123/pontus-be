import logger from "../lib/logger"
import { ETLProgress, RunETLConfig } from "../types/etl/etl"
import { getETLConfig } from "./config/getETLConfig"
import { extractData } from "./extract"
import { importProgressFromFile } from "./lib/progress"
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

    try {
        for (const source of sources) {
            let progress: ETLProgress | null = null

            if (resume) {
                progress = await importProgressFromFile(source)
            }

            logger.info(`[ETL] Starting extraction for ${source}`)
            const rawData = await extractData(source, {
                progress,
                batchSize,
                concurrency,
                delayBetweenBatches,
                maxItems,
            })
        }
    } catch (error) {
        logger.error(`[ETL] Error in ETL process: ${error}`)
        throw error
    }
}


runETL()