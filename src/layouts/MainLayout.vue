<template>
  <a-layout class="main-layout">
    <!-- 桌面端侧边栏 -->
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible width="220" class="desktop-sider" breakpoint="lg">
      <div class="brand">
        <span class="brand-icon">🏥</span>
        <span v-show="!collapsed" class="brand-text">健康管家</span>
      </div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" @click="handleMenuClick">
        <a-menu-item key="dashboard"><AppstoreOutlined /><span>首页</span></a-menu-item>
        <a-menu-item key="sleep"><MoonOutlined /><span>睡眠分析</span></a-menu-item>
        <a-menu-item key="heart-rate"><HeartOutlined /><span>心率趋势</span></a-menu-item>
        <a-menu-item key="medicine"><MedicineBoxOutlined /><span>药品管理</span></a-menu-item>
        <a-menu-item key="data"><BarChartOutlined /><span>健康数据</span></a-menu-item>
        <a-menu-item key="profile"><UserOutlined /><span>个人中心</span></a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <!-- 顶部栏 -->
      <a-layout-header class="main-header">
        <MenuUnfoldOutlined v-if="collapsed" class="trigger" @click="collapsed = !collapsed" />
        <MenuFoldOutlined v-else class="trigger" @click="collapsed = !collapsed" />
        <div class="header-center">
          <a-breadcrumb>
            <a-breadcrumb-item>健康管家</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentTitle }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-badge :count="notifStore.notifications.length" :overflow-count="99" size="small">
            <BellOutlined class="header-icon" @click="showNotifications" />
          </a-badge>
          <a-dropdown>
            <span class="user-info">
              <UserOutlined />
              <span class="user-name">{{ authStore.user?.name || '用户' }}</span>
            </span>
            <template #overlay>
              <a-menu @click="handleDropdownClick">
                <a-menu-item key="profile"><UserOutlined /> 个人中心</a-menu-item>
                <a-menu-item key="logout"><LogoutOutlined /> 退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 主内容区 -->
      <a-layout-content class="main-content">
        <router-view />
      </a-layout-content>
    </a-layout>

    <!-- 移动端底部Tab导航 -->
    <div class="mobile-tabbar">
      <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: selectedKeys[0] === tab.key }" @click="navigateTo(tab.key)">
        <i :class="tab.icon" class="tab-icon"></i>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>
  </a-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { message } from 'ant-design-vue'

import {
  AppstoreOutlined, MoonOutlined, HeartOutlined, MedicineBoxOutlined,
  BarChartOutlined, UserOutlined, MenuUnfoldOutlined, MenuFoldOutlined,
  BellOutlined, LogoutOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const collapsed = ref(false)
const selectedKeys = ref(['dashboard'])

const routeKeyMap = {
  Dashboard: 'dashboard', SleepAnalysis: 'sleep', HeartRate: 'heart-rate',
  Medicine: 'medicine', DataCharts: 'data', Profile: 'profile',
}

const tabs = [
  { key: 'dashboard', icon: 'fas fa-home', label: '首页' },
  { key: 'sleep', icon: 'fas fa-moon', label: '睡眠' },
  { key: 'heart-rate', icon: 'fas fa-heart', label: '心率' },
  { key: 'data', icon: 'fas fa-chart-line', label: '数据' },
  { key: 'profile', icon: 'fas fa-user', label: '我的' },
]

const currentTitle = computed(() => {
  const map = {
    Dashboard: '首页', SleepAnalysis: '睡眠分析', HeartRate: '心率趋势',
    Medicine: '药品管理', DataCharts: '健康数据', Profile: '个人中心',
  }
  return map[route.name] || '首页'
})

function handleMenuClick({ key }) {
  router.push(`/${key}`)
}

function navigateTo(key) {
  router.push(`/${key}`)
}

function handleDropdownClick({ key }) {
  if (key === 'profile') router.push('/profile')
  else if (key === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}

function showNotifications() {
  message.info(notifStore.notifications[0]?.content || '暂无新通知')
}

watch(() => route.name, (name) => {
  if (routeKeyMap[name]) selectedKeys.value = [routeKeyMap[name]]
})

onMounted(() => {
  notifStore.loadNotifications()
  if (routeKeyMap[route.name]) selectedKeys.value = [routeKeyMap[route.name]]
})
</script>

<style scoped>
.main-layout { height: 100vh; }
.desktop-sider { position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
.brand { height: 64px; display: flex; align-items: center; justify-content: center; gap: 10px; color: #fff; font-size: 18px; font-weight: bold; background: rgba(255,255,255,0.05); }
.brand-icon { font-size: 26px; }
.main-header { background: #fff; padding: 0 24px; display: flex; align-items: center; height: 64px; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.trigger { font-size: 18px; cursor: pointer; margin-right: 20px; }
.trigger:hover { color: #52B788; }
.header-center { flex: 1; }
.header-right { display: flex; align-items: center; gap: 20px; }
.header-icon { font-size: 18px; cursor: pointer; color: #6B7280; }
.header-icon:hover { color: #52B788; }
.user-info { cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; }
.user-name { color: #374151; }
.main-content { margin: 24px; min-height: calc(100vh - 112px); overflow-y: auto; }
.main-content :deep(.ant-card) { border-radius: 12px; }

/* 移动端底部导航 */
.mobile-tabbar { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #F3F4F6; padding: 6px 0; z-index: 1000; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
.tab-item { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; flex: 1; }
.tab-icon { font-size: 18px; color: #9CA3AF; }
.tab-label { font-size: 10px; color: #9CA3AF; }
.tab-item.active .tab-icon { color: #52B788; }
.tab-item.active .tab-label { color: #52B788; font-weight: 500; }

@media (max-width: 768px) {
  .desktop-sider { display: none; }
  .main-content { margin: 16px; padding-bottom: 64px; }
  .mobile-tabbar { display: flex; }
  .trigger { display: none; }
  .header-center { display: none; }
}
</style>
