import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/layouts/AppShell.vue'),
    meta: { requiresAuth: true, title: '首页' },
  },
  // 兜底：不存在的路径全部拦截到登录
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  // 直接从 localStorage 实时判断，不依赖内存中的 Pinia 状态
  // 这样即使 Pinia 尚未初始化或 store 被误重置，守卫依然可靠
  const token = localStorage.getItem('token')
  const expiresAt = localStorage.getItem('expiresAt')
  const expired = expiresAt && Date.now() > parseInt(expiresAt)
  const loggedIn = !!token && !expired

  // 需要登录但未登录 → 清理残留 + 跳回登录
  if (to.meta.requiresAuth !== false && !loggedIn) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('expiresAt')
    return next('/login')
  }

  // 已登录但想去登录页 → 直接去首页
  if (to.path === '/login' && loggedIn) {
    return next('/')
  }

  // 设置页面标题
  if (to.meta.title) document.title = to.meta.title + ' - 健康管家'

  next()
})

export default router
