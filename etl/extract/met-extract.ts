import getErrorMessage from "../../lib/getErrorMessage"
import logger from "../../lib/logger"
import { ETLProgress } from "../../types/etl/etl"
import { MetArtwork } from "../../types/etl/etl"
import apiClient from "../lib/apiClient"
import { processInBatches } from "../lib/batch-processor"
import isRetryable from "../lib/isRetryable"
import { saveProgress } from "../lib/progress"
import sleep from "../lib/sleep"

const MET_BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1/"
const MET_ARTWORK_IDS_QUERY =
    "search?dateBegin=1860&dateEnd=1980&hasImages=true&q=*"

export const extractMetArtworks = async (options: {
    progress: ETLProgress | null
    batchSize: number
    concurrency: number
    delayBetweenBatches: number
    maxItems?: number
}): Promise<(MetArtwork | null)[]> => {
    const { progress, batchSize, concurrency, delayBetweenBatches, maxItems } =
        options

    try {
        let currentProgress: ETLProgress

        if (progress) {
            currentProgress = progress
            logger.info(
                `[MET] Resuming extraction. Total IDs: ${currentProgress.totalIds}, Already processed: ${currentProgress.processedIds.length}, Failed: ${currentProgress.failedIds.length}`
            )
        } else {
            const ids = await fetchArtworkIds(maxItems)
            currentProgress = {
                source: "MET",
                totalIds: ids.length,
                allIds: ids,
                processedIds: [],
                failedIds: [],
                results: new Array(ids.length).fill(null),
            }
            logger.info(
                `[MET] Starting new extraction with ${ids.length} artwork IDs`
            )

            await saveProgress("MET", currentProgress)
        }

        const idsToProcess = currentProgress.allIds.filter(
            (id) => !currentProgress.processedIds.includes(id)
        )

        if (idsToProcess.length === 0) {
            logger.info(
                `[MET] All ${currentProgress.totalIds} artworks have been processed already`
            )
            return currentProgress.results
        }

        logger.info(
            `[MET] Processing ${idsToProcess.length} remaining artworks`
        )

        await processInBatches({
            items: idsToProcess,
            processFn: async (id) => {
                const artwork = await fetchArtworkById(id)

                // Update progress
                const index = currentProgress.allIds.indexOf(id)
                if (index >= 0) {
                    currentProgress.results[index] = artwork
                    currentProgress.processedIds.push(id)
                    if (artwork === null) {
                        currentProgress.failedIds.push(id)
                    }
                }

                return artwork
            },
            batchSize,
            concurrency,
            delayBetweenBatches,
            onBatchComplete: async (batch, results) => {
                await saveProgress("MET", currentProgress)

                // Log progress
                const processedCount = currentProgress.processedIds.length
                const successCount = currentProgress.results.filter(
                    (result) => result !== null
                ).length
                const failedCount = currentProgress.failedIds.length
                const progressPercent = (
                    (processedCount / currentProgress.totalIds) *
                    100
                ).toFixed(2)

                logger.info(
                    `[MET] Progress: ${processedCount}/${currentProgress.totalIds} (${progressPercent}%) processed. Success: ${successCount}, Failed: ${failedCount}`
                )
            },
        })

        await saveProgress("MET", currentProgress)

        logger.info(
            `[MET] Extraction complete. Total: ${
                currentProgress.totalIds
            }, Successful: ${
                currentProgress.results.filter((result) => result !== null)
                    .length
            }, Failed: ${currentProgress.failedIds.length}`
        )

        return currentProgress.results
    } catch (error) {
        logger.error(
            `[MET] Unexpected error in extractMetArtworks: ${getErrorMessage(
                error
            )}`
        )
        throw new Error(
            `[MET] Unexpected error in extractMetArtworks: ${getErrorMessage(
                error
            )}`
        )
    }
}

export const fetchArtworkIds = async (maxItems?: number): Promise<number[]> => {
    try {
        const response = await apiClient.get(
            MET_BASE_URL + MET_ARTWORK_IDS_QUERY
        )
        const ids = response.data.objectIDs

        if (!Array.isArray(ids)) {
            throw new Error(
                `[MET] Response does not contain valid objectIDs array`
            )
        }

        logger.info(`[MET] Successfully fetched ${ids.length} artwork IDs`)

        return maxItems ? ids.slice(0, maxItems) : ids
    } catch (error) {
        logger.error(
            `[MET] Error fetching artwork IDs: ${getErrorMessage(error)}`
        )
        throw new Error(
            `[MET] Error fetching artwork IDs: ${getErrorMessage(error)}`
        )
    }
}

export const fetchArtworkById = async (
    id: number,
    retries = 0
): Promise<MetArtwork | null> => {
    const MAX_RETRIES = 3
    const RETRY_DELAY = 1000

    try {
        const response = await apiClient.get(MET_BASE_URL + `objects/${id}`)
        return response.data
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error)

        if (isRetryable(errorMessage) && retries < MAX_RETRIES) {
            const delayTime = RETRY_DELAY * Math.pow(2, retries)
            logger.info(
                `[MET] Retrying artwork ${id} after ${delayTime}ms (attempt ${
                    retries + 1
                }/${MAX_RETRIES})`
            )
            await sleep(delayTime)
            return fetchArtworkById(id, retries + 1)
        }

        logger.warn(`[MET] Error fetching artwork ${id}: ${errorMessage}`)
        return null
    }
}
