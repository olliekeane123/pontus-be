import {
    fetchArtworkById,
    fetchArtworkIds,
    fetchAllMetArtworks,
} from "../../etl/extract/extract-met-api"
import * as extractFns from "../../etl/extract/extract-met-api"
import apiClient from "../../etl/lib/apiClient"

jest.mock("../../etl/lib/apiClient")

describe("fetchArtworkIds", () => {
    test("returns an array of numbers from the API", async () => {
        // Arrange: Set up the mock
        const mockIds = [123, 456, 789]
        ;(apiClient.get as jest.Mock).mockResolvedValue({
            data: { objectIDs: mockIds },
        })

        // Act: Call the function
        const result = await fetchArtworkIds()

        // Assert:
        // 1. Did it call the API correctly?
        expect(apiClient.get).toHaveBeenCalledWith(
            "https://collectionapi.metmuseum.org/public/collection/v1/search?dateBegin=1860&dateEnd=1980&hasImages=true&q=*"
        )

        // 2. Did it return the expected data?
        expect(result).toEqual(mockIds)

        // 3. Are all elements numbers?
        if (result) {
            result.forEach((id) => expect(typeof id).toBe("number"))
        }
    })
})

describe("fetchArtworkById", () => {
    test("returns artwork data", async () => {
        // Arrange: Set up the mock
        const mockArtwork = { objectID: 1, title: "Test Artwork" }
        ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockArtwork })

        // Act: Call the function
        const result = await fetchArtworkById(1)

        // Assert:
        // 1. Did it call the API correctly?
        expect(apiClient.get).toHaveBeenCalledWith(
            "https://collectionapi.metmuseum.org/public/collection/v1/objects/1"
        )

        // 2. Did it return the expected data?
        expect(result).toEqual(mockArtwork)
    })

    // test("if error ")

    
})

describe("fetchAllMetArtworks", () => {
    test("fetches artworks using ids from fetchArtworkIds", async () => {
        const mockIds = [1, 2]
        const mockArtworks = [
            { objectID: 1, title: "Art 1" },
            { objectID: 2, title: "Art 2" },
        ]

        jest.spyOn(extractFns, "fetchArtworkIds").mockResolvedValue(mockIds)
        jest.spyOn(extractFns, "fetchArtworkById").mockImplementation(
            (id: number) => {
                return Promise.resolve(
                    mockArtworks.find((a) => a.objectID === id) || null
                )
            }
        )

        const result = await fetchAllMetArtworks()

        expect(result).toEqual(mockArtworks)
        expect(extractFns.fetchArtworkIds).toHaveBeenCalledTimes(1)
        expect(extractFns.fetchArtworkById).toHaveBeenCalledTimes(2)
        expect(extractFns.fetchArtworkById).toHaveBeenCalledWith(1)
        expect(extractFns.fetchArtworkById).toHaveBeenCalledWith(2)
    })
})
