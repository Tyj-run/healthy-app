import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const STORAGE_KEY = 'health_heartRateRecords'

const DEFAULTS = [
  { id: 1, date: '2026-07-11', time: '08:00', value: 72, status: '正常', note: '晨起测量' },
  { id: 2, date: '2026-07-11', time: '12:30', value: 85, status: '正常', note: '午饭后' },
  { id: 3, date: '2026-07-11', time: '18:00', value: 78, status: '正常', note: '傍晚' },
  { id: 4, date: '2026-07-10', time: '07:30', value: 68, status: '正常', note: '' },
  { id: 5, date: '2026-07-10', time: '14:00', value: 95, status: '偏高', note: '运动后' },
  { id: 6, date: '2026-07-09', time: '22:00', value: 62, status: '正常', note: '睡前' },
  { id: 7, date: '2026-07-09', time: '10:00', value: 76, status: '正常', note: '' },
  { id: 8, date: '2026-07-08', time: '16:30', value: 102, status: '偏高', note: '走路较快' },
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

export const useHeartRateStore = defineStore('heartRate', () => {
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
      if (filters.status && filters.status !== '全部') {
        if (r.status !== filters.status) return false
      }
      if (filters.minValue !== undefined && filters.minValue !== null && r.value < filters.minValue) return false
      if (filters.maxValue !== undefined && filters.maxValue !== null && r.value > filters.maxValue) return false
      return true
    })
  }

  const todayRecords = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return records.value.filter((r) => r.date === today)
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
    todayRecords,
  }
})
