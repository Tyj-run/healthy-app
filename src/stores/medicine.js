import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'health_medicines'

const DEFAULTS = [
  { id: 1, name: '阿司匹林肠溶片', form: '片剂', dosage: '每日2次，每次1片', times: ['08:00', '20:00'], reminder: true, repeat: [1,2,3,4,5], voiceReminder: true, perDose: 1 },
  { id: 2, name: '盐酸二甲双胍片', form: '片剂', dosage: '每日3次，每次2片', times: ['07:30', '12:30', '18:30'], reminder: true, repeat: [1,2,3,4,5,6,7], voiceReminder: true, perDose: 2 },
  { id: 3, name: '辛伐他汀片', form: '片剂', dosage: '每日1次，每次1片', times: ['20:00'], reminder: true, repeat: [1,2,3,4,5,6,7], voiceReminder: false, perDose: 1 },
  { id: 4, name: '布洛芬缓释胶囊', form: '胶囊', dosage: '每日2次，每次1粒', times: ['09:00', '21:00'], reminder: true, repeat: [1,2,3,4,5], voiceReminder: true, perDose: 1 },
  { id: 5, name: '维生素C片', form: '片剂', dosage: '每日1次，每次2片', times: ['08:00'], reminder: false, repeat: [1,2,3,4,5,6,7], voiceReminder: false, perDose: 2 },
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

export const useMedicineStore = defineStore('medicine', () => {
  const saved = loadFromStorage()
  const medicines = ref(saved || [...DEFAULTS])
  const loading = ref(false)

  function persist() {
    saveToStorage(medicines.value)
  }

  function loadMedicines() {
    // 已经初始化过了
    if (medicines.value.length > 0) return
    loading.value = true
    const saved = loadFromStorage()
    medicines.value = saved || [...DEFAULTS]
    loading.value = false
  }

  function addMedicine(m) {
    medicines.value.push({ id: Date.now(), ...m })
    persist()
  }

  function updateMedicine(id, data) {
    const idx = medicines.value.findIndex(m => m.id === id)
    if (idx !== -1) {
      Object.assign(medicines.value[idx], data)
      persist()
    }
  }

  function deleteMedicine(id) {
    medicines.value = medicines.value.filter(m => m.id !== id)
    persist()
  }

  return { medicines, loading, loadMedicines, addMedicine, updateMedicine, deleteMedicine }
})
