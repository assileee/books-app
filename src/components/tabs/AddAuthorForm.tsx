import { useState } from "react"
import type { Author } from "../../types/Authors"
import { countries } from "../../mockData/countries"
import { User } from "lucide-react"

interface AddAuthorFormProps {
	onSubmit: (author: Omit<Author, "id">) => void
	onCancel?: () => void
}

const AddAuthorForm = ({ onSubmit, onCancel }: AddAuthorFormProps) => {
	const [formData, setFormData] = useState({
		name: "",
		bio: "",
		birthYear: new Date().getFullYear() - 30,
		country: "",
	})

	const [errors, setErrors] = useState<{ [key: string]: string }>({})

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: name === "birthYear" ? Number(value) : value,
		}))
		// Clear error for this field
		setErrors((prev) => ({ ...prev, [name]: "" }))
	}

	const validateForm = (): boolean => {
		const newErrors: { [key: string]: string } = {}

		if (!formData.name.trim()) {
			newErrors.name = "Author name is required"
		}
		if (!formData.country) {
			newErrors.country = "Please select a country"
		}
		if (!formData.birthYear || formData.birthYear < 1000 || formData.birthYear > new Date().getFullYear()) {
			newErrors.birthYear = "Valid birth year is required"
		}
		if (!formData.bio.trim()) {
			newErrors.bio = "Biography is required"
		}

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
				<User className="w-8 h-8 text-indigo-600" />
				<h2 className="text-2xl font-bold text-gray-800">Add New Author</h2>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Name */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Author Name *
					</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.name ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="e.g., Ernest Hemingway"
					/>
					{errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
				</div>

				{/* Country */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Country *
					</label>
					<select
						name="country"
						value={formData.country}
						onChange={handleChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.country ? "border-red-500" : "border-gray-300"
						}`}
					>
						<option value="">Select a country</option>
						{countries.map((country) => (
							<option key={country} value={country}>
								{country}
							</option>
						))}
					</select>
					{errors.country && (
						<p className="text-red-500 text-sm mt-1">{errors.country}</p>
					)}
				</div>

				{/* Birth Year */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Birth Year *
					</label>
					<input
						type="number"
						name="birthYear"
						value={formData.birthYear}
						onChange={handleChange}
						min="1000"
						max={new Date().getFullYear()}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.birthYear ? "border-red-500" : "border-gray-300"
						}`}
					/>
					{errors.birthYear && (
						<p className="text-red-500 text-sm mt-1">{errors.birthYear}</p>
					)}
				</div>

				{/* Biography */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Biography *
					</label>
					<textarea
						name="bio"
						value={formData.bio}
						onChange={handleChange}
						rows={5}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							errors.bio ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Brief biography of the author..."
					/>
					{errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
					<p className="text-xs text-gray-500 mt-1">
						{formData.bio.length} characters
					</p>
				</div>

				{/* Submit Buttons */}
				<div className="flex gap-3 pt-4">
					<button
						type="submit"
						className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
					>
						Add Author
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

export default AddAuthorForm