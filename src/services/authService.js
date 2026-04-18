import { supabase } from './supabase'

export const authService = {
    async signup(email, password, fullName, role = 'student') {
        try {
            // Sign up user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) throw error

            // Create user profile
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert([
                        {
                            id: data.user.id,
                            email,
                            full_name: fullName,
                            role,
                        },
                    ])

                if (profileError) throw profileError
            }

            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async logout() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getCurrentUser() {
        try {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser()

            if (error) throw error
            return { success: true, user }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
