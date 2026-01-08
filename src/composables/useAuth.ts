import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'


export function useAuth() {
    const router = useRouter()

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Logout error:', error.message)
            return
        }
        router.push('/login')
    }

    return { logout }
}

export const login = async () => {
    errorMessage.value = ''
    loading.value = true

    console.log('Trying login...')

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })

    console.log('Auth response:', data, error)

    loading.value = false

    if (error) {
        errorMessage.value = error.message
        return
    }

    router.push('/')
}
