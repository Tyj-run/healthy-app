<template>
  <div class="heartrate-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>❤️ 心率趋势</h2>
      <a-button type="primary" @click="openAddModal">
        <template #icon><PlusOutlined /></template>
        新增记录
      </a-button>
    </div>

    <!-- 实时心率卡片 -->
    <a-row :gutter="16" class="summary-row">
      <a-col :span="6">
        <a-card class="summary-card heart-display" hoverable>
          <div class="heart-value">
            <span class="value">{{ currentHeartRate }}</span>
            <span class="unit">次/分</span>
          </div>
          <div class="heart-label">当前心率</div>
          <a-tag :color="heartStatus.color">{{ heartStatus.text }}</a-tag>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="summary-card" hoverable>
          <statistic title="今日最低" :value="todayStats.min" suffix="次/分">
            <template #prefix><ArrowDownOutlined style="color: #52c41a" /></template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="summary-card" hoverable>
          <statistic title="今日最高" :value="todayStats.max" suffix="次/分">
            <template #prefix><ArrowUpOutlined style="color: #f5222d" /></template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="summary-card" hoverable>
          <statistic title="总记录数" :value="heartStore.records.length" suffix="条">
            <template #prefix><FileTextOutlined style="color: #1890ff" /></template>
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
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" style="width: 120px" allowClear>
            <a-select-option value="全部">全部</a-select-option>
            <a-select-option value="正常">正常</a-select-option>
            <a-select-option value="偏高">偏高</a-select-option>
            <a-select-option value="偏低">偏低</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="心率范围">
          <a-input-number v-model:value="filters.minValue" placeholder="最低" :min="0" :max="200" style="width: 90px" />
          <span style="margin: 0 8px">-</span>
          <a-input-number v-model:value="filters.maxValue" placeholder="最高" :min="0" :max="200" style="width: 90px" />
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
        :loading="heartStore.loading"
        rowKey="id"
        :pagination="{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'value'">
            <span :style="{ color: getValueColor(record.value), fontWeight: 'bold', fontSize: '16px' }">
              {{ record.value }}
            </span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusTagColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-if="column.key === 'note'">
            {{ record.note || '-' }}
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
      :title="isEditing ? '编辑心率记录' : '新增心率记录'"
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
            <a-form-item label="时间" name="time">
              <a-time-picker v-model:value="formData.time" format="HH:mm" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="心率值" name="value">
              <a-input-number v-model:value="formData.value" :min="30" :max="220" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select v-model:value="formData.status" style="width: 100%">
                <a-select-option value="正常">正常</a-select-option>
                <a-select-option value="偏高">偏高</a-select-option>
                <a-select-option value="偏低">偏低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="备注" name="note">
          <a-textarea v-model:value="formData.note" :rows="2" placeholder="例如：运动后测量、晨起测量等" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useHeartRateStore } from '@/stores/heartRate'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

// Icons
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'

const heartStore = useHeartRateStore()

// 模拟当前心率
const currentHeartRate = ref(72)
const heartStatus = computed(() => {
  if (currentHeartRate.value < 60) return { text: '偏低', color: 'blue' }
  if (currentHeartRate.value <= 100) return { text: '正常', color: 'green' }
  return { text: '偏高', color: 'red' }
})

// 今日统计
const todayStats = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  const todaysRecords = heartStore.records.filter((r) => r.date === today)
  if (todaysRecords.length === 0) return { min: '-', max: '-', avg: '-' }
  const values = todaysRecords.map((r) => r.value)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  }
})

// 模拟实时心率更新
setInterval(() => {
  const variation = Math.floor(Math.random() * 7) - 3
  currentHeartRate.value = Math.max(50, Math.min(110, currentHeartRate.value + variation))
}, 3000)

// 表格列
const columns = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 110, sorter: (a, b) => a.date.localeCompare(b.date) },
  { title: '时间', dataIndex: 'time', key: 'time', width: 80 },
  { title: '心率值', dataIndex: 'value', key: 'value', width: 90, sorter: (a, b) => a.value - b.value },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '备注', dataIndex: 'note', key: 'note', ellipsis: true },
  { title: '操作', key: 'actions', width: 140, fixed: 'right' },
]

// 筛选
const filters = reactive({
  dateRange: [],
  status: '全部',
  minValue: undefined,
  maxValue: undefined,
})

const filteredData = ref([])

function applyFilter() {
  const f = {
    dateRange: filters.dateRange && filters.dateRange.length === 2
      ? [dayjs(filters.dateRange[0]).format('YYYY-MM-DD'), dayjs(filters.dateRange[1]).format('YYYY-MM-DD')]
      : [],
    status: filters.status || '全部',
    minValue: filters.minValue !== undefined ? filters.minValue : undefined,
    maxValue: filters.maxValue !== undefined ? filters.maxValue : undefined,
  }
  filteredData.value = heartStore.filterRecords(f)
  message.success('筛选完成')
}

function resetFilter() {
  filters.dateRange = []
  filters.status = '全部'
  filters.minValue = undefined
  filters.maxValue = undefined
  filteredData.value = [...heartStore.records]
  message.info('已重置筛选条件')
}

function getValueColor(value) {
  if (value < 60) return '#1890ff'
  if (value <= 100) return '#52c41a'
  return '#f5222d'
}

function getStatusTagColor(status) {
  const map = { '正常': 'green', '偏高': 'red', '偏低': 'blue' }
  return map[status] || 'default'
}

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const formData = reactive({
  date: undefined,
  time: undefined,
  value: 72,
  status: '正常',
  note: '',
})

const formRules = {
  date: [{ required: true, message: '请选择日期' }],
  time: [{ required: true, message: '请选择时间' }],
  value: [{ required: true, message: '请输入心率值' }],
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  formData.date = dayjs()
  formData.time = dayjs()
  formData.value = 72
  formData.status = '正常'
  formData.note = ''
  modalVisible.value = true
}

function openEditModal(record) {
  isEditing.value = true
  editingId.value = record.id
  formData.date = dayjs(record.date)
  formData.time = dayjs(`2026-07-11 ${record.time}`)
  formData.value = record.value
  formData.status = record.status
  formData.note = record.note
  modalVisible.value = true
}

async function handleModalOk() {
  try {
    await formRef.value.validate()
    modalLoading.value = true

    const data = {
      date: dayjs(formData.date).format('YYYY-MM-DD'),
      time: dayjs(formData.time).format('HH:mm'),
      value: formData.value,
      status: formData.status,
      note: formData.note,
    }

    setTimeout(() => {
      if (isEditing.value) {
        heartStore.updateRecord(editingId.value, data)
        message.success('记录已更新')
      } else {
        heartStore.addRecord(data)
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
  heartStore.deleteRecord(id)
  message.success('记录已删除')
  applyFilter()
}

onMounted(() => {
  heartStore.loadRecords()
  filteredData.value = [...heartStore.records]
})
</script>

<style scoped>
.heartrate-page {
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
.heart-display {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
}
.heart-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}
.heart-value .value {
  font-size: 48px;
  font-weight: bold;
  color: #f5222d;
  line-height: 1;
}
.heart-value .unit {
  font-size: 14px;
  color: #999;
}
.heart-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.filter-card {
  margin-bottom: 24px;
}
</style>
