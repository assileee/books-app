import { useState, useEffect } from "react"
import type { Book } from "../../types/Book"
import type { Author } from "../../types/Authors"
import { searchBooks, getCoverImageUrl, getISBNFromVolume } from "../../services/googleBooksService"
import type { GoogleBookVolume } from "../../services/googleBooksService"
import { Search, BookOpen, AlertCircle, X } from "lucide-react"

interface AddBookFormProps {
	authors: Author[]
	onSubmit: (book: Omit<Book, "id">) => void
	onCancel?: () => void
}

const AddBookForm = ({ authors, onSubmit, onCancel }: AddBookFormProps) => {
	const [formData, setFormData] = useState({
		title: "",
		authorId: 0,
		isbn: "",
		publishedYear: new Date().getFullYear(),
		description: "",
		coverUrl: "",
	})

	const [searchQuery, setSearchQuery] = useState("")
	const [suggestions, setSuggestions] = useState<GoogleBookVolume[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [errors, setErrors] = useState<{ [key: string]: string }>({})
	const [authorSuggestion, setAuthorSuggestion] = useState<string | null>(null)

	// Debounced search - search Google Books as user types
	useEffect(() => {
		if (searchQuery.length < 3) {
			setSuggestions([])
			setShowSuggestions(false)
			return
		}

		const delaySearch = setTimeout(async () => {
			setIsSearching(true)
			try {
				const results = await searchBooks(searchQuery, 5)
				setSuggestions(results)
				setShowSuggestions(results.length > 0)
			} catch (error) {
				console.error("Error searching books:", error)
				setSuggestions([])
			} finally {
				setIsSearching(false)
			}
		}, 500) // Wait 500ms after user stops typing

		return () => clearTimeout(delaySearch)
	}, [searchQuery])

	// Handle selecting a book from suggestions
	const handleSelectBook = (googleBook: GoogleBookVolume) => {
		const bookData = {
			title: googleBook.volumeInfo.title || "",
			description: googleBook.volumeInfo.description || "",
			coverUrl: getCoverImageUrl(googleBook),
			publishedYear: googleBook.volumeInfo.publishedDate
				? parseInt(googleBook.volumeInfo.publishedDate.substring(0, 4))
				: new Date().getFullYear(),
			isbn: getISBNFromVolume(googleBook) || "",
			author: googleBook.volumeInfo.authors?.[0] || "",
		}

		// Auto-fill form with Google Books data
		setFormData((prev) => ({
			...prev,
			title: bookData.title,
			description: bookData.description,
			coverUrl: bookData.coverUrl,
			publishedYear: bookData.publishedYear,
			isbn: bookData.isbn,
		}))

		// Check if author exists in local authors list
		const foundAuthor = authors.find(
			(author) => author.name.toLowerCase() === bookData.author.toLowerCase()
		)

		if (foundAuthor) {
			// Author exists - auto-select
			setFormData((prev) => ({ ...prev, authorId: foundAuthor.id! }))
			setAuthorSuggestion(null)
			setErrors({})
		} else {
			// Author doesn't exist - show warning
			setAuthorSuggestion(bookData.author)
			setErrors({
				authorId: `Author "${bookData.author}" not found in your database. Please add the author first or select an existing author manually.`,
			})
		}

		// Clear search
		setSearchQuery("")
		setShowSuggestions(false)
		setSuggestions([])
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: name === "authorId" || name === "publishedYear" ? Number(value) : value,
		}))
		// Clear error for this field
		setErrors((prev) => ({ ...prev, [name]: "" }))
	}

	const validateForm = (): boolean => {
		const newErrors: { [key: string]: string } = {}

		if (!formData.title.trim()) newErrors.title = "Title is required"
		if (!formData.authorId) newErrors.authorId = "Please select an author"
		if (!formData.isbn.trim()) newErrors.isbn = "ISBN is required"
		if (!formData.publishedYear || formData.publishedYear < 1000) {
			newErrors.publishedYear = "Valid year is required"
		}
		if (!formData.description.trim()) newErrors.description = "Description is required"
		if (!formData.coverUrl.trim()) newErrors.coverUrl = "Cover URL is required"

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		onSubmit(formData)
	}

	return (
		<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
			<div className="flex items-center gap-3 mb-6">
				<BookOpen className="w-8 h-8 text-indigo-600" />
				<h2 className="text-2xl font-bold text-gray-800">Add New Book</h2>
			</div>

			{/* Google Books Search with Suggestions */}
			<div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
				<h3 className="text-sm font-semibold text-blue-900 mb-3">
					Search for a Book
				</h3>
				<div className="relative">
					<div className="flex items-center">
						<Search className="absolute left-3 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search by title or author (e.g., The Great Gatsby)"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
							className="w-full pl-10 pr-10 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => {
									setSearchQuery("")
									setShowSuggestions(false)
									setSuggestions([])
								}}
								className="absolute right-3"
							>
								<X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
							</button>
						)}
					</div>
					
					{isSearching && (
						<div className="absolute right-3 top-2">
							<div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
						</div>
					)}

					{/* Suggestions Dropdown */}
					{showSuggestions && suggestions.length > 0 && (
						<div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
							{suggestions.map((book, index) => (
								<button
									key={index}
									type="button"
									onClick={() => handleSelectBook(book)}
									className="w-full p-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 text-left transition-colors"
								>
									<div className="flex gap-3">
										<img
											src={getCoverImageUrl(book)}
											alt={book.volumeInfo.title}
											className="w-12 h-16 object-cover rounded"
											onError={(e) => {
												e.currentTarget.src = "https://via.placeholder.com/48x64?text=No+Cover"
											}}
										/>
										<div className="flex-1 min-w-0">
											<h4 className="font-semibold text-gray-900 truncate">
												{book.volumeInfo.title}
											</h4>
											<p className="text-sm text-gray-600">
												{book.volumeInfo.authors?.join(", ") || "Unknown Author"}
											</p>
											<p className="text-xs text-gray-500">
												{book.volumeInfo.publishedDate?.substring(0, 4) || "N/A"}
											</p>
										</div>
									</div>
								</button>
							))}
						</div>
					)}

					{searchQuery.length > 0 && searchQuery.length < 3 && (
						<p className="text-xs text-blue-700 mt-2">
							Type at least 3 characters to search
						</p>
					)}

					{searchQuery.length >= 3 && !isSearching && suggestions.length === 0 && (
						<p className="text-xs text-gray-500 mt-2">
							No books found. Try a different search term.
						</p>
					)}
				</div>
				<p className="text-xs text-blue-700 mt-2">
					Search and select a book to auto-fill the form
				</p>
			</div>

			{/* Author Suggestion Alert */}
			{authorSuggestion && (
				<div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3">
					<AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
					<div>
						<p className="text-sm font-semibold text-amber-900">
							Author Not Found
						</p>
						<p className="text-sm text-amber-800 mt-1">
							The book's author "{authorSuggestion}" is not in your database. Please:
						</p>
						<ul className="text-sm text-amber-800 mt-2 list-disc list-inside">
							<li>Add "{authorSuggestion}" as a new author first, or</li>
							<li>Select an existing author from the dropdown below</li>
						</ul>
					</div>
				</div>
			)}

			{/* Main Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Title */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Title *
					</label>
					<input
						type="text"
						name="title"
						value={formData.title}
						onChange={handleChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.title ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Book title"
					/>
					{errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
				</div>

				{/* Author */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Author *
					</label>
					<select
						name="authorId"
						value={formData.authorId}
						onChange={handleChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.authorId ? "border-red-500" : "border-gray-300"
						}`}
					>
						<option value={0}>Select an author</option>
						{authors.map((author) => (
							<option key={author.id} value={author.id}>
								{author.name} ({author.country})
							</option>
						))}
					</select>
					{errors.authorId && (
						<p className="text-red-500 text-sm mt-1">{errors.authorId}</p>
					)}
				</div>

				{/* ISBN */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						ISBN *
					</label>
					<input
						type="text"
						name="isbn"
						value={formData.isbn}
						onChange={handleChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.isbn ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="ISBN (e.g., 9780743273565)"
					/>
					{errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
				</div>

				{/* Published Year */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Published Year *
					</label>
					<input
						type="number"
						name="publishedYear"
						value={formData.publishedYear}
						onChange={handleChange}
						min="1000"
						max={new Date().getFullYear() + 1}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.publishedYear ? "border-red-500" : "border-gray-300"
						}`}
					/>
					{errors.publishedYear && (
						<p className="text-red-500 text-sm mt-1">{errors.publishedYear}</p>
					)}
				</div>

				{/* Description */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Description *
					</label>
					<textarea
						name="description"
						value={formData.description}
						onChange={handleChange}
						rows={4}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.description ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Book description"
					/>
					{errors.description && (
						<p className="text-red-500 text-sm mt-1">{errors.description}</p>
					)}
				</div>

				{/* Cover URL */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Cover Image URL *
					</label>
					<input
						type="url"
						name="coverUrl"
						value={formData.coverUrl}
						onChange={handleChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.coverUrl ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="https://example.com/cover.jpg"
					/>
					{errors.coverUrl && (
						<p className="text-red-500 text-sm mt-1">{errors.coverUrl}</p>
					)}
					{formData.coverUrl && (
						<div className="mt-2">
							<img
								src={formData.coverUrl}
								alt="Cover preview"
								className="h-32 rounded border border-gray-300"
								onError={(e) => {
									e.currentTarget.src = "https://via.placeholder.com/128x196?text=Invalid+URL"
								}}
							/>
						</div>
					)}
				</div>

				{/* Submit Buttons */}
				<div className="flex gap-3 pt-4">
					<button
						type="submit"
						className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
					>
						Add Book
					</button>
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
						>
							Cancel
						</button>
					)}
				</div>
			</form>
		</div>
	)
}

export default AddBookForm