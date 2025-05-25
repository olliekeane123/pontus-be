import {
    AicArtist,
    AicArtwork,
    AicImageUrls,
    TransformedArtwork,
    TransformedArtworkArtist,
} from "../../types/etl/etl"
import { isValidStringValue } from "../lib/isValidStringValue"

export const transformAicArtworks = async (
    rawData: (AicArtwork & { artists: AicArtist[]; imageUrls: AicImageUrls })[]
): Promise<TransformedArtwork[]> => {
    const isValidArtwork = (
        artwork: AicArtwork & { artists: AicArtist[]; imageUrls: AicImageUrls }
    ): artwork is AicArtwork & {
        title: string
        artists: [{ title: string } & AicArtist, ...AicArtist[]]
        imageUrls: { primaryImage: string } & AicImageUrls
    } => {
        if (!Array.isArray(artwork.artists) || artwork.artists.length === 0)
            return false

        const checklist = [
            artwork.title,
            artwork.artists[0].title,
            artwork.imageUrls.primaryImage,
        ]

        return checklist.every(isValidStringValue)
    }

    const filteredData = rawData.filter(isValidArtwork)

    const mappedData = filteredData.map((artwork): TransformedArtwork => {
        return {
            id: `AIC-${artwork.id}`,
            source: "AIC",
            title: artwork.title,
            artists: artwork.artists.map(
                (artist): TransformedArtworkArtist => ({
                    name: artist.title!,
                    birthDate: artist.birth_date,
                    deathDate: artist.death_date,
                    nationality: undefined,
                })
            ),
            primaryImageUrl: artwork.imageUrls.primaryImage,
            additionalImageUrls: artwork.imageUrls.altImages
        }
    })

    return mappedData
}
