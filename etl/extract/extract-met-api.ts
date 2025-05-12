import apiClient from "../lib/apiClient"
import { MetArtwork } from "../../types/etl/MET"
import logger from "../../lib/logger"
import getErrorMessage from "../../lib/getErrorMessage"
import isRetryable from "../lib/isRetryable"
import sleep from "../lib/sleep"

export const config = {
    MET_BASE_URL: "https://collectionapi.metmuseum.org/public/collection/v1/",
    MET_ARTWORK_IDS_QUERY:
        "search?dateBegin=1860&dateEnd=1980&hasImages=true&q=*",
    MAX_RETRIES: 4,
    RETRY_DELAY: 1000,
    BATCH_SIZE: 50,
    CONCURRENT_REQUESTS: 5,
    REQUEST_DELAY: 100,
}

export const fetchAllMetArtworks = async (): Promise<(MetArtwork | null)[]> => {
    try {
        const ids = await fetchArtworkIds()

        const allArtworks = await Promise.all(
            ids.map((id) => fetchArtworkById(id))
        )

        return allArtworks
    } catch (error) {
        throw new Error(
            `[MET] Unexpected error in fetchAllArtworks: ${getErrorMessage(
                error
            )}`
        )
    }
}

export const fetchArtworkIds = async (retries = 0): Promise<number[]> => {
    try {
        const response = await apiClient.get(
            config.MET_BASE_URL + config.MET_ARTWORK_IDS_QUERY
        )
        const ids = response.data.objectIDs
        if (!Array.isArray(ids)) {
            throw new Error(
                `[MET] Response does not contain valid objectIDs array`
            )
        }
        return ids
    } catch (error) {
        const errorMessage = getErrorMessage(error)
        if (isRetryable(errorMessage, retries)) {
            const delayTime = config.RETRY_DELAY * Math.pow(2, retries)
            logger.info(
                `[MET] Retrying fetch Artwork IDs after ${delayTime}ms (attempt ${
                    retries + 1
                }/${config.MAX_RETRIES})`
            )
            sleep(delayTime)
            fetchArtworkIds(retries + 1)
        }
        throw new Error(`[MET] Error fetching artwork ID's: ${errorMessage}`)
    }
}

export const fetchArtworkById = async (
    id: number,
    retries = 0
): Promise<MetArtwork | null> => {
    try {
        const response = await apiClient.get(
            config.MET_BASE_URL + `objects/${id}`
        )
        return response.data
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error)
        if (isRetryable(errorMessage, retries)) {
            const delayTime = config.RETRY_DELAY * Math.pow(2, retries)
            logger.info(
                `[MET] Retrying artwork ${id} after ${delayTime}ms (attempt ${
                    retries + 1
                }/${config.MAX_RETRIES})`
            )
            sleep(delayTime)
            fetchArtworkById(id, retries + 1)
        }
        logger.warn(`[MET] Error fetching artwork ${id}: ${errorMessage}`)
        return null
    }
}

export const processInBatches = async <T, R>(
    items: T[],
    processFn: (item: T) => Promise<R>,
    batchSize = config.BATCH_SIZE,
    concurrency = config.CONCURRENT_REQUESTS
): Promise<R[]> => {
    const results: R[] = []

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
    }

    return results
}
