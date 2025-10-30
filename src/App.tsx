import { useState, useEffect } from "react"
import { BookOpen } from "lucide-react"
import BookCard from "./components/BookCard"
import AuthorCard from "./components/AuthorCard"
import SearchBar from "./components/SearchBar"
import NavigationTabs from "./components/NavogationTabs"
import AddAuthorForm from "./components/tabs/AddAuthorForm"
import AddBookForm from "./components/tabs/AddBookForm"
import type { Author } from "./types/Authors"
import type { Book } from "./types/Book"
import { getAllBooks, createBook } from "./services/booksService"
import { getAllAuthors, createAuthor } from "./services/authorsService"

const App = () => {
	// State
	const [activeTab, setActiveTab] = useState("books")
	const [searchTerm, setSearchTerm] = useState("")
	const [books, setBooks] = useState<Book[]>([])
	const [authors, setAuthors] = useState<Author[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)

	// Load data on component mount
	useEffect(() => {
		loadData()
	}, [])

	const loadData = async () => {
		try {
			setLoading(true)
			setError(null)

			// Fetch both books and authors
			const [booksData, authorsData] = await Promise.all([
				getAllBooks(),
				getAllAuthors(),
			])

			setBooks(booksData)
			setAuthors(authorsData)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load data")
			console.error("Error loading data:", err)
		} finally {
			setLoading(false)
		}
	}

	const handleAddAuthor = async (author: Omit<Author, "id">) => {
		try {
			setError(null)
			const newAuthor = await createAuthor(author)
			setAuthors([...authors, newAuthor])
			setSuccessMessage(`Author "${newAuthor.name}" added successfully!`)
			setActiveTab("authors")
			
			// Clear success message after 3 seconds
			setTimeout(() => setSuccessMessage(null), 3000)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add author")
			console.error("Error adding author:", err)
		}
	}

	const handleAddBook = async (book: Omit<Book, "id">) => {
		try {
			setError(null)
			const newBook = await createBook(book)
			setBooks([...books, newBook])
			setSuccessMessage(`Book "${newBook.title}" added successfully!`)
			setActiveTab("books")
			
			// Clear success message after 3 seconds
			setTimeout(() => setSuccessMessage(null), 3000)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add book")
			console.error("Error adding book:", err)
		}
	}

	const getAuthorById = (authorId: number) => {
		return authors.find((author) => author.id === authorId)
	}

	const getBookCountByAuthor = (authorId: number) => {
		return books.filter((book) => book.authorId === authorId).length
	}

	const filteredBooks = books.filter((book) => {
		const author = getAuthorById(book.authorId)
		return (
			book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			author?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			book.description.toLowerCase().includes(searchTerm.toLowerCase())
		)
	})

	const filteredAuthors = authors.filter((author) =>
		author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		author.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
		author.bio.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<header className="bg-indigo-600 text-white shadow-lg">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-3 mb-4">
						<BookOpen className="w-8 h-8" />
						<h1 className="text-3xl font-bold">Books & Authors Library</h1>
					</div>
					<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
				</div>
			</header>

			{/* Navigation Tabs */}
			<NavigationTabs
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				booksCount={filteredBooks.length}
				authorsCount={filteredAuthors.length}
			/>

			{/* Messages */}
			{error && (
				<div className="container mx-auto px-4 pt-4">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
						<strong className="font-bold">Error: </strong>
						<span className="block sm:inline">{error}</span>
						<button
							onClick={() => setError(null)}
							className="absolute top-0 bottom-0 right-0 px-4 py-3"
						>
							<span className="text-2xl">&times;</span>
						</button>
					</div>
				</div>
			)}

			{successMessage && (
				<div className="container mx-auto px-4 pt-4">
					<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
						<span className="block sm:inline">{successMessage}</span>
						<button
							onClick={() => setSuccessMessage(null)}
							className="absolute top-0 bottom-0 right-0 px-4 py-3"
						>
							<span className="text-2xl">&times;</span>
						</button>
					</div>
				</div>
			)}

			{/* Main Content */}
			<main className="container mx-auto px-4 py-8">
				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
						<p className="mt-4 text-gray-600">Loading data...</p>
					</div>
				) : (
					<>
						{activeTab === "books" && (
							<div className="space-y-4 flex flex-col flex-wrap">
								{filteredBooks.length > 0 ? (
									filteredBooks.map((book) => {
										const author = getAuthorById(book.authorId)
										return author ? (
											<BookCard
												key={book.id}
												book={book}
												author={author}
											/>
										) : null
									})
								) : (
									<div className="text-center py-12 text-gray-500">
										{searchTerm
											? "No books found matching your search."
											: "No books available. Add your first book!"}
									</div>
								)}
							</div>
						)}

						{activeTab === "authors" && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{filteredAuthors.length > 0 ? (
									filteredAuthors.map((author) => (
										<AuthorCard
											key={author.id}
											author={author}
											bookCount={getBookCountByAuthor(author.id || 0)}
										/>
									))
								) : (
									<div className="col-span-2 text-center py-12 text-gray-500">
										{searchTerm
											? "No authors found matching your search."
											: "No authors available. Add your first author!"}
									</div>
								)}
							</div>
						)}

						{activeTab === "add-author" && (
							<AddAuthorForm
								onSubmit={handleAddAuthor}
								onCancel={() => setActiveTab("authors")}
							/>
						)}

						{activeTab === "add-book" && (
							<AddBookForm 
								authors={authors} 
								onSubmit={handleAddBook}
								onCancel={() => setActiveTab("books")}
							/>
						)}
					</>
				)}
			</main>
		</div>
	)
}

export default App