import { config } from "dotenv"
export type RunETLConfig = {
    sources: ArtworkSource[]
    resume: boolean
    batchSize: number
    concurrency: number
    delayBetweenBatches: number
    maxItems?: number
}

export type ArtworkSource = "MET" | "AIC"

export type ETLProgress = {
    source: ArtworkSource
    totalIds: number
    allIds: number[]
    processedIds: number[]
    failedIds: number[]
    results: any[]
}

export type MetArtwork = {
    objectID?: number
    title?: string
    artistDisplayName?: string
    artistDisplayBio?: string
    objectDate?: string
    medium?: string
    primaryImage?: string
    primaryImageSmall?: string
    objectURL?: string
    department?: string
    isHighlight?: boolean
    isPublicDomain?: boolean
    [key: string]: any
}

export type AicGetArtworksResponse = {
    data: {
        pagination: {
            total: number
            limit: number
            offset: number
            total_pages: number
            current_page: number
        }
        data: AicArtworkOverview[]
        [key: string]: any
    }
}

export type AicArtworkOverview = {
    score: number
    id: number
    [key: string]: any
}

export type AicArtwork = {
    id?: number
    title?: string
    artist_title?: string
    artist_disiplay?: string
    artist_id?: number
    artist_ids?: number[]
    description?: string
    short_description?: string
    date_display?: string
    technique_titles?: string[]
    image_id?: string
    alt_image_ids?: string[]
    config?: {
        iiif_url?: string
        website_url?: string
    }
    [key: string]: any
    // Concatenated data
    artists?: AicArtist[]
    imageUrls?: AicImageUrls
}

export type AicArtist = {
    id: number
    title?: string
    sort_title?: string
    alt_titles?: string[]
    is_artist?: boolean
    birth_date?: number
    death_date?: number
}

export type AicImageUrls = {
    primaryImage: string | null
    altImages: string[]
}


export type TransformedArtwork = {
    id: string
    source: ArtworkSource
    title: string
    artists: TransformedArtworkArtist[]

    // Creation details
    dateCreated?: string // Human-readable date (e.g., "c. 1503-1506")
    beginYear?: number // Start year (for date ranges)
    endYear?: number // End year (for date ranges)

    // Physical attributes
    medium?: string // Material/technique (e.g., "Oil on canvas")
    dimensions?: {
        height?: number // Height in cm
        width?: number // Width in cm
        depth?: number // Depth in cm for 3D works
        unit?: string // Unit of measurement, default "cm"
    }

    // Classification & categorization
    department?: string // Museum department
    classification?: string // Type of artwork (e.g., "Paintings", "Sculpture")
    culture?: string // Culture of origin
    period?: string // Period or style

    // Location & display
    isOnDisplay?: boolean // Whether artwork is currently on display
    gallery?: string // Current gallery location
    accessionNumber?: string // Museum's internal cataloging number

    // Media
    primaryImageUrl: string // Main image URL
    additionalImageUrls?: string[] // Additional image URLs

    // Descriptive content
    description?: string // Full description text
    provenance?: string // History of ownership

    // Links
    objectUrl?: string // URL to view this object on museum website

    // Administrative
    creditLine?: string // Credit line text
    acquisitionYear?: number // Year acquired by the museum

    // Additional metadata
    tags?: string[]
    rights?: string
}


export type TransformedArtworkArtist = {
    name: string 
    birthDate?: number 
    deathDate?: number
    nationality?: string
}