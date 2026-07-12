<template>
  <div class="profile-page">
    <!-- 用户信息头部 -->
    <div class="profile-header">
      <div class="avatar-section">
        <a-avatar :size="96" style="backgroundColor: #52B788; cursor: pointer;">
          <template #icon><UserOutlined /></template>
        </a-avatar>
        <h2>{{ profileStore.info.name }}</h2>
        <p>{{ profileStore.info.gender }}，{{ profileStore.info.age }}岁</p>
      </div>
    </div>

    <!-- 个人信息卡片 -->
    <a-card class="info-card" title="个人信息">
      <div class="info-row" v-for="item in personalInfo" :key="item.label">
        <span class="info-label">{{ item.label }}</span>
        <span class="info-value">{{ item.value }}</span>
      </div>
    </a-card>

    <!-- 设置列表 -->
    <a-card class="settings-card" title="设置">
      <div class="setting-item" v-for="item in settings" :key="item.key" @click="handleSetting(item.key)">
        <div class="setting-left">
          <i :class="item.icon" :style="{ color: '#52B788' }"></i>
          <span>{{ item.label }}</span>
        </div>
        <RightOutlined style="color: #9CA3AF; font-size: 12px;" />
      </div>
    </a-card>

    <!-- 帮助中心 -->
    <a-card class="settings-card" title="帮助中心">
      <div class="setting-item" v-for="item in helpItems" :key="item.key" @click="handleSetting(item.key)">
        <div class="setting-left">
          <i :class="item.icon" :style="{ color: '#52B788' }"></i>
          <span>{{ item.label }}</span>
        </div>
        <RightOutlined style="color: #9CA3AF; font-size: 12px;" />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { UserOutlined, RightOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const profileStore = useProfileStore()
const auth = useAuthStore()
const router = useRouter()

const personalInfo = [
  { label: '身高', value: `${profileStore.info.height} cm` },
  { label: '体重', value: `${profileStore.info.weight} kg` },
  { label: '血型', value: profileStore.info.bloodType },
]

const settings = [
  { key: 'account', label: '账号管理', icon: 'fas fa-user-circle' },
  { key: 'notification', label: '通知设置', icon: 'fas fa-bell' },
  { key: 'device', label: '设备管理', icon: 'fas fa-bluetooth' },
  { key: 'privacy', label: '隐私设置', icon: 'fas fa-shield-alt' },
  { key: 'theme', label: '主题设置', icon: 'fas fa-moon' },
  { key: 'sync', label: '数据同步', icon: 'fas fa-cloud' },
  { key: 'about', label: '关于我们', icon: 'fas fa-question-circle' },
]

const helpItems = [
  { key: 'faq', label: '常见问题', icon: 'fas fa-question-circle' },
  { key: 'contact', label: '联系客服', icon: 'fas fa-headset' },
]

function handleSetting(key) {
  const actions = {
    account: () => message.info('账号管理功能开发中'),
    notification: () => message.info('通知设置功能开发中'),
    device: () => message.info('设备管理功能开发中'),
    privacy: () => message.info('隐私设置功能开发中'),
    theme: () => message.info('主题设置功能开发中'),
    sync: () => message.info('数据同步功能开发中'),
    about: () => message.info('健康管家 v1.0.0\n您的个人健康助手'),
    faq: () => message.info('常见问题功能开发中'),
    contact: () => message.info('联系客服: 400-123-4567'),
  }
  actions[key]?.()
}
</script>

<style scoped>
.profile-page { padding: 0 0 20px; }
.profile-header { text-align: center; padding: 24px 0 16px; }
.avatar-section h2 { font-size: 20px; font-weight: bold; margin: 12px 0 4px; color: #1F2937; }
.avatar-section p { font-size: 14px; color: #6B7280; margin: 0; }
.info-card, .settings-card { border-radius: 12px; margin-bottom: 16px; }
.info-card :deep(.ant-card-head-title), .settings-card :deep(.ant-card-head-title) { font-size: 15px; font-weight: 600; }
.info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
.info-row:last-child { border-bottom: none; }
.info-label { color: #6B7280; font-size: 14px; }
.info-value { color: #1F2937; font-weight: 500; font-size: 14px; }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #F3F4F6; cursor: pointer; }
.setting-item:last-child { border-bottom: none; }
.setting-left { display: flex; align-items: center; gap: 12px; }
.setting-left i { width: 18px; text-align: center; font-size: 15px; }
.setting-left span { font-size: 14px; color: #374151; }
</style>
