export type Book = {
	id?: number
	title: string
	authorId: number
	isbn: string
	publishedYear: number
	description: string
	coverUrl: string
}

// Type for creating a new book (without id since it's auto-generated)
export type CreateBookInput = Omit<Book, 'id'>

// Type for updating a book (all fields optional except id is excluded)
export type UpdateBookInput = Partial<Omit<Book, 'id'>>