import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import { authService } from '../services/authService'
import { Button } from '../components/Button'
import { Input } from '../components/FormInputs'
import { Alert } from '../components/Alert'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Mail, Lock } from 'lucide-react'

export const LoginPage = () => {
    const navigate = useNavigate()
    const { setUser, setProfile } = useAuthStore()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = await authService.login(formData.email, formData.password)

            if (result.success) {
                setUser(result.data.user)

                // Get user profile to determine role
                const profileResult = await authService.getUserProfile(result.data.user.id)
                if (profileResult.success) {
                    setProfile(profileResult.data)

                    // Redirect based on role
                    const dashboards = {
                        student: '/student/projects',
                        supervisor: '/supervisor/requests',
                        admin: '/admin/dashboard',
                    }

                    navigate(dashboards[profileResult.data.role] || '/student/projects')
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
                    <h1 className="text-3xl font-bold text-gray-900">Thesis Management</h1>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError(null)} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-12"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
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
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 bg-white/50 rounded-xl border border-blue-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Demo Credentials:</p>
                    <div className="space-y-1 text-xs text-gray-600">
                        <p>Student: student@example.com / password123</p>
                        <p>Supervisor: supervisor@example.com / password123</p>
                        <p>Admin: admin@example.com / password123</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
