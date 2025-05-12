import { MetArtwork } from "../../types/etl/MET"

const transformMetArtworks = (rawMetArtworks: MetArtwork[]) => {
    rawMetArtworks.map((artwork) => {
        return {
            title: artwork.title,
            image: artwork.primaryImage,
        }
    })
}
