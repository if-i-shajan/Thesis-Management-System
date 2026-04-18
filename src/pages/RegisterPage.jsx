import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import { authService } from '../services/authService'
import { Button } from '../components/Button'
import { Input, Select } from '../components/FormInputs'
import { Alert } from '../components/Alert'
import { User, Mail, Lock } from 'lucide-react'

export const RegisterPage = () => {
    const navigate = useNavigate()
    const { setUser, setProfile } = useAuthStore()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        department: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const departments = [
        { label: 'Computer Science', value: 'CS' },
        { label: 'Software Engineering', value: 'SE' },
        { label: 'Information Technology', value: 'IT' },
        { label: 'Artificial Intelligence', value: 'AI' },
        { label: 'Data Science', value: 'DS' },
    ]

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const result = await authService.signup(
                formData.email,
                formData.password,
                formData.fullName,
                formData.role
            )

            if (result.success) {
                setUser(result.data.user)

                const profileResult = await authService.getUserProfile(result.data.user.id)
                if (profileResult.success) {
                    setProfile(profileResult.data)

                    const dashboards = {
                        student: '/student/projects',
                        supervisor: '/supervisor/requests',
                        admin: '/admin/dashboard',
                    }

                    navigate(dashboards[formData.role] || '/student/projects')
                }
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-3xl">TMS</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join our thesis management system</p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError(null)} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="pl-12"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-12"
                                required
                            />
                        </div>

                        <Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            options={[
                                { label: 'Student', value: 'student' },
                                { label: 'Supervisor', value: 'supervisor' },
                                { label: 'Admin', value: 'admin' },
                            ]}
                        />

                        <Select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            options={[{ label: 'Select Department', value: '' }, ...departments]}
                        />

                        <div className="relative">
                            <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-12"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="pl-12"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={loading}
                            className="mt-6"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="text-center text-gray-600 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
