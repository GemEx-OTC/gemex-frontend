"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { KYCProgressBar } from "@/components/kyc-progress-bar"

export default function PersonalDetailsPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"

    // Age validation (must be 18+)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 18) newErrors.dateOfBirth = "You must be at least 18 years old"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      router.push("/auth/onboard/document")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#1E1E2B] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <KYCProgressBar currentStep={1} totalSteps={4} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1E2B]/80 backdrop-blur-xl border border-[#641AE4]/30 rounded-2xl p-8 mt-8"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Personal Information</h1>
            <p className="text-[#B0B0B8]">Please provide your personal details exactly as they appear on your ID</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full bg-[#2D2D3D] border-b-2 ${
                    errors.firstName ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                  } text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full bg-[#2D2D3D] border-b-2 ${
                    errors.lastName ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                  } text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Date of Birth & Phone */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full bg-[#2D2D3D] border-b-2 ${
                    errors.dateOfBirth ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                  } text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none`}
                />
                {errors.dateOfBirth && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.dateOfBirth}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full bg-[#2D2D3D] border-b-2 ${
                    errors.phoneNumber ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                  } text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none`}
                  placeholder="+234 800 000 0000"
                />
                {errors.phoneNumber && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.phoneNumber}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Street Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full bg-[#2D2D3D] border-b-2 ${
                  errors.address ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                } text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none`}
                placeholder="123 Main Street"
              />
              {errors.address && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-sm mt-1">
                  {errors.address}
                </motion.p>
              )}
            </div>

            {/* City, State, Postal */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full bg-[#2D2D3D] border-b-2 ${
                    errors.city ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                  } text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none`}
                  placeholder="Lagos"
                />
                {errors.city && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-sm mt-1">
                    {errors.city}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  State <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full bg-[#2D2D3D] border-b-2 ${
                    errors.state ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                  } text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none`}
                  placeholder="Lagos"
                />
                {errors.state && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-sm mt-1">
                    {errors.state}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full bg-[#2D2D3D] border-b-2 border-b-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none"
                  placeholder="100001"
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Country <span className="text-red-400">*</span>
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-[#2D2D3D] border-b-2 border-b-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="px-6 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all"
              >
                Back
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-70"
              >
                {loading ? "Saving..." : "Continue to Document Upload"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
