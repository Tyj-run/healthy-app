import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])

  function loadNotifications() {
    notifications.value = [
      { id: 1, icon: 'fa-pills', iconBg: '#52B788', title: '用药提醒', content: '您该服用降压药了', time: '5分钟前', color: 'primary' },
      { id: 2, icon: 'fa-bell', iconBg: '#F59E0B', title: '健康报告', content: '您的本周健康报告已生成', time: '1小时前', color: 'accent' },
      { id: 3, icon: 'fa-heartbeat', iconBg: '#40916C', title: '心率异常', content: '您的心率超过正常范围', time: '昨天', color: 'secondary' },
    ]
  }

  function addNotification(n) {
    notifications.value.unshift({ id: Date.now(), ...n })
  }

  return { notifications, loadNotifications, addNotification }
})
