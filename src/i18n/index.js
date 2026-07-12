import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'

const savedLang = localStorage.getItem('health_language') || '简体中文'
const localeMap = { '简体中文': 'zh', 'English': 'en', '日本語': 'ja', '한국어': 'ko' }
const locale = localeMap[savedLang] || 'zh'

const i18n = createI18n({
  locale,
  fallbackLocale: 'zh',
  messages: { zh, en },
  legacy: false,
  globalInjection: true,
})

export function switchLanguage(label) {
  const map = { '简体中文': 'zh', 'English': 'en', '日本語': 'ja', '한국어': 'ko' }
  i18n.global.locale.value = map[label] || 'zh'
  document.documentElement.lang = map[label] || 'zh-CN'
}

export default i18n
