import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'health_metrics'

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

export const useHealthStore = defineStore('health', () => {
  const saved = load()
  const heartRate = ref(saved?.heartRate ?? 72)
  const bloodSugar = ref(saved?.bloodSugar ?? 5.4)
  const sleepHours = ref(saved?.sleepHours ?? 7.2)
  const steps = ref(saved?.steps ?? 6432)

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      heartRate: heartRate.value,
      bloodSugar: bloodSugar.value,
      sleepHours: sleepHours.value,
      steps: steps.value,
    }))
  }

  function update(data) {
    if (data.heartRate !== undefined) heartRate.value = data.heartRate
    if (data.bloodSugar !== undefined) bloodSugar.value = data.bloodSugar
    if (data.sleepHours !== undefined) sleepHours.value = data.sleepHours
    if (data.steps !== undefined) steps.value = data.steps
    persist()
  }

  return { heartRate, bloodSugar, sleepHours, steps, update }
})
