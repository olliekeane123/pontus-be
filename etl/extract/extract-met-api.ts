import apiClient from "../lib/apiClient"
import { MetArtwork } from "../../types/external-api/met-api"
import logger from "../../lib/logger"
import getErrorMessage from "../../lib/getErrorMessage"

const MET_BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1/"
const MET_ARTWORK_IDS_QUERY =
    "search?dateBegin=1860&dateEnd=1980&hasImages=true&q=*"

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

export const fetchArtworkIds = async (): Promise<number[]> => {
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
        return ids
    } catch (error) {
        throw new Error(
            `[MET] Error fetching artwork ID's: ${getErrorMessage(error)}`
        )
    }
}

export const fetchArtworkById = async (
    id: number
): Promise<MetArtwork | null> => {
    try {
        const response = await apiClient.get(MET_BASE_URL + `objects/${id}`)
        return response.data
    } catch (error: unknown) {
        logger.warn(
            `[MET] Error fetching artwork ${id}: ${getErrorMessage(error)}`
        )
        return null
    }
}
