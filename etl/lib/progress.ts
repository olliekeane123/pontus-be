import path from "node:path"
import { ArtworkSource, ETLProgress } from "../../types/etl/etl"
import fs from "node:fs/promises"
import logger from "../../lib/logger"

const PROGRESS_DIR = path.join(process.cwd(), "etl", "progress")

export const saveProgress = async (
    source: ArtworkSource,
    progress: ETLProgress
): Promise<void> => {
    try {
        await fs.mkdir(PROGRESS_DIR, { recursive: true })

        const progressFile = getProgressFilePath(source)
        await fs.writeFile(
            progressFile,
            JSON.stringify(progress, null, 2),
            "utf8"
        )

        logger.debug(`[ETL] Progress saved to ${progressFile}`)
    } catch (error) {
        logger.error(`[ETL] Failed to save progress: ${error}`)
    }
}

export const importProgressFromFile = async (
    source: ArtworkSource
): Promise<ETLProgress | null> => {
    try {
        const progressFile = getProgressFilePath(source)
        const exists = await fileExists(progressFile)

        if (!exists) {
            logger.info(`[ETL] No progress file found for ${source}`)
            return null
        }

        const data = await fs.readFile(progressFile, "utf8")
        const progress: ETLProgress = JSON.parse(data)

        logger.info(
            `[ETL] Loaded progress for ${source}. Total IDs: ${progress.totalIds}, Processed: ${progress.processedIds.length}, Failed: ${progress.failedIds.length}`
        )

        return progress
    } catch (error) {
        logger.warn(`[ETL] Failed to load progress for ${source}: ${error}`)
        return null
    }
}


const getProgressFilePath = (source: ArtworkSource): string => {
    return path.join(PROGRESS_DIR, `${source.toLowerCase()}-progress.json`)
}

const fileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
}
