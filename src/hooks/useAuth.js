import { useEffect } from 'react'
import { useAuthStore } from '../context/store'
import { authService } from '../services/authService'
import { supabase } from '../services/supabase'

export const useAuth = () => {
    const { user, profile, setUser, setProfile, setLoading, setError } = useAuthStore()

    useEffect(() => {
        checkAuth()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user)
                const profileResult = await authService.getUserProfile(session.user.id)
                if (profileResult.success) {
                    setProfile(profileResult.data)
                }
            } else {
                setUser(null)
                setProfile(null)
            }
        })

        return () => subscription?.unsubscribe()
    }, [])

    const checkAuth = async () => {
        setLoading(true)
        try {
            const userResult = await authService.getCurrentUser()
            if (userResult.success && userResult.user) {
                setUser(userResult.user)
                const profileResult = await authService.getUserProfile(userResult.user.id)
                if (profileResult.success) {
                    setProfile(profileResult.data)
                }
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return { user, profile }
}
