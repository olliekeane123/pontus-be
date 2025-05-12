export type RunETLConfig = {
    sources: ArtworkSource[]
    resume?: boolean
    batchSize?: number
    concurrency?: number
    delayBetweenBatches?: number
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
