import { supabase } from './supabase'

export const notificationService = {
    async getNotifications(userId) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async markAsRead(notificationId) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async createNotification(userId, message, type = 'info') {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert([
                    {
                        user_id: userId,
                        message,
                        type,
                        is_read: false,
                    },
                ])
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async deleteNotification(notificationId) {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)

            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getUnreadCount(userId) {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            if (error) throw error
            return { success: true, count }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
