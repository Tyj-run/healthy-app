import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const STORAGE_KEY = 'health_sleepRecords'

const DEFAULTS = [
  { id: 1, date: '2026-07-11', sleepTime: '23:15', wakeTime: '06:50', totalTime: '7h35m', qualityScore: 82, deepSleep: '2h30m', lightSleep: '3h30m', remSleep: '2h12m', awakeTime: '48m', notes: '睡眠质量不错' },
  { id: 2, date: '2026-07-10', sleepTime: '23:45', wakeTime: '06:30', totalTime: '6h45m', qualityScore: 70, deepSleep: '1h50m', lightSleep: '3h15m', remSleep: '1h50m', awakeTime: '1h', notes: '入睡较晚' },
  { id: 3, date: '2026-07-09', sleepTime: '22:50', wakeTime: '07:00', totalTime: '8h10m', qualityScore: 90, deepSleep: '3h', lightSleep: '3h40m', remSleep: '2h20m', awakeTime: '30m', notes: '非常充足的睡眠' },
  { id: 4, date: '2026-07-08', sleepTime: '23:30', wakeTime: '06:20', totalTime: '6h50m', qualityScore: 65, deepSleep: '1h40m', lightSleep: '3h30m', remSleep: '1h50m', awakeTime: '1h20m', notes: '夜里醒了几次' },
  { id: 5, date: '2026-07-07', sleepTime: '22:30', wakeTime: '06:00', totalTime: '7h30m', qualityScore: 78, deepSleep: '2h20m', lightSleep: '3h20m', remSleep: '2h', awakeTime: '40m', notes: '' },
]

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return null
}

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useSleepStore = defineStore('sleep', () => {
  const saved = loadFromStorage()
  const records = ref(saved || [...DEFAULTS])
  const loading = ref(false)

  const nextId = computed(() => records.value.length + 1)

  function persist() {
    saveToStorage(records.value)
  }

  function loadRecords() {
    loading.value = true
    const saved = loadFromStorage()
    records.value = saved || [...DEFAULTS]
    loading.value = false
  }

  function addRecord(record) {
    records.value.unshift({
      id: nextId.value,
      ...record,
    })
    persist()
  }

  function updateRecord(id, data) {
    const index = records.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      records.value[index] = { ...records.value[index], ...data }
      persist()
    }
  }

  function deleteRecord(id) {
    records.value = records.value.filter((r) => r.id !== id)
    persist()
  }

  function getRecordById(id) {
    return records.value.find((r) => r.id === id)
  }

  // 筛选
  function filterRecords(filters) {
    return records.value.filter((r) => {
      if (filters.dateRange && filters.dateRange.length === 2) {
        const start = dayjs(filters.dateRange[0]).format('YYYY-MM-DD')
        const end = dayjs(filters.dateRange[1]).format('YYYY-MM-DD')
        if (r.date < start || r.date > end) return false
      }
      if (filters.minQuality && r.qualityScore < filters.minQuality) return false
      if (filters.maxQuality && r.qualityScore > filters.maxQuality) return false
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase()
        if (!r.notes.toLowerCase().includes(kw) && r.date.includes(kw)) return false
      }
      return true
    })
  }

  const todaySleep = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return records.value.find((r) => r.date === today)
  })

  return {
    records,
    loading,
    loadRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordById,
    filterRecords,
    todaySleep,
  }
})
