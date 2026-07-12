<template>
  <div class="data-page">
    <div class="page-header">
      <h2><BarChartOutlined /> 健康数据</h2>
      <a-button class="export-btn"><DownloadOutlined /> 生成报告</a-button>
    </div>

    <!-- 实时心率 -->
    <a-card class="heart-card">
      <div class="heart-header">
        <h3><HeartOutlined style="color:#EF4444" /> 实时心率</h3>
        <span class="update-time">更新于: {{ heartTime }}</span>
      </div>
      <div class="heart-display">
        <div class="heart-circle">
          <span class="heart-value">{{ currentHeartRate }}</span>
          <span class="heart-unit">bpm</span>
        </div>
      </div>
      <div class="heart-info">
        <span>静息心率: <strong>65 bpm</strong></span>
        <span>最高心率: <strong>180 bpm</strong></span>
      </div>
    </a-card>

    <!-- 图表区域 -->
    <a-row :gutter="16">
      <a-col :span="24" style="margin-bottom: 16px;">
        <a-card title="❤️ 心率趋势">
          <v-chart :option="heartRateOption" autoresize style="height: 280px;" />
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card title="🌙 睡眠时长">
          <v-chart :option="sleepOption" autoresize style="height: 280px;" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 健康报告 -->
    <a-card class="report-card" style="margin-top: 16px;">
      <h3>📊 本周健康报告</h3>
      <a-row :gutter="12">
        <a-col :span="8" v-for="item in reportItems" :key="item.label">
          <div class="report-item">
            <p class="report-label">{{ item.label }}</p>
            <p class="report-value">{{ item.value }}</p>
          </div>
        </a-col>
      </a-row>
      <div class="report-bmi">
        <p>BMI指数: <strong>{{ bmi }}</strong></p>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { BarChartOutlined, DownloadOutlined, HeartOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent])

const currentHeartRate = ref(72)
const heartTime = ref(dayjs().format('HH:mm'))
let timer = null

const heartRateOption = {
  grid: { top: '5%', right: '3%', bottom: '10%', left: '3%' },
  xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#4B5563' } },
  yAxis: { type: 'value', min: 60, max: 90, interval: 10, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#4B5563', formatter: '{value} bpm' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
  series: [{ data: [72, 75, 70, 78, 74, 76, 73], type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#EF4444' }, lineStyle: { color: '#EF4444', width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(239,68,68,0.2)' }, { offset: 1, color: 'rgba(239,68,68,0)' }] } } }],
  tooltip: { trigger: 'axis' },
}

const sleepOption = {
  grid: { top: '5%', right: '3%', bottom: '10%', left: '3%' },
  xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#4B5563' } },
  yAxis: { type: 'value', min: 5, max: 9, interval: 1, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#4B5563', formatter: '{value} 小时' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
  series: [{ data: [7.5, 7.2, 7.8, 7.0, 7.3, 8.0, 7.6], type: 'bar', barWidth: '40%', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#8B5CF6' }, { offset: 1, color: '#A78BFA' }] }, borderRadius: [6,6,0,0] } }],
  tooltip: { trigger: 'axis' },
}

const reportItems = [
  { label: '平均心率', value: '72 bpm' },
  { label: '平均睡眠', value: '7.5 小时' },
  { label: '运动步数', value: '8,500 步' },
]

const bmi = ref(22.86)

function updateHeartRate() {
  currentHeartRate.value = 65 + Math.floor(Math.random() * 20)
  heartTime.value = dayjs().format('HH:mm')
}

onMounted(() => {
  timer = setInterval(updateHeartRate, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.data-page { padding: 0 0 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 20px; }
.export-btn { border-radius: 20px; }
.heart-card { text-align: center; margin-bottom: 16px; border-radius: 12px; }
.heart-header { display: flex; justify-content: space-between; align-items: center; }
.heart-header h3 { margin: 0; font-size: 15px; }
.update-time { font-size: 12px; color: #9CA3AF; }
.heart-display { margin: 24px 0; }
.heart-circle { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #EF4444; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; animation: pulse 2s infinite; }
.heart-value { font-size: 36px; font-weight: bold; color: #EF4444; line-height: 1; }
.heart-unit { font-size: 14px; color: #6B7280; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 15px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
.heart-info { display: flex; justify-content: center; gap: 24px; font-size: 13px; color: #6B7280; }
.report-card { border-radius: 12px; }
.report-card h3 { font-size: 16px; margin-bottom: 16px; }
.report-item { background: #D1FAE5; border-radius: 10px; padding: 12px; text-align: center; margin-bottom: 12px; }
.report-label { font-size: 12px; color: #6B7280; margin: 0 0 4px; }
.report-value { font-size: 16px; font-weight: bold; color: #1F2937; margin: 0; }
.report-bmi { margin-top: 8px; font-size: 13px; color: #6B7280; }
</style>
