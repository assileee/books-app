import type { Book } from "../types/Book"
import { staticBooks } from "../mockData/staticData"

// Simulate a local database with static data
let booksDatabase = [...staticBooks]
let nextId = Math.max(...staticBooks.map(b => b.id || 0)) + 1

/**
 * Get all books from static data
 * @returns Promise<Book[]> - Array of books
 * @throws Error if the request fails
 */
export const getAllBooks = async (): Promise<Book[]> => {
	try {
		// TODO: Replace with real API call when backend is ready
		// const response = await fetch(`${API_BASE_URL}/api/books`)
		// if (!response.ok) {
		// 	throw new Error("Failed to fetch books")
		// }
		// return await response.json()

		// Simulate API call with static data
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve([...booksDatabase])
			}, 500) // Simulate network delay
		})
	} catch (error) {
		console.error("Error fetching books:", error)
		throw new Error("Failed to fetch books")
	}
}

/**
 * Get a single book by ID
 * @param id - The book ID
 * @returns Promise<Book> - The book object
 * @throws Error if the book is not found
 */
export const getBookById = async (id: number): Promise<Book> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const book = booksDatabase.find((b) => b.id === id)
			if (book) {
				resolve(book)
			} else {
				reject(new Error(`Book with ID ${id} not found`))
			}
		}, 500)
	})
}

/**
 * Create a new book
 * @param bookData - The book data to create
 * @returns Promise<Book> - The created book with ID
 * @throws Error if validation fails
 */
export const createBook = async (bookData: Omit<Book, 'id'>): Promise<Book> => {
	// Validate required fields
	if (!bookData.title || bookData.title.trim() === "") {
		throw new Error("Book title is required")
	}
	if (!bookData.authorId) {
		throw new Error("Book author is required")
	}

	return new Promise((resolve) => {
		setTimeout(() => {
			const newBook: Book = {
				...bookData,
				id: nextId++,
			}
			booksDatabase.push(newBook)
			console.log(`Created book: ${newBook.title}`)
			resolve(newBook)
		}, 500)
	})
}

/**
 * Update an existing book
 * @param id - The book ID
 * @param bookData - The partial book data to update
 * @returns Promise<Book> - The updated book
 * @throws Error if the book is not found
 */
export const updateBook = async (
	id: number,
	bookData: Partial<Omit<Book, 'id'>>
): Promise<Book> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const index = booksDatabase.findIndex((b) => b.id === id)
			if (index === -1) {
				reject(new Error(`Book with ID ${id} not found`))
				return
			}

			booksDatabase[index] = {
				...booksDatabase[index],
				...bookData,
			}
			console.log(`Updated book: ${booksDatabase[index].title}`)
			resolve(booksDatabase[index])
		}, 500)
	})
}

/**
 * Delete a book
 * @param id - The book ID to delete
 * @returns Promise<void>
 * @throws Error if the book is not found
 */
export const deleteBook = async (id: number): Promise<void> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const index = booksDatabase.findIndex((b) => b.id === id)
			if (index === -1) {
				reject(new Error(`Book with ID ${id} not found`))
				return
			}

			booksDatabase.splice(index, 1)
			console.log(`Deleted book with ID ${id}`)
			resolve()
		}, 500)
	})
}

/**
 * Search books by title or author
 * @param query - The search query
 * @returns Promise<Book[]> - Array of matching books
 */
export const searchBooks = async (query: string): Promise<Book[]> => {
	if (!query || query.trim() === "") {
		return []
	}

	return new Promise((resolve) => {
		setTimeout(() => {
			const lowercaseQuery = query.toLowerCase()
			const results = booksDatabase.filter((book) =>
				book.title.toLowerCase().includes(lowercaseQuery) ||
				book.description.toLowerCase().includes(lowercaseQuery)
			)
			console.log(`Found ${results.length} books matching "${query}"`)
			resolve(results)
		}, 500)
	})
}

/**
 * Get books by author ID
 * @param authorId - The author ID
 * @returns Promise<Book[]> - Array of books by the author
 */
export const getBooksByAuthorId = async (authorId: number): Promise<Book[]> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			const books = booksDatabase.filter((book) => book.authorId === authorId)
			resolve(books)
		}, 500)
	})
}

/**
 * Reset the database to initial static data
 * Useful for testing or resetting the application
 */
export const resetBooksDatabase = (): void => {
	booksDatabase = [...staticBooks]
	nextId = Math.max(...staticBooks.map(b => b.id || 0)) + 1
	console.log("Books database reset to initial state")
}