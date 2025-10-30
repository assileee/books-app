export type Author = {
	id: number
	name: string
	bio: string
	birthYear: number
	country: string
}

// Type for creating a new author (without id since it's auto-generated)
export type CreateAuthorInput = Omit<Author, 'id'>

// Type for updating an author (all fields optional except id is excluded)
export type UpdateAuthorInput = Partial<Omit<Author, 'id'>>