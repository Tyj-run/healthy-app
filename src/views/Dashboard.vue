<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h2>您好，{{ profileStore.info.name }}</h2>
        <p>{{ currentDate }}，祝您健康愉快！</p>
      </div>
      <div class="user-avatar" @click="router.push('/profile')">
        <a-avatar :size="48" style="backgroundColor: #52B788; cursor: pointer;">
          <template #icon><UserOutlined /></template>
        </a-avatar>
      </div>
    </div>

    <!-- 快捷功能区 -->
    <a-row :gutter="12" class="quick-actions">
      <a-col :span="6" v-for="action in quickActions" :key="action.title">
        <a-card class="action-card" :style="{ background: action.bg }" hoverable @click="handleAction(action)">
          <div class="action-icon" :style="{ background: action.iconBg }">
            <i :class="action.icon"></i>
          </div>
          <span class="action-title">{{ action.title }}</span>
        </a-card>
      </a-col>
    </a-row>

    <!-- 今日用药提醒 -->
    <div class="section">
      <div class="section-header">
        <h3><BellOutlined /> 今日用药提醒</h3>
        <a @click="router.push('/medicine')" class="view-all">查看全部</a>
      </div>
      <div v-for="med in todayMedicines" :key="med.id" class="med-card">
        <div class="med-left">
          <div class="med-icon" :style="{ background: getMedColor(med.id) }">
            <i class="fas fa-pills"></i>
          </div>
          <div class="med-info">
            <h4>{{ med.name }}</h4>
            <p>{{ med.dosage }}</p>
          </div>
        </div>
        <div class="med-right">
          <span class="med-time">{{ getNextTime(med) }}</span>
          <a-tag :color="getMedStatus(med).color">{{ getMedStatus(med).text }}</a-tag>
        </div>
      </div>
    </div>

    <!-- 健康数据 -->
    <div class="section">
      <div class="section-header">
        <h3><BarChartOutlined /> 健康数据</h3>
        <a @click="router.push('/data')" class="view-all">更多数据</a>
      </div>
      <a-row :gutter="12">
        <a-col :span="12" v-for="metric in healthMetrics" :key="metric.label" style="margin-bottom: 12px;">
          <a-card class="metric-card" hoverable>
            <div class="metric-header">
              <span class="metric-label">{{ metric.label }}</span>
              <i :class="metric.icon" :style="{ color: metric.color }"></i>
            </div>
            <div class="metric-value">
              <span class="value">{{ metric.value }}</span>
              <span class="unit">{{ metric.unit }}</span>
            </div>
            <span class="metric-trend" :style="{ color: metric.trendColor }">
              <ArrowUpOutlined v-if="metric.trend === 'up'" />
              <ArrowDownOutlined v-else />
              {{ metric.change }}
            </span>
          </a-card>
        </a-col>
      </a-row>
      <a-card class="chart-card">
        <h4>本周血糖趋势</h4>
        <v-chart :option="bloodSugarOption" autoresize style="height: 200px;" />
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useMedicineStore } from '@/stores/medicine'
import { UserOutlined, BellOutlined, BarChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const router = useRouter()
const profileStore = useProfileStore()
const medicineStore = useMedicineStore()

const currentDate = dayjs().format('YYYY年M月D日 dddd')

const quickActions = [
  { title: '药品识别', icon: 'fas fa-pills', bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', iconBg: '#52B788', action: 'medication' },
  { title: '用药提醒', icon: 'fas fa-bell', bg: 'linear-gradient(135deg, #B4E4D0 0%, #8FD5B8 100%)', iconBg: '#40916C', action: 'reminder' },
  { title: '设备管理', icon: 'fas fa-bluetooth-b', bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', iconBg: '#F59E0B', action: 'devices' },
  { title: '健康报告', icon: 'fas fa-file-medical-alt', bg: 'linear-gradient(135deg, #E9D5FF 0%, #D8B4FE 100%)', iconBg: '#8B5CF6', action: 'report' },
]

const todayMedicines = computed(() => medicineStore.medicines.filter(m => m.reminder))

function getMedColor(id) {
  const colors = ['#52B788', '#40916C', '#F59E0B', '#8B5CF6', '#EF4444']
  return colors[id % colors.length]
}

function getNextTime(med) {
  return med.times[0] || '--:--'
}

function getMedStatus(med) {
  const now = dayjs().format('HH:mm')
  const passed = med.times.filter(t => t <= now)
  if (passed.length === med.times.length) return { text: '已完成', color: 'green' }
  if (passed.length > 0) return { text: '部分完成', color: 'orange' }
  return { text: '待提醒', color: 'default' }
}

const healthMetrics = [
  { label: '心率', icon: 'fas fa-heart', value: '72', unit: 'bpm', color: '#EF4444', trend: 'down', change: '较昨日下降2bpm', trendColor: '#52C41A' },
  { label: '血糖', icon: 'fas fa-tint', value: '5.4', unit: 'mmol/L', color: '#8B5CF6', trend: 'down', change: '较昨日下降0.3', trendColor: '#52C41A' },
  { label: '睡眠', icon: 'fas fa-moon', value: '7.2', unit: '小时', color: '#3B82F6', trend: 'down', change: '较昨日减少0.5小时', trendColor: '#F5222D' },
  { label: '步数', icon: 'fas fa-walking', value: '6,432', unit: '步', color: '#52C41A', trend: 'up', change: '较昨日增加1,245步', trendColor: '#52C41A' },
]

const bloodSugarOption = {
  grid: { top: '8%', right: '3%', bottom: '12%', left: '3%' },
  xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#6B7280' } },
  yAxis: { type: 'value', min: 4, max: 8, interval: 1, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#6B7280' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
  series: [{ data: [5.8, 6.2, 5.9, 5.7, 5.5, 5.4, 5.4], type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#3B82F6' }, lineStyle: { color: '#3B82F6', width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }] } } }],
  tooltip: { trigger: 'axis' },
}

function handleAction(action) {
  if (action.action === 'medication') message.info('药品识别功能开发中')
  else if (action.action === 'reminder') router.push('/medicine')
  else if (action.action === 'devices') message.info('设备管理功能开发中')
  else if (action.action === 'report') message.info('健康报告功能开发中')
}

onMounted(() => {
  if (medicineStore.medicines.length === 0) medicineStore.loadMedicines()
})
</script>

<style scoped>
.dashboard { padding: 0 0 20px 0; }
.welcome-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.welcome-text h2 { font-size: 22px; font-weight: bold; margin: 0 0 4px 0; color: #1F2937; }
.welcome-text p { font-size: 13px; color: #6B7280; margin: 0; }
.quick-actions { margin-bottom: 24px; }
.action-card { text-align: center; border: none; border-radius: 12px; padding: 8px 0; }
.action-card :deep(.ant-card-body) { padding: 16px 8px; }
.action-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; color: #fff; font-size: 16px; }
.action-title { font-size: 12px; font-weight: 500; display: block; }
.section { margin-bottom: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 16px; font-weight: bold; margin: 0; color: #1F2937; }
.view-all { font-size: 13px; color: #52B788; }
.med-card { background: #fff; border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.med-left { display: flex; align-items: center; gap: 12px; }
.med-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; }
.med-info h4 { font-size: 14px; font-weight: 500; margin: 0 0 2px 0; }
.med-info p { font-size: 12px; color: #6B7280; margin: 0; }
.med-right { text-align: right; }
.med-time { font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px; }
.metric-card { border-radius: 12px; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.metric-card :deep(.ant-card-body) { padding: 16px; }
.metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.metric-label { font-size: 12px; color: #6B7280; }
.metric-value { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
.metric-value .value { font-size: 24px; font-weight: bold; color: #1F2937; }
.metric-value .unit { font-size: 12px; color: #9CA3AF; }
.metric-trend { font-size: 11px; display: flex; align-items: center; gap: 2px; }
.chart-card { border-radius: 12px; }
.chart-card :deep(.ant-card-body) { padding: 16px; }
.chart-card h4 { font-size: 14px; font-weight: 500; margin: 0 0 12px 0; }
</style>
