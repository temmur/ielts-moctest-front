import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { supabase } from '@/supabase'

// Import your pages
import PLoginPage from "@/view/PLoginPage.vue"
import PIndex from "@/view/PIndex.vue"
import NotFoundPage from '@/view/ErrorPage.vue'
import PListening from "@/view/test/PListening.vue"
import PReading from "@/view/test/PReading.vue"
import PWriting from "@/view/test/PWriting.vue"
import PTeacherPanel from "@/view/teacher/PTeacherPanel.vue"


const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: PLoginPage
    },
    {
        path: '/',
        name: "Layout",
        component: ()=> import('@/layouts/Default/LDefault.vue'),
        redirect: {name: 'Home'},
        children: [
            {
                path: '/',
                name: 'Home',
                component: PIndex,
                alias: ['/index', '/main', '/dashboard'],
                meta: { requiresAuth: true }
            },
            {
                path: '/test/listening',
                name: "Listening",
                component: PListening,
                meta: { requiresAuth: true }
            },
            {
                path: '/test/reading/',
                name: "Reading",
                component: PReading,
                meta: { requiresAuth: true }
            },
            {
                path: '/test/writing/',
                name: "Writing",
                component: PWriting,
                meta: { requiresAuth: true }
            },
            {
                path: '/teacher-panel',
                name: "TeacherPanel",
                component: PTeacherPanel,
                meta: { requiresAuth: true }
            },
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundPage,
    },
]

// создаём router
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// route guard с редиректом по роли
router.beforeEach(async (to) => {
    const {
        data: { session }
    } = await supabase.auth.getSession()

    // Если нет сессии и страница требует авторизацию → login
    if (!session && to.meta.requiresAuth) {
        return '/login'
    }

    // Если есть сессия
    if (session) {
        // Получаем роль
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()


        if (error) {
            console.error('Failed to get user role:', error)
            return '/login'
        }

        const role = profileData?.role

        // Если учитель и пытается зайти на index/dashboard → редирект в teacher-panel
        if (role === 'teacher' && ['/','/index','/main','/dashboard'].includes(to.path)) {
            return '/teacher-panel'
        }

        // Если залогинен и пытается зайти на login → редирект по роли
        if (to.path === '/login') {
            if (role === 'teacher') return '/teacher-panel'
            else return '/'
        }
    }
})


export default router
