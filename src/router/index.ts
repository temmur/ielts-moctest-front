import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Import your pages
import PLoginPage from "../view/PLoginPage.vue";
import PIndex from "../view/PIndex.vue";
import NotFoundPage from '../view/ErrorPage.vue'
import PListening from "../view/test/PListening.vue";
import PReading from "../view/test/PReading.vue";
import PWriting from "../view/test/PWriting.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: PLoginPage
    },
    {
        path: '/',
        name: 'Home',
        component: PIndex,
        meta: { requiresAuth: true } // example meta for protected routes
    },
    {
        path: '/test/listening/:studentTestId',
        name: "Listening",
        component: PListening,
        meta: {requiresAuth: true}
    },
    {
        path: '/test/reading/:studentTestId',
        name: "Reading",
        component: PReading,
        meta: {requiresAuth: true}
    },
    {
        path: '/test/writing/:studentTestId',
        name: "Writing",
        component: PWriting,
        meta: {requiresAuth: true}
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundPage
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// Example navigation guard (optional)
router.beforeEach((to, from, next) => {
    const isAuthenticated = false // TODO: replace with Pinia store or auth logic
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'Login' })
    } else {
        next()
    }
})

export default router
