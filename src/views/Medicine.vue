<template>
  <div class="medicine-page">
    <div class="page-header">
      <h2><MedicineBoxOutlined /> 我的药品</h2>
      <a-button type="primary" @click="showAddModal = true"><PlusOutlined /> 添加药品</a-button>
    </div>

    <!-- 药品列表 -->
    <div v-for="med in medicineStore.medicines" :key="med.id" class="med-item">
      <div class="med-content">
        <img :src="`https://picsum.photos/seed/med${med.id}/80/80`" class="med-img" />
        <div class="med-detail">
          <h3>{{ med.name }}</h3>
          <p>{{ med.dosage }}</p>
          <div class="med-tags">
            <a-tag :color="med.reminder ? 'green' : 'default'">
              {{ med.reminder ? '已设置提醒' : '未设置提醒' }}
            </a-tag>
            <span class="med-repeat">{{ repeatText(med.repeat) }}</span>
          </div>
        </div>
      </div>
      <div class="med-actions">
        <a-button type="text" @click="editMed(med)"><EditOutlined /></a-button>
        <a-popconfirm title="确定删除？" @confirm="medicineStore.deleteMedicine(med.id)">
          <a-button type="text" danger><DeleteOutlined /></a-button>
        </a-popconfirm>
      </div>
    </div>

    <!-- 提醒设置 -->
    <div class="section">
      <h3><SettingOutlined /> 提醒设置</h3>
      <div class="setting-card">
        <div class="setting-row">
          <div>
            <p class="setting-title">语音提醒</p>
            <p class="setting-desc">用药时播放语音提示</p>
          </div>
          <a-switch v-model:checked="voiceEnabled" defaultChecked />
        </div>
      </div>
    </div>

    <!-- 添加药品弹窗 -->
    <a-modal v-model:open="showAddModal" title="添加药品" @ok="handleAdd" :confirmLoading="saving" destroyOnClose>
      <a-form layout="vertical" :model="form">
        <a-form-item label="药品名称" required>
          <a-input v-model:value="form.name" placeholder="请输入药品名称" />
        </a-form-item>
        <a-form-item label="服用剂量" required>
          <a-input v-model:value="form.dosage" placeholder="例如：每日2次，每次1片" />
        </a-form-item>
        <a-form-item label="提醒时间">
          <a-space direction="vertical" style="width: 100%">
            <div v-for="(t, i) in form.times" :key="i" class="time-row">
              <a-time-picker v-model:value="t.value" format="HH:mm" style="width: 140px" />
              <a-button type="text" danger @click="form.times.splice(i,1)" v-if="form.times.length > 1">
                <DeleteOutlined />
              </a-button>
            </div>
            <a-button type="dashed" @click="form.times.push({ value: undefined })">
              <PlusOutlined /> 添加时间
            </a-button>
          </a-space>
        </a-form-item>
        <a-form-item label="启用提醒">
          <a-switch v-model:checked="form.reminder" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, MedicineBoxOutlined, SettingOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const medicineStore = useMedicineStore()
const showAddModal = ref(false)
const saving = ref(false)
const voiceEnabled = ref(true)

const form = ref({
  name: '',
  dosage: '',
  times: [{ value: undefined }],
  reminder: true,
  repeat: [1,2,3,4,5],
})

function editMed(med) {
  form.value = {
    name: med.name,
    dosage: med.dosage,
    times: med.times.map(t => ({ value: dayjs(`2026-07-11 ${t}`) })),
    reminder: med.reminder,
    repeat: med.repeat,
  }
  editingId.value = med.id
  showAddModal.value = true
}

const editingId = ref(null)

function repeatText(repeat) {
  const map = { 1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'日' }
  return repeat.map(d => map[d]).join('、') || '不重复'
}

async function handleAdd() {
  if (!form.value.name || !form.value.dosage) {
    message.warning('请填写完整信息')
    return
  }
  saving.value = true
  const data = {
    name: form.value.name,
    dosage: form.value.dosage,
    times: form.value.times.filter(t => t.value).map(t => dayjs(t.value).format('HH:mm')),
    reminder: form.value.reminder,
    repeat: form.value.repeat,
    voiceReminder: true,
  }
  setTimeout(() => {
    if (editingId.value) {
      medicineStore.updateMedicine(editingId.value, data)
      message.success('已更新')
    } else {
      medicineStore.addMedicine(data)
      message.success('已添加')
    }
    saving.value = false
    showAddModal.value = false
    editingId.value = null
    form.value = { name: '', dosage: '', times: [{ value: undefined }], reminder: true, repeat: [1,2,3,4,5] }
  }, 300)
}

onMounted(() => {
  if (medicineStore.medicines.length === 0) medicineStore.loadMedicines()
})
</script>

<style scoped>
.medicine-page { padding: 0 0 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 20px; }
.med-item { background: #fff; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.med-content { display: flex; align-items: center; gap: 14px; flex: 1; }
.med-img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; }
.med-detail h3 { font-size: 15px; font-weight: 600; margin: 0 0 4px; }
.med-detail p { font-size: 13px; color: #6B7280; margin: 0 0 6px; }
.med-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.med-repeat { font-size: 12px; color: #9CA3AF; }
.med-actions { display: flex; flex-direction: column; gap: 4px; }
.section { margin-top: 24px; }
.section h3 { font-size: 16px; font-weight: bold; margin-bottom: 16px; }
.setting-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.setting-row { display: flex; justify-content: space-between; align-items: center; }
.setting-title { font-weight: 500; margin: 0; }
.setting-desc { font-size: 13px; color: #6B7280; margin: 2px 0 0; }
.time-row { display: flex; align-items: center; gap: 8px; }
</style>
