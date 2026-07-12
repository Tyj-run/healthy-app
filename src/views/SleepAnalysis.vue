<template>
  <div class="sleep-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>🌙 睡眠分析</h2>
      <a-button type="primary" @click="openAddModal">
        <template #icon><PlusOutlined /></template>
        新增记录
      </a-button>
    </div>

    <!-- 今日概况卡片 -->
    <a-row :gutter="16" class="summary-row">
      <a-col :span="6">
        <a-card class="summary-card" hoverable>
          <statistic title="总睡眠时间" :value="todayTotalTime" suffix="">
            <template #prefix><ClockCircleOutlined style="color: #1890ff" /></template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="summary-card" hoverable>
          <statistic title="睡眠质量" :value="todayQuality" suffix="分">
            <template #prefix><StarOutlined style="color: #faad14" /></template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="summary-card" hoverable>
          <statistic title="入睡时间" :value="todaySleepTime" suffix="">
            <template #prefix><MoonOutlined style="color: #722ed1" /></template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="summary-card" hoverable>
          <statistic title="总记录数" :value="sleepStore.records.length" suffix="条">
            <template #prefix><FileTextOutlined style="color: #52c41a" /></template>
          </statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 筛选条件 -->
    <a-card class="filter-card">
      <a-form layout="inline" :model="filters">
        <a-form-item label="日期范围">
          <a-range-picker v-model:value="filters.dateRange" />
        </a-form-item>
        <a-form-item label="最低评分">
          <a-slider
            v-model:value="filters.minQuality"
            :min="0"
            :max="100"
            style="width: 160px"
          />
        </a-form-item>
        <a-form-item label="最高评分">
          <a-slider
            v-model:value="filters.maxQuality"
            :min="0"
            :max="100"
            style="width: 160px"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">
            <template #icon><SearchOutlined /></template>
            筛选
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card>
      <a-table
        :dataSource="filteredData"
        :columns="columns"
        :loading="sleepStore.loading"
        rowKey="id"
        :pagination="{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'qualityScore'">
            <a-tag :color="getQualityColor(record.qualityScore)">
              {{ record.qualityScore }} 分
            </a-tag>
          </template>
          <template v-if="column.key === 'notes'">
            {{ record.notes || '-' }}
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="openEditModal(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这条记录吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" danger size="small">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEditing ? '编辑睡眠记录' : '新增睡眠记录'"
      @ok="handleModalOk"
      :confirmLoading="modalLoading"
      destroyOnClose
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="日期" name="date">
              <a-date-picker v-model:value="formData.date" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="入睡时间" name="sleepTime">
              <a-time-picker v-model:value="formData.sleepTime" format="HH:mm" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="醒来时间" name="wakeTime">
              <a-time-picker v-model:value="formData.wakeTime" format="HH:mm" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="总睡眠时间" name="totalTime">
              <a-input v-model:value="formData.totalTime" placeholder="例如: 7h35m" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="深睡时长" name="deepSleep">
              <a-input v-model:value="formData.deepSleep" placeholder="例如: 2h30m" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="浅睡时长" name="lightSleep">
              <a-input v-model:value="formData.lightSleep" placeholder="例如: 3h30m" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="REM时长" name="remSleep">
              <a-input v-model:value="formData.remSleep" placeholder="例如: 2h12m" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="质量评分" name="qualityScore">
              <a-input-number v-model:value="formData.qualityScore" :min="0" :max="100" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="备注" name="notes">
          <a-textarea v-model:value="formData.notes" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSleepStore } from '@/stores/sleep'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

// Icons
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  StarOutlined,
  MoonOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'

const sleepStore = useSleepStore()

// 表格列定义
const columns = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 110, sorter: (a, b) => a.date.localeCompare(b.date) },
  { title: '入睡', dataIndex: 'sleepTime', key: 'sleepTime', width: 80 },
  { title: '醒来', dataIndex: 'wakeTime', key: 'wakeTime', width: 80 },
  { title: '总时长', dataIndex: 'totalTime', key: 'totalTime', width: 100 },
  { title: '深睡', dataIndex: 'deepSleep', key: 'deepSleep', width: 90 },
  { title: '浅睡', dataIndex: 'lightSleep', key: 'lightSleep', width: 90 },
  { title: 'REM', dataIndex: 'remSleep', key: 'remSleep', width: 80 },
  { title: '评分', dataIndex: 'qualityScore', key: 'qualityScore', width: 90, sorter: (a, b) => a.qualityScore - b.qualityScore },
  { title: '备注', dataIndex: 'notes', key: 'notes', ellipsis: true },
  { title: '操作', key: 'actions', width: 140, fixed: 'right' },
]

// 筛选条件
const filters = reactive({
  dateRange: [],
  minQuality: 0,
  maxQuality: 100,
})

// 筛选后的数据
const filteredData = ref([])

function applyFilter() {
  const f = {
    dateRange: filters.dateRange && filters.dateRange.length === 2
      ? [dayjs(filters.dateRange[0]).format('YYYY-MM-DD'), dayjs(filters.dateRange[1]).format('YYYY-MM-DD')]
      : [],
    minQuality: filters.minQuality || 0,
    maxQuality: filters.maxQuality || 100,
  }
  filteredData.value = sleepStore.filterRecords(f)
  message.success('筛选完成')
}

function resetFilter() {
  filters.dateRange = []
  filters.minQuality = 0
  filters.maxQuality = 100
  filteredData.value = [...sleepStore.records]
  message.info('已重置筛选条件')
}

// 今日概况
const todayTotalTime = computed(() => {
  return sleepStore.todaySleep?.totalTime || '-'
})
const todayQuality = computed(() => {
  return sleepStore.todaySleep?.qualityScore || '-'
})
const todaySleepTime = computed(() => {
  return sleepStore.todaySleep?.sleepTime || '-'
})

// 评分颜色
function getQualityColor(score) {
  if (score >= 85) return 'green'
  if (score >= 70) return 'orange'
  return 'red'
}

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const formData = reactive({
  date: undefined,
  sleepTime: undefined,
  wakeTime: undefined,
  totalTime: '',
  deepSleep: '',
  lightSleep: '',
  remSleep: '',
  qualityScore: 80,
  notes: '',
})

const formRules = {
  date: [{ required: true, message: '请选择日期' }],
  sleepTime: [{ required: true, message: '请选择入睡时间' }],
  wakeTime: [{ required: true, message: '请选择醒来时间' }],
  totalTime: [{ required: true, message: '请输入总睡眠时间' }],
  qualityScore: [{ required: true, message: '请输入质量评分' }],
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  formData.date = dayjs()
  formData.sleepTime = dayjs('2026-07-11 23:00')
  formData.wakeTime = dayjs('2026-07-12 07:00')
  formData.totalTime = ''
  formData.deepSleep = ''
  formData.lightSleep = ''
  formData.remSleep = ''
  formData.qualityScore = 80
  formData.notes = ''
  modalVisible.value = true
}

function openEditModal(record) {
  isEditing.value = true
  editingId.value = record.id
  formData.date = dayjs(record.date)
  formData.sleepTime = dayjs(`2026-07-11 ${record.sleepTime}`)
  formData.wakeTime = dayjs(`2026-07-11 ${record.wakeTime}`)
  formData.totalTime = record.totalTime
  formData.deepSleep = record.deepSleep
  formData.lightSleep = record.lightSleep
  formData.remSleep = record.remSleep
  formData.qualityScore = record.qualityScore
  formData.notes = record.notes
  modalVisible.value = true
}

async function handleModalOk() {
  try {
    await formRef.value.validate()
    modalLoading.value = true

    const data = {
      date: dayjs(formData.date).format('YYYY-MM-DD'),
      sleepTime: dayjs(formData.sleepTime).format('HH:mm'),
      wakeTime: dayjs(formData.wakeTime).format('HH:mm'),
      totalTime: formData.totalTime,
      deepSleep: formData.deepSleep,
      lightSleep: formData.lightSleep,
      remSleep: formData.remSleep,
      qualityScore: formData.qualityScore,
      notes: formData.notes,
      awakeTime: formData.awakeTime || '0m',
    }

    setTimeout(() => {
      if (isEditing.value) {
        sleepStore.updateRecord(editingId.value, data)
        message.success('记录已更新')
      } else {
        sleepStore.addRecord(data)
        message.success('记录已添加')
      }
      modalLoading.value = false
      modalVisible.value = false
      applyFilter()
    }, 300)
  } catch {
    // 验证不通过
  }
}

function handleDelete(id) {
  sleepStore.deleteRecord(id)
  message.success('记录已删除')
  applyFilter()
}

onMounted(() => {
  sleepStore.loadRecords()
  filteredData.value = [...sleepStore.records]
})
</script>

<style scoped>
.sleep-page {
  max-width: 1400px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h2 {
  margin: 0;
  font-size: 24px;
}
.summary-row {
  margin-bottom: 24px;
}
.summary-card {
  text-align: center;
}
.filter-card {
  margin-bottom: 24px;
}
</style>
