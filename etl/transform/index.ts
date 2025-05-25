import { AicArtist, AicArtwork, AicImageUrls, ArtworkSource, MetArtwork, TransformedArtwork } from "../../types/etl/etl"
import { transformAicArtworks } from "./aic-transform"
import { transformMetArtworks } from "./met-transform"


export const transformData = async (
    source: ArtworkSource,
    rawData: (MetArtwork | (AicArtwork & { artists: AicArtist[]; imageUrls: AicImageUrls }))[]
): Promise<TransformedArtwork[]> => {
    switch (source) {
        case "MET":
            return transformMetArtworks(rawData as MetArtwork[])
        case "AIC":
            return transformAicArtworks(rawData as (AicArtwork & { artists: AicArtist[]; imageUrls: AicImageUrls })[])
        default:
            throw new Error(`Unsupported data source: ${source}`)
    }
}
