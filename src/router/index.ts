// import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
// import { supabase } from '@/supabase'
//
// // Import your pages
// import PLoginPage from "@/view/PLoginPage.vue"
// import PIndex from "@/view/PIndex.vue"
// import NotFoundPage from '@/view/ErrorPage.vue'
// import PListening from "@/view/test/PListening.vue"
// import PReading from "@/view/test/PReading.vue"
// import PWriting from "@/view/test/PWriting.vue"
// import PTeacherPanel from "@/view/teacher/PTeacherPanel.vue"
//
//
// const routes: Array<RouteRecordRaw> = [
//     {
//         path: '/login',
//         name: 'Login',
//         component: PLoginPage
//     },
//     {
//         path: '/',
//         name: "Layout",
//         component: ()=> import('@/layouts/Default/LDefault.vue'),
//         redirect: {name: 'Home'},
//         children: [
//             {
//                 path: '/',
//                 name: 'Home',
//                 component: PIndex,
//                 alias: ['/index', '/main', '/dashboard'],
//                 meta: { requiresAuth: true }
//             },
//             {
//                 path: '/test/listening',
//                 name: "Listening",
//                 component: PListening,
//                 meta: { requiresAuth: true }
//             },
//             {
//                 path: '/test/reading',
//                 name: "Reading",
//                 component: PReading,
//                 meta: { requiresAuth: true }
//             },
//             {
//                 path: '/test/writing/',
//                 name: "Writing",
//                 component: PWriting,
//                 meta: { requiresAuth: true }
//             },
//             {
//                 path: '/teacher-panel',
//                 name: "TeacherPanel",
//                 component: PTeacherPanel,
//                 meta: { requiresAuth: true }
//             },
//         ]
//     },
//     {
//         path: '/:pathMatch(.*)*',
//         name: 'NotFound',
//         component: NotFoundPage,
//     },
// ]
//
// // создаём router
// const router = createRouter({
//     history: createWebHistory(import.meta.env.BASE_URL),
//     routes
// })
//
// // route guard с редиректом по роли
// router.beforeEach(async (to) => {
//     const {
//         data: { session }
//     } = await supabase.auth.getSession()
//
//     // Если нет сессии и страница требует авторизацию → login
//     if (!session && to.meta.requiresAuth) {
//         return '/login'
//     }
//
//     // Если есть сессия
//     if (session) {
//         // Получаем роль
//         const { data: profileData, error } = await supabase
//             .from('profiles')
//             .select('role')
//             .eq('id', session.user.id)
//             .single()
//
//         if (error) {
//             console.error('Failed to get user role:', error)
//             return '/login'
//         }
//
//         const role = profileData?.role
//
//         // Если учитель и пытается зайти на index/dashboard → редирект в teacher-panel
//         if (role === 'teacher' && ['/','/index','/main','/dashboard'].includes(to.path)) {
//             return '/teacher-panel'
//         }
//
//         // Если залогинен и пытается зайти на login → редирект по роли
//         if (to.path === '/login') {
//             if (role === 'teacher') return '/teacher-panel'
//             else return '/'
//         }
//     }
// })
//
//
// export default router




import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { supabase } from "@/supabase";

// pages
import PLoginPage from "@/view/PLoginPage.vue";
import PIndex from "@/view/PIndex.vue";
import NotFoundPage from "@/view/ErrorPage.vue";
import PListening from "@/view/test/PListening.vue";
import PReading from "@/view/test/PReading.vue";
import PWriting from "@/view/test/PWriting.vue";
import PTeacherPanel from "@/view/teacher/PTeacherPanel.vue";

const routes: Array<RouteRecordRaw> = [
    { path: "/login", name: "Login", component: PLoginPage },

    {
        path: "/",
        name: "Layout",
        component: () => import("@/layouts/Default/LDefault.vue"),
        redirect: { name: "Home" },
        children: [
            {
                path: "/",
                name: "Home",
                component: PIndex,
                alias: ["/index", "/main", "/dashboard"],
                meta: { requiresAuth: true },
            },
            {
                path: "/test/listening",
                name: "Listening",
                component: PListening,
                meta: { requiresAuth: true },
            },
            {
                path: "/test/reading",
                name: "Reading",
                component: PReading,
                meta: { requiresAuth: true },
            },
            {
                path: "/test/writing",
                name: "Writing",
                component: PWriting,
                meta: { requiresAuth: true },
            },
            {
                path: "/teacher-panel",
                name: "TeacherPanel",
                component: PTeacherPanel,
                meta: { requiresAuth: true },
            },
        ],
    },

    { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFoundPage },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// -----------------
// Tiny in-memory cache (чтобы не делать 10 запросов подряд)
let cachedUserId: string | null = null;
let cachedRole: "teacher" | "student" | null = null;
let cachedStudentTest: any | null = null;
let cacheTime = 0;

const CACHE_TTL_MS = 10_000;

async function getRole(userId: string) {
    // cache
    if (cachedUserId === userId && cachedRole && Date.now() - cacheTime < CACHE_TTL_MS) {
        return cachedRole;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (error) throw error;

    const role = (data?.role ?? "student") as "teacher" | "student";
    cachedUserId = userId;
    cachedRole = role;
    cacheTime = Date.now();
    return role;
}

async function getStudentTest(userId: string) {
    // cache
    if (cachedUserId === userId && cachedStudentTest && Date.now() - cacheTime < CACHE_TTL_MS) {
        return cachedStudentTest;
    }

    const { data, error } = await supabase
        .from("student_tests")
        .select("*")
        .eq("student_id", userId)
        .maybeSingle();

    if (error) throw error;

    cachedUserId = userId;
    cachedStudentTest = data ?? null;
    cacheTime = Date.now();
    return data ?? null;
}

router.beforeEach(async (to) => {
    const { data: { session } } = await supabase.auth.getSession();

    // 1) auth
    if (!session && to.meta.requiresAuth) return "/login";
    if (!session) return true;

    const userId = session.user.id;

    // 2) role
    let role: "teacher" | "student";
    try {
        role = await getRole(userId);
    } catch (e) {
        console.error("Failed to get role:", e);
        return "/login";
    }

    // 3) teacher routing
    if (role === "teacher") {
        // teacher не должен попадать в student tests
        if (to.path.startsWith("/test/")) return "/teacher-panel";

        // если teacher идёт на home/dashboard -> teacher panel
        if (["/", "/index", "/main", "/dashboard"].includes(to.path)) return "/teacher-panel";

        // если на login
        if (to.path === "/login") return "/teacher-panel";

        return true;
    }

    // 4) student routing
    if (to.path === "/login") return "/";

    // student test pages gating:
    const isTestRoute =
        to.path === "/test/listening" ||
        to.path === "/test/reading" ||
        to.path === "/test/writing";

    if (!isTestRoute) return true;

    // 5) load student_tests
    let st: any | null = null;
    try {
        st = await getStudentTest(userId);
    } catch (e) {
        console.error("Failed to load student_tests:", e);
        return "/";
    }

    // если записи нет -> пусть видит dashboard (там ты покажешь "не назначен")
    if (!st) return "/";

    // если нет назначенных тестов -> тоже на dashboard
    // (тут важно чтобы у тебя были колонки listening_test_id/reading_test_id/writing_test_id)
    const hasAssigned =
        !!st.listening_test_id && !!st.reading_test_id && !!st.writing_test_id;

    if (!hasAssigned) return "/";

    // 6) stage gating
    const status = String(st.status || "listening");

    // порядок этапов:
    const order = ["listening", "reading", "writing"];
    const currentIndex = order.indexOf(status);

    const routeStage =
        to.path === "/test/listening" ? "listening" :
            to.path === "/test/reading" ? "reading" :
                "writing";

    const routeIndex = order.indexOf(routeStage);

    // нельзя прыгнуть вперёд
    if (routeIndex > currentIndex) return "/";

    // нельзя вернуться назад если этап уже завершён (опционально)
    // если хочешь запретить вернуться назад — раскомментируй:
    /*
    if (routeIndex < currentIndex) return "/";
    */

    return true;
});

export default router;
