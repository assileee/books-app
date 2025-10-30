import type { Author } from "../types/Authors"
import { staticAuthors } from "../mockData/staticData"

// Simulate a local database with static data
let authorsDatabase = [...staticAuthors]
let nextId = Math.max(...staticAuthors.map(a => a.id || 0)) + 1

/**
 * Get all authors from static data
 * @returns Promise<Author[]> - Array of authors
 * @throws Error if the request fails
 */
export const getAllAuthors = async (): Promise<Author[]> => {
	try {
		// TODO: Replace with real API call when backend is ready
		// const response = await fetch(`${API_BASE_URL}/api/authors`)
		// if (!response.ok) {
		// 	throw new Error("Failed to fetch authors")
		// }
		// return await response.json()

		// Simulate API call with static data
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve([...authorsDatabase])
			}, 500) // Simulate network delay
		})
	} catch (error) {
		console.error("Error fetching authors:", error)
		throw new Error("Failed to fetch authors")
	}
}

/**
 * Get a single author by ID
 * @param id - The author ID
 * @returns Promise<Author> - The author object
 * @throws Error if the author is not found
 */
export const getAuthorById = async (id: number): Promise<Author> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const author = authorsDatabase.find((a) => a.id === id)
			if (author) {
				resolve(author)
			} else {
				reject(new Error(`Author with ID ${id} not found`))
			}
		}, 500)
	})
}

/**
 * Create a new author
 * @param authorData - The author data to create
 * @returns Promise<Author> - The created author with ID
 * @throws Error if validation fails
 */
export const createAuthor = async (authorData: Omit<Author, 'id'>): Promise<Author> => {
	// Validate required fields
	if (!authorData.name || authorData.name.trim() === "") {
		throw new Error("Author name is required")
	}
	if (!authorData.country || authorData.country.trim() === "") {
		throw new Error("Author country is required")
	}
	if (!authorData.birthYear || authorData.birthYear < 1000 || authorData.birthYear > new Date().getFullYear()) {
		throw new Error("Valid birth year is required")
	}

	return new Promise((resolve) => {
		setTimeout(() => {
			const newAuthor: Author = {
				...authorData,
				id: nextId++,
			}
			authorsDatabase.push(newAuthor)
			console.log(`Created author: ${newAuthor.name}`)
			resolve(newAuthor)
		}, 500)
	})
}

/**
 * Update an existing author
 * @param id - The author ID
 * @param authorData - The partial author data to update
 * @returns Promise<Author> - The updated author
 * @throws Error if the author is not found
 */
export const updateAuthor = async (
	id: number,
	authorData: Partial<Omit<Author, 'id'>>
): Promise<Author> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const index = authorsDatabase.findIndex((a) => a.id === id)
			if (index === -1) {
				reject(new Error(`Author with ID ${id} not found`))
				return
			}

			authorsDatabase[index] = {
				...authorsDatabase[index],
				...authorData,
			}
			console.log(`Updated author: ${authorsDatabase[index].name}`)
			resolve(authorsDatabase[index])
		}, 500)
	})
}

/**
 * Delete an author
 * @param id - The author ID to delete
 * @returns Promise<void>
 * @throws Error if the author is not found
 */
export const deleteAuthor = async (id: number): Promise<void> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const index = authorsDatabase.findIndex((a) => a.id === id)
			if (index === -1) {
				reject(new Error(`Author with ID ${id} not found`))
				return
			}

			authorsDatabase.splice(index, 1)
			console.log(`Deleted author with ID ${id}`)
			resolve()
		}, 500)
	})
}

/**
 * Search authors by name
 * @param query - The search query
 * @returns Promise<Author[]> - Array of matching authors
 */
export const searchAuthors = async (query: string): Promise<Author[]> => {
	if (!query || query.trim() === "") {
		return []
	}

	return new Promise((resolve) => {
		setTimeout(() => {
			const lowercaseQuery = query.toLowerCase()
			const results = authorsDatabase.filter((author) =>
				author.name.toLowerCase().includes(lowercaseQuery) ||
				author.country.toLowerCase().includes(lowercaseQuery) ||
				author.bio.toLowerCase().includes(lowercaseQuery)
			)
			console.log(`Found ${results.length} authors matching "${query}"`)
			resolve(results)
		}, 500)
	})
}

/**
 * Get authors by country
 * @param country - The country to filter by
 * @returns Promise<Author[]> - Array of authors from the country
 */
export const getAuthorsByCountry = async (country: string): Promise<Author[]> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			const authors = authorsDatabase.filter(
				(author) => author.country.toLowerCase() === country.toLowerCase()
			)
			resolve(authors)
		}, 500)
	})
}

/**
 * Reset the database to initial static data
 * Useful for testing or resetting the application
 */
export const resetAuthorsDatabase = (): void => {
	authorsDatabase = [...staticAuthors]
	nextId = Math.max(...staticAuthors.map(a => a.id || 0)) + 1
	console.log("Authors database reset to initial state")
}