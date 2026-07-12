import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'health_profile'

function loadDefaults() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return {
    name: '张先生',
    gender: '男',
    age: 30,
    height: 175,
    weight: 70,
    bloodType: 'A型',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    avatar: '',
  }
}

export const useProfileStore = defineStore('profile', () => {
  const info = ref(loadDefaults())

  function updateInfo(data) {
    Object.assign(info.value, data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info.value))
  }

  function resetInfo() {
    const defaults = {
      name: '张先生', gender: '男', age: 30, height: 175, weight: 70,
      bloodType: 'A型', email: 'zhangsan@example.com', phone: '13800138000', avatar: '',
    }
    Object.assign(info.value, defaults)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info.value))
  }

  return { info, updateInfo, resetInfo }
})
