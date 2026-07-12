import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const EXPIRE_MINUTES = 3 // 登录有效期3分钟
const PASSWORD_KEY = 'health_password'   // 存储密码用
const ACCOUNT_KEY = 'health_account'     // 存储账号信息（邮箱、手机号）

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const expiresAt = ref(localStorage.getItem('expiresAt') || '')

  const isLoggedIn = computed(() => {
    if (!token.value || !user.value) return false
    if (!expiresAt.value) return false
    if (Date.now() > parseInt(expiresAt.value)) {
      logout()
      return false
    }
    return true
  })

  const remainingSeconds = computed(() => {
    if (!expiresAt.value) return 0
    const diff = parseInt(expiresAt.value) - Date.now()
    return Math.max(0, Math.round(diff / 1000))
  })

  function checkLogin() {
    const saved = localStorage.getItem('user')
    const exp = localStorage.getItem('expiresAt')
    if (saved && exp) {
      try {
        user.value = JSON.parse(saved)
        expiresAt.value = exp
        if (Date.now() > parseInt(exp)) {
          logout()
        }
      } catch {
        logout()
      }
    }
  }

  /** 读取存储的密码 */
  function getStoredPassword() {
    return localStorage.getItem(PASSWORD_KEY) || ''
  }

  /** 读取存储的账号信息 */
  function getAccountInfo() {
    try {
      const raw = localStorage.getItem(ACCOUNT_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { email: '', phone: '' }
  }

  /** 保存账号信息 */
  function saveAccountInfo(data) {
    const current = getAccountInfo()
    Object.assign(current, data)
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(current))
  }

  function login(credentials) {
    if (credentials.username && credentials.password) {
      // 支持用邮箱登录：根据邮箱找到对应的 username
      const accountInfo = getAccountInfo()
      let loginId = credentials.username
      if (loginId.includes('@') && accountInfo.email === loginId) {
        // 用邮箱登录，从 localStorage 获取 username
        try {
          const userData = JSON.parse(localStorage.getItem('user'))
          if (userData?.username) loginId = userData.username
        } catch {}
      }

      // 如果有存储的密码，校验密码是否正确
      const storedPwd = getStoredPassword()
      if (storedPwd && credentials.password !== storedPwd) {
        return false // 密码错误
      }

      let savedName = ''
      let savedAvatar = ''
      try {
        const prevUser = JSON.parse(localStorage.getItem('user'))
        if (prevUser?.name) savedName = prevUser.name
        if (prevUser?.avatar) savedAvatar = prevUser.avatar
      } catch {}
      if (!savedName) {
        try {
          const saved = JSON.parse(localStorage.getItem('health_profile'))
          if (saved?.name) savedName = saved.name
        } catch {}
      }
      if (!savedAvatar) {
        savedAvatar = localStorage.getItem('avatarUrl') || ''
      }
      const userInfo = {
        username: loginId,
        name: savedName || (loginId === 'admin' ? '管理员' : loginId),
        avatar: savedAvatar,
      }
      user.value = userInfo
      token.value = 'mock-token-' + Date.now()
      expiresAt.value = String(Date.now() + EXPIRE_MINUTES * 60 * 1000)
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(userInfo))
      localStorage.setItem('expiresAt', expiresAt.value)

      // 如果是首次登录且没有密码，保存当前密码
      if (!storedPwd) {
        localStorage.setItem(PASSWORD_KEY, credentials.password)
      }

      return true
    }
    return false
  }

  function updateProfile(data) {
    if (user.value) {
      user.value = { ...user.value, ...data }
      localStorage.setItem('user', JSON.stringify(user.value))
      try {
        const profile = JSON.parse(localStorage.getItem('health_profile') || '{}')
        if (data.name !== undefined) profile.name = data.name
        if (data.avatar !== undefined) profile.avatar = data.avatar
        if (Object.keys(profile).length > 0) {
          localStorage.setItem('health_profile', JSON.stringify(profile))
        }
      } catch {}
    }
  }

  /** 更新密码 */
  function updatePassword(newPassword) {
    localStorage.setItem(PASSWORD_KEY, newPassword)
  }

  /** 根据用户标识查找账号是否存在 */
  function findAccount(identifier) {
    // 检查用户名
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      if (userData?.username === identifier) return true
    } catch {}
    // 检查邮箱/手机号
    const accountInfo = getAccountInfo()
    if (accountInfo.email === identifier || accountInfo.phone === identifier) return true
    // 检查 profile 中的邮箱/手机号
    try {
      const profile = JSON.parse(localStorage.getItem('health_profile'))
      if (profile?.email === identifier || profile?.phone === identifier) return true
    } catch {}
    return false
  }

  /** 重置密码（用于找回密码流程） */
  function resetPassword(newPassword) {
    localStorage.setItem(PASSWORD_KEY, newPassword)
  }

  function logout() {
    user.value = null
    token.value = ''
    expiresAt.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('expiresAt')
  }

  return {
    user, token, expiresAt, isLoggedIn, remainingSeconds,
    checkLogin, login, logout, updateProfile,
    updatePassword, getStoredPassword, getAccountInfo, saveAccountInfo,
    findAccount, resetPassword,
  }
})
