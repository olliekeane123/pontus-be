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
    artist_disiplay?: string
    description?: string
    short_description?: string
    date_display?: string
    technique_titles?: string[]
    image_id?: string
    [key: string]: any
}
