/**
 * Google Books API Service
 * 
 * This service integrates with the Google Books API to fetch book information,
 * including cover images, descriptions, ratings, and other metadata.
 * 
 * API Documentation: https://developers.google.com/books/docs/v1/using
 */

const GOOGLE_BOOKS_API_BASE = "https://www.googleapis.com/books/v1"

// Optional: Add your API key here for higher rate limits
// Get a free API key from: https://console.cloud.google.com/apis/credentials
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || ""

export interface GoogleBookVolume {
	kind: string
	id: string
	volumeInfo: {
		title: string
		authors?: string[]
		publisher?: string
		publishedDate?: string
		description?: string
		pageCount?: number
		categories?: string[]
		averageRating?: number
		ratingsCount?: number
		imageLinks?: {
			smallThumbnail?: string
			thumbnail?: string
			small?: string
			medium?: string
			large?: string
		}
		language?: string
		previewLink?: string
		infoLink?: string
		industryIdentifiers?: Array<{
			type: string
			identifier: string
		}>
	}
}

export interface GoogleBooksSearchResponse {
	kind: string
	totalItems: number
	items?: GoogleBookVolume[]
}

/**
 * Search books by ISBN
 * This is the most accurate way to find a specific book
 * @param isbn - The ISBN-10 or ISBN-13 of the book
 * @returns Promise<GoogleBookVolume | null> - The book volume or null if not found
 */
export const searchBookByISBN = async (isbn: string): Promise<GoogleBookVolume | null> => {
	try {
		// Remove any hyphens or spaces from ISBN
		const cleanISBN = isbn.replace(/[-\s]/g, "")
		
		const url = `${GOOGLE_BOOKS_API_BASE}/volumes?q=isbn:${cleanISBN}${
			API_KEY ? `&key=${API_KEY}` : ""
		}`

		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`Google Books API error: ${response.statusText}`)
		}

		const data: GoogleBooksSearchResponse = await response.json()

		if (data.totalItems === 0 || !data.items || data.items.length === 0) {
			console.log(`No book found for ISBN: ${isbn}`)
			return null
		}

		// Return the first result (should be the most accurate match)
		return data.items[0]
	} catch (error) {
		console.error(`Error fetching book by ISBN ${isbn}:`, error)
		return null
	}
}

/**
 * Search books by title and/or author
 * @param query - The search query (can include title, author, etc.)
 * @param maxResults - Maximum number of results to return (default: 10, max: 40)
 * @returns Promise<GoogleBookVolume[]> - Array of matching book volumes
 */
export const searchBooks = async (
	query: string,
	maxResults: number = 10
): Promise<GoogleBookVolume[]> => {
	try {
		if (!query || query.trim() === "") {
			return []
		}

		// Limit maxResults to 40 (Google Books API limit)
		const limit = Math.min(maxResults, 40)

		const url = `${GOOGLE_BOOKS_API_BASE}/volumes?q=${encodeURIComponent(
			query
		)}&maxResults=${limit}${API_KEY ? `&key=${API_KEY}` : ""}`

		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`Google Books API error: ${response.statusText}`)
		}

		const data: GoogleBooksSearchResponse = await response.json()

		if (data.totalItems === 0 || !data.items) {
			console.log(`No books found for query: ${query}`)
			return []
		}

		return data.items
	} catch (error) {
		console.error(`Error searching books with query "${query}":`, error)
		return []
	}
}

/**
 * Search books by title
 * @param title - The book title
 * @param maxResults - Maximum number of results to return
 * @returns Promise<GoogleBookVolume[]> - Array of matching book volumes
 */
export const searchBooksByTitle = async (
	title: string,
	maxResults: number = 10
): Promise<GoogleBookVolume[]> => {
	return searchBooks(`intitle:${title}`, maxResults)
}

/**
 * Search books by author
 * @param author - The author name
 * @param maxResults - Maximum number of results to return
 * @returns Promise<GoogleBookVolume[]> - Array of matching book volumes
 */
export const searchBooksByAuthor = async (
	author: string,
	maxResults: number = 10
): Promise<GoogleBookVolume[]> => {
	return searchBooks(`inauthor:${author}`, maxResults)
}

/**
 * Get the best available cover image URL for a book
 * @param volume - The Google Book volume
 * @returns string - URL of the cover image or a placeholder
 */
export const getCoverImageUrl = (volume: GoogleBookVolume): string => {
	const imageLinks = volume.volumeInfo.imageLinks

	if (!imageLinks) {
		return "https://via.placeholder.com/128x196?text=No+Cover"
	}

	// Prefer larger images, fall back to smaller ones
	return (
		imageLinks.large ||
		imageLinks.medium ||
		imageLinks.small ||
		imageLinks.thumbnail ||
		imageLinks.smallThumbnail ||
		"https://via.placeholder.com/128x196?text=No+Cover"
	)
}

/**
 * Extract ISBN from Google Book volume
 * @param volume - The Google Book volume
 * @returns string | null - The ISBN-13 or ISBN-10, or null if not found
 */
export const getISBNFromVolume = (volume: GoogleBookVolume): string | null => {
	const identifiers = volume.volumeInfo.industryIdentifiers

	if (!identifiers || identifiers.length === 0) {
		return null
	}

	// Prefer ISBN-13, fall back to ISBN-10
	const isbn13 = identifiers.find((id) => id.type === "ISBN_13")
	if (isbn13) {
		return isbn13.identifier
	}

	const isbn10 = identifiers.find((id) => id.type === "ISBN_10")
	if (isbn10) {
		return isbn10.identifier
	}

	return null
}

/**
 * Format Google Book data for use in the application
 * This converts Google Books API format to your local Book type
 * @param volume - The Google Book volume
 * @param authorId - The ID of the author in your local database
 * @returns Partial book object that can be used to create/update books
 */
export const formatGoogleBookForApp = (
	volume: GoogleBookVolume,
	authorId: number
) => {
	return {
		title: volume.volumeInfo.title,
		authorId: authorId,
		isbn: getISBNFromVolume(volume) || "Unknown",
		publishedYear: volume.volumeInfo.publishedDate
			? parseInt(volume.volumeInfo.publishedDate.substring(0, 4))
			: new Date().getFullYear(),
		description: volume.volumeInfo.description || "No description available",
		coverUrl: getCoverImageUrl(volume),
	}
}

/**
 * Enrich book data with information from Google Books
 * This is useful when you have basic book info and want to add cover images, ratings, etc.
 * @param isbn - The ISBN of the book
 * @returns Promise<Partial<Book> | null> - Enriched book data or null if not found
 */
export const enrichBookData = async (isbn: string): Promise<{
	coverUrl?: string
	description?: string
	averageRating?: number
	ratingsCount?: number
	pageCount?: number
	publisher?: string
	publishedDate?: string
	categories?: string[]
} | null> => {
	try {
		const volume = await searchBookByISBN(isbn)

		if (!volume) {
			return null
		}

		return {
			coverUrl: getCoverImageUrl(volume),
			description: volume.volumeInfo.description,
			averageRating: volume.volumeInfo.averageRating,
			ratingsCount: volume.volumeInfo.ratingsCount,
			pageCount: volume.volumeInfo.pageCount,
			publisher: volume.volumeInfo.publisher,
			publishedDate: volume.volumeInfo.publishedDate,
			categories: volume.volumeInfo.categories,
		}
	} catch (error) {
		console.error(`Error enriching book data for ISBN ${isbn}:`, error)
		return null
	}
}