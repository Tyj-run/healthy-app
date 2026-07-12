<template>
  <div class="login-wrapper">
    <div class="login-card">

      <!-- ========== 登录表单 ========== -->
      <template v-if="currentView === 'login'">
        <div class="login-header">
          <i class="fas fa-heartbeat login-logo-icon"></i>
          <h1 class="login-title">{{ $t('login.title') }}</h1>
          <p class="login-subtitle">{{ $t('login.subtitle') }}</p>
        </div>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label>{{ $t('login.username') }}</label>
            <div class="input-wrap">
              <i class="fas fa-user input-prefix"></i>
              <input v-model="username" placeholder="用户 ID / 邮箱" class="login-input" />
            </div>
          </div>
          <div class="input-group">
            <label>{{ $t('login.password') }}</label>
            <div class="input-wrap">
              <i class="fas fa-lock input-prefix"></i>
              <input v-model="password" type="password" :placeholder="$t('login.placeholder.pwd')" class="login-input" />
            </div>
          </div>
          <p v-if="loginError" class="login-error">{{ loginError }}</p>
          <button type="submit" class="login-btn" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <span v-else>{{ $t('login.button') }}</span>
          </button>
        </form>
        <div class="login-links">
          <a class="forgot-link" @click="switchView('forgot')">忘记密码？</a>
        </div>
        <div class="login-footer">
          <p>{{ $t('login.testAccount') }}</p>
        </div>
      </template>

      <!-- ========== 找回密码 - 步骤1：输入身份标识 ========== -->
      <template v-if="currentView === 'forgot'">
        <div class="login-header">
          <i class="fas fa-key login-logo-icon"></i>
          <h1 class="login-title">找回密码</h1>
          <p class="login-subtitle">请输入用户名、绑定的邮箱或手机号</p>
        </div>
        <div class="login-form">
          <div class="input-group">
            <label>用户名 / 邮箱 / 手机号</label>
            <div class="input-wrap">
              <i class="fas fa-id-card input-prefix"></i>
              <input v-model="forgotIdentifier" placeholder="输入用户名、邮箱或手机号" class="login-input" />
            </div>
          </div>
          <p v-if="forgotError" class="login-error">{{ forgotError }}</p>
          <button class="login-btn" :disabled="forgotLoading" @click="findAccount">
            <i v-if="forgotLoading" class="fas fa-spinner fa-spin"></i>
            <span v-else>下一步</span>
          </button>
          <a class="back-link" @click="switchView('login')">← 返回登录</a>
        </div>
      </template>

      <!-- ========== 找回密码 - 步骤2：验证码 ========== -->
      <template v-if="currentView === 'verify'">
        <div class="login-header">
          <i class="fas fa-shield-alt login-logo-icon"></i>
          <h1 class="login-title">验证身份</h1>
          <p class="login-subtitle">验证码已发送至 <strong>{{ maskedIdentifier }}</strong></p>
        </div>
        <div class="login-form">
          <div class="input-group">
            <label>验证码</label>
            <div class="input-wrap">
              <i class="fas fa-sms input-prefix"></i>
              <input v-model="verifyCode" placeholder="请输入验证码" class="login-input" maxlength="6" />
            </div>
          </div>
          <p class="verify-hint">演示提示：任意6位验证码均可通过</p>
          <p v-if="forgotError" class="login-error">{{ forgotError }}</p>
          <button class="login-btn" @click="verifyCodeHandler">
            <span>验证</span>
          </button>
          <a class="back-link" @click="switchView('forgot')">← 返回上一步</a>
        </div>
      </template>

      <!-- ========== 找回密码 - 步骤3：设置新密码 ========== -->
      <template v-if="currentView === 'reset'">
        <div class="login-header">
          <i class="fas fa-lock login-logo-icon"></i>
          <h1 class="login-title">设置新密码</h1>
          <p class="login-subtitle">请输入您的新密码</p>
        </div>
        <div class="login-form">
          <div class="input-group">
            <label>新密码</label>
            <div class="input-wrap">
              <i class="fas fa-lock input-prefix"></i>
              <input v-model="newPassword" type="password" placeholder="至少3个字符" class="login-input" />
            </div>
          </div>
          <div class="input-group">
            <label>确认新密码</label>
            <div class="input-wrap">
              <i class="fas fa-check-circle input-prefix"></i>
              <input v-model="confirmPassword" type="password" placeholder="再次输入新密码" class="login-input" />
            </div>
          </div>
          <p v-if="forgotError" class="login-error">{{ forgotError }}</p>
          <button class="login-btn" :disabled="resetLoading" @click="resetPasswordHandler">
            <i v-if="resetLoading" class="fas fa-spinner fa-spin"></i>
            <span v-else>重置密码</span>
          </button>
          <a class="back-link" @click="switchView('login')">← 返回登录</a>
        </div>
      </template>

      <!-- ========== 找回密码 - 完成 ========== -->
      <template v-if="currentView === 'done'">
        <div class="login-header">
          <i class="fas fa-check-circle login-logo-icon" style="color:#52B788"></i>
          <h1 class="login-title">密码重置成功</h1>
          <p class="login-subtitle">请使用新密码登录</p>
        </div>
        <div class="login-form">
          <button class="login-btn" @click="switchView('login')">去登录</button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// 登录
const username = ref('')
const password = ref('')
const loading = ref(false)
const loginError = ref('')

// 找回密码流程
const currentView = ref('login') // login | forgot | verify | reset | done
const forgotIdentifier = ref('')
const forgotLoading = ref(false)
const forgotError = ref('')
const verifyCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const resetLoading = ref(false)
const maskedIdentifier = ref('')

function switchView(view) {
  currentView.value = view
  forgotError.value = ''
  loginError.value = ''
  if (view === 'login') {
    username.value = ''
    password.value = ''
  }
}

function handleLogin() {
  if (!username.value || !password.value) {
    loginError.value = '请输入用户名和密码'
    return
  }
  loginError.value = ''
  loading.value = true
  setTimeout(() => {
    const ok = auth.login({ username: username.value, password: password.value })
    if (ok) {
      router.push('/')
    } else {
      loginError.value = '密码错误，请重试'
    }
    loading.value = false
  }, 600)
}

function findAccount() {
  const id = forgotIdentifier.value.trim()
  if (!id) {
    forgotError.value = '请输入用户名、邮箱或手机号'
    return
  }
  forgotLoading.value = true
  forgotError.value = ''

  setTimeout(() => {
    forgotLoading.value = false
    const found = auth.findAccount(id)
    if (found) {
      // 脱敏显示
      if (id.includes('@')) {
        const [name, domain] = id.split('@')
        maskedIdentifier.value = name.slice(0, 2) + '***@' + domain
      } else if (id.length === 11 && /^1\d{10}$/.test(id)) {
        maskedIdentifier.value = id.slice(0, 3) + '****' + id.slice(7)
      } else {
        maskedIdentifier.value = id
      }
      verifyCode.value = ''
      currentView.value = 'verify'
    } else {
      forgotError.value = '未找到该账号，请确认输入的用户名、邮箱或手机号'
    }
  }, 500)
}

function verifyCodeHandler() {
  if (!verifyCode.value.trim()) {
    forgotError.value = '请输入验证码'
    return
  }
  forgotError.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  currentView.value = 'reset'
}

function resetPasswordHandler() {
  const pwd = newPassword.value
  const confirm = confirmPassword.value

  if (!pwd) {
    forgotError.value = '请输入新密码'
    return
  }
  if (pwd.length < 3) {
    forgotError.value = '密码至少3个字符'
    return
  }
  if (pwd !== confirm) {
    forgotError.value = '两次输入的密码不一致'
    return
  }

  forgotError.value = ''
  resetLoading.value = true

  setTimeout(() => {
    resetLoading.value = false
    auth.resetPassword(pwd)
    currentView.value = 'done'
  }, 400)
}
</script>

<style scoped>
.login-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%);
  padding: 20px;
}
.login-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}
.login-header {
  text-align: center;
  margin-bottom: 36px;
}
.login-logo-icon {
  font-size: 48px;
  color: #52B788;
  margin-bottom: 12px;
}
.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #1F2937;
  margin: 0 0 6px 0;
}
.login-subtitle {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}
.login-subtitle strong { color: #1F2937; }
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-prefix {
  position: absolute;
  left: 14px;
  color: #9CA3AF;
  font-size: 14px;
  z-index: 1;
}
.login-input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #F9FAFB;
  box-sizing: border-box;
}
.login-input:focus {
  border-color: #52B788;
  box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.15);
  background: #fff;
}
.login-input::placeholder { color: #9CA3AF; }
.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #52B788, #40916C);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  transition: opacity 0.2s;
}
.login-btn:active { opacity: 0.85; }
.login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.login-error { font-size: 13px; color: #EF4444; text-align: center; margin: -8px 0; }
.login-links { text-align: center; margin-top: 20px; }
.forgot-link { font-size: 13px; color: #52B788; cursor: pointer; }
.forgot-link:hover { text-decoration: underline; }
.back-link { font-size: 13px; color: #6B7280; cursor: pointer; display: block; text-align: center; }
.back-link:hover { color: #52B788; }
.verify-hint { font-size: 12px; color: #9CA3AF; text-align: center; margin: -8px 0; }
.login-footer { text-align: center; margin-top: 24px; }
.login-footer p { font-size: 12px; color: #9CA3AF; margin: 0; }
</style>
