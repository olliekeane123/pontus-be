import getErrorMessage from "../../lib/getErrorMessage"
import logger from "../../lib/logger"
import {
    AicArtwork,
    AicGetArtworksResponse,
    ETLProgress,
} from "../../types/etl/etl"
import apiClient from "../lib/apiClient"
import { processInBatches } from "../lib/batch-processor"
import isRetryable from "../lib/isRetryable"
import { saveProgress } from "../lib/progress"
import sleep from "../lib/sleep"

const AIC_BASE_URL = "https://api.artic.edu/api/v1/artworks/"
const AIC_ARTWORK_IDS_QUERY =
    "search?query[bool][must][0][range][date_start][gte]=1860&query[bool][must][0][range][date_start][lte]=1980"
const AIC_PAGE_LIMIT = 50

export const extractAicArtworks = async (options: {
    progress: ETLProgress | null
    batchSize: number
    concurrency: number
    delayBetweenBatches: number
    maxItems?: number
}): Promise<(AicArtwork | null)[]> => {
    const { progress, batchSize, concurrency, delayBetweenBatches, maxItems } =
        options
    try {
        let currentProgress: ETLProgress

        if (progress) {
            currentProgress = progress
            logger.info(
                `[AIC] Resuming extraction. Total IDs: ${currentProgress.totalIds}, Already processed: ${currentProgress.processedIds.length}, Failed: ${currentProgress.failedIds.length}`
            )
        } else {
            const ids = await fetchArtworkIds(maxItems)
            currentProgress = {
                source: "AIC",
                totalIds: ids.length,
                allIds: ids,
                processedIds: [],
                failedIds: [],
                results: new Array(ids.length).fill(null),
            }
            logger.info(
                `[AIC] Starting new extraction with ${ids.length} artwork IDs`
            )

            await saveProgress("AIC", currentProgress)
        }

        const idsToProcess = currentProgress.allIds.filter(
            (id) => !currentProgress.processedIds.includes(id)
        )

        if (idsToProcess.length === 0) {
            logger.info(
                `[AIC] All ${currentProgress.totalIds} artworks have been processed already`
            )
            return currentProgress.results
        }

        logger.info(
            `[AIC] Processing ${idsToProcess.length} remaining artworks`
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
                await saveProgress("AIC", currentProgress)

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
                    `[AIC] Progress: ${processedCount}/${currentProgress.totalIds} (${progressPercent}%) processed. Success: ${successCount}, Failed: ${failedCount}`
                )
            },
        })

        await saveProgress("AIC", currentProgress)

        logger.info(
            `[AIC] Extraction complete. Total: ${
                currentProgress.totalIds
            }, Successful: ${
                currentProgress.results.filter((result) => result !== null)
                    .length
            }, Failed: ${currentProgress.failedIds.length}`
        )

        return currentProgress.results
    } catch (error) {
        logger.error(
            `[AIC] Unexpected error in extractAicArtworks: ${getErrorMessage(
                error
            )}`
        )
        throw new Error(
            `[AIC] Unexpected error in extractAicArtworks: ${getErrorMessage(
                error
            )}`
        )
    }
}

export const fetchArtworkIds = async (maxItems?: number): Promise<number[]> => {
    try {
        const ids: number[] = []

        let totalNumArtworks: number = 0
        let totalNumPages: number = 0
        let totalNumFailed: number = 0

        const response: AicGetArtworksResponse = await apiClient.get(
            AIC_BASE_URL + AIC_ARTWORK_IDS_QUERY + `&limit=${AIC_PAGE_LIMIT}`
        )

        if (
            response.data.pagination.total &&
            response.data.pagination.total_pages &&
            response.data.pagination.total > 0
        ) {
            totalNumArtworks = response.data.pagination.total
            totalNumPages = response.data.pagination.total_pages
        } else {
            throw new Error(
                `[AIC] Response does not contain any listed artworks, issue with query`
            )
        }

        logger.info(
            `[AIC] Starting extraction of paginated artwork IDs: Total: ${totalNumArtworks}, Total Pages: ${totalNumPages}`
        )

        for (let i = 0; i < totalNumPages; i++) {
            if (maxItems && ids.length >= maxItems) {
                break
            }

            try {
                const response: AicGetArtworksResponse = await apiClient.get(
                    AIC_BASE_URL +
                        AIC_ARTWORK_IDS_QUERY +
                        `&limit=${AIC_PAGE_LIMIT}` +
                        `&page=${i + 1}`
                )

                const artworkOverviews = response.data.data

                for (let j = 0; j < artworkOverviews.length; j++) {
                    if (maxItems && ids.length >= maxItems) {
                        break
                    }
                    ids.push(artworkOverviews[j].id)
                }

                if (i > 0 && i % 100 === 0) {
                    logger.info(
                        `[AIC] Page: ${
                            i + 1
                        }/${totalNumPages}, Succesfully extracted: ${
                            ids.length
                        }/${totalNumArtworks}, Failed page extractions: ${totalNumFailed}`
                    )
                }
            } catch (error) {
                logger.warn(
                    `[AIC] Error extracting artwork IDs on page ${
                        i + 1
                    }: ${getErrorMessage(error)}`
                )
            }

            await sleep(2000)
        }

        logger.info(`[AIC] Successfully fetched ${ids.length} artwork IDs`)

        return ids
    } catch (error) {
        logger.error(
            `[AIC] Error fetching artwork IDs: ${getErrorMessage(error)}`
        )
        throw new Error(
            `[AIC] Error fetching artwork IDs: ${getErrorMessage(error)}`
        )
    }
}


export const fetchArtworkById = async (
    id: number,
    retries = 0
): Promise<AicArtwork | null> => {
    const MAX_RETRIES = 3
    const RETRY_DELAY = 1000

    try {
        const response = await apiClient.get(AIC_BASE_URL + `${id}`)
        return response.data
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error)

        if (isRetryable(errorMessage) && retries < MAX_RETRIES) {
            const delayTime = RETRY_DELAY * Math.pow(2, retries)
            logger.info(
                `[AIC] Retrying artwork ${id} after ${delayTime}ms (attempt ${
                    retries + 1
                }/${MAX_RETRIES})`
            )
            await sleep(delayTime)
            return fetchArtworkById(id, retries + 1)
        }

        logger.warn(`[AIC] Error fetching artwork ${id}: ${errorMessage}`)
        return null
    }
}
