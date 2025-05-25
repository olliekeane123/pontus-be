import { MetArtwork, TransformedArtwork } from "../../types/etl/etl"
import { isValidStringValue } from "../lib/isValidStringValue"

export const transformMetArtworks = async (
    rawData: MetArtwork[]
): Promise<TransformedArtwork[]> => {
    const isValidArtwork = (
        artwork: MetArtwork
    ): artwork is MetArtwork & {
        title: string
        primaryImage: string
        artistDisplayName: string
    } => {
        if (!artwork) return false

        const checklist = [
            artwork.title,
            artwork.primaryImage,
            artwork.artistDisplayName,
        ]

        return checklist.every(isValidStringValue)
    }

    const filteredData = rawData.filter(isValidArtwork)

    const mappedData = filteredData.map((artwork): TransformedArtwork => {
        return {
            id: `MET-${artwork.objectID}`,
            source: "MET",
            title: artwork.title,
            artists: [
                {
                    name: artwork.artistDisplayName,
                    birthDate: artwork.artistBeginDate,
                    deathDate: artwork.artistEndDate,
                    nationality: artwork.artistNationality,
                },
            ],
            primaryImageUrl: artwork.primaryImage,
            additionalImageUrls: artwork.additionalImages,
            objectUrl: artwork.objectURL,
        }
    })

    return mappedData
}
