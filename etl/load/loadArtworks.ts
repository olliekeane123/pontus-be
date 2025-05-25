import logger from "../../lib/logger"
import { ArtworkSource, TransformedArtwork } from "../../types/etl/etl"
import sleep from "../lib/sleep"

export const loadArtworks = async (
    source: ArtworkSource,
    artworks: TransformedArtwork[]
): Promise<void> => {
    try {
        logger.info(
            `[LOAD] Starting database load for ${artworks.length} ${source} artworks`
        )

        if (artworks.length === 0) {
            logger.warn(`[LOAD] No valid ${source} artworks to load`)
            return
        }

        const CHUNK_SIZE = 100
        for (let i = 0; i < artworks.length; i += CHUNK_SIZE) {
            const chunk = artworks.slice(i, i + CHUNK_SIZE)
            await loadArtworkChunk(source, chunk)

            // Log progress
            const processedCount = Math.min(i + CHUNK_SIZE, artworks.length)
            const percentage = (
                (processedCount / artworks.length) *
                100
            ).toFixed(1)
            logger.info(
                `[LOAD] Loaded ${processedCount}/${artworks.length} (${percentage}%) ${source} artworks`
            )

            // Short delay between chunks to avoid database pressure
            await sleep(100)
        }
    } catch (error) {
        logger.error(
            `[LOAD] Error loading ${source} artworks into database: ${error}`
        )
        throw error
    }
}

const loadArtworkChunk = async (
    source: ArtworkSource,
    artworks: TransformedArtwork[]
): Promise<void> => {
    
}
