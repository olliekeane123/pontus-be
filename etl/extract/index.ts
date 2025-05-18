import { ArtworkSource, ETLProgress } from "../../types/etl/etl"
import { extractAicArtworks } from "./aic-extract"
import { extractMetArtworks } from "./met-extract"

export const extractData = async (
    source: ArtworkSource,
    options: {
        progress: ETLProgress | null
        batchSize: number
        concurrency: number
        delayBetweenBatches: number
        maxItems?: number
    }
): Promise<any[]> => {
    switch (source) {
        case "MET":
            return extractMetArtworks(options)
        case "AIC":
            return extractAicArtworks(options)
        default:
            throw new Error(`Unsupported data source: ${source}`)
    }
}
