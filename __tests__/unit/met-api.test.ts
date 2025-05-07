import {
    fetchArtworkById,
    fetchArtworkIds,
} from "../../etl/extract/extract-met-api"
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
        const mockData = { objectID: 1, title: "Test Artwork" }
        ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockData })

        // Act: Call the function
        const result = await fetchArtworkById(1)

        // Assert:
        // 1. Did it call the API correctly?
        expect(apiClient.get).toHaveBeenCalledWith(
            "https://collectionapi.metmuseum.org/public/collection/v1/objects/1"
        )

        // 2. Did it return the expected data?
        expect(result).toEqual(mockData)
    })
})
