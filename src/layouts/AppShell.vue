<template>
  <div class="app-shell">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-left">
        <i class="fas fa-heartbeat header-logo-icon"></i>
        <h1 class="header-title">{{ $t('app.title') }}</h1>
        <span class="header-welcome">{{ $t('app.welcome', { name: userName }) }}</span>
      </div>
      <div class="header-right">
        <div class="notification-btn" @click="toggleNotification">
          <i class="fas fa-bell"></i>
          <span class="notif-dot"></span>
        </div>
        <div class="avatar-circle" @click="switchTab('profile')">
          <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" />
          <i v-else class="fas fa-user"></i>
        </div>
      </div>
    </header>

    <!-- 通知面板 -->
    <div class="notification-panel" v-if="showNotif">
      <div class="notif-header">
        <h3>{{ $t('notification.title') }}</h3>
      </div>
      <div class="notif-list">
        <div class="notif-item" v-for="n in notifications" :key="n.id">
          <div class="notif-icon-wrapper" :style="{ background: n.iconBg + '20' }">
            <i :class="n.icon" :style="{ color: n.iconBg }"></i>
          </div>
          <div class="notif-content">
            <p class="notif-title">{{ n.title }}</p>
            <p class="notif-desc">{{ n.content }}</p>
            <p class="notif-time">{{ n.time }}</p>
          </div>
        </div>
      </div>
      <div class="notif-footer">
        <a href="javascript:void(0)" @click="showAllNotifications">{{ $t('notification.viewAll') }}</a>
      </div>
    </div>

    <!-- 主内容区 -->
    <main class="main-content">

      <!-- ========== 首页 ========== -->
      <div class="page" v-show="activeTab === 'home'">
        <div class="welcome-section">
          <h2 class="greeting">{{ $t('app.greeting', { name: userName }) }}</h2>
          <p class="date-text">{{ $t('app.todayIs', { date: currentDate }) }}</p>
        </div>

        <!-- 快捷功能 2x2 -->
        <div class="quick-grid">
          <button class="quick-card" style="background:#D1FAE5" @click="openModal('medication')">
            <div class="quick-icon" style="background:#52B788"><i class="fas fa-pills"></i></div>
            <span class="quick-label">{{ $t('quick.medication') }}</span>
          </button>
          <button class="quick-card" style="background:#B4E4D0" @click="openModal('reminder')">
            <div class="quick-icon" style="background:#40916C"><i class="fas fa-bell"></i></div>
            <span class="quick-label">{{ $t('quick.reminder') }}</span>
          </button>
          <button class="quick-card" style="background:#FEF3C7" @click="openModal('devices')">
            <div class="quick-icon" style="background:#F59E0B"><i class="fas fa-bluetooth-b"></i></div>
            <span class="quick-label">{{ $t('quick.devices') }}</span>
          </button>
          <button class="quick-card" style="background:#E9D5FF" @click="openModal('report')">
            <div class="quick-icon" style="background:#8B5CF6"><i class="fas fa-file-medical-alt"></i></div>
            <span class="quick-label">{{ $t('quick.report') }}</span>
          </button>
        </div>

        <!-- 今日用药提醒 -->
        <div class="section-block">
          <div class="section-header">
            <h3>{{ $t('section.todayMeds') }}</h3>
            <a href="javascript:void(0)" class="section-more" @click="switchTab('medicine')">{{ $t('section.viewAll') }}</a>
          </div>
          <div class="med-card" v-for="(med, i) in todayMeds" :key="i">
            <div class="med-left">
              <div class="med-icon-circle" :style="{ background: med.iconBg }"><i :class="med.formIcon || 'fas fa-pills'"></i></div>
              <div class="med-info">
                <h4>{{ med.name }}</h4>
                <p>{{ med.dosage }}</p>
              </div>
            </div>
            <div class="med-right">
              <span class="med-time">{{ med.time }}</span>
              <span class="badge" :class="med.badgeClass">{{ med.status }}</span>
            </div>
          </div>
        </div>

        <!-- 健康数据 -->
        <div class="section-block">
          <div class="section-header">
            <h3>{{ $t('section.healthData') }}</h3>
            <a href="javascript:void(0)" class="section-more" @click="switchTab('data')">{{ $t('section.moreData') }}</a>
          </div>
          <div class="health-grid">
            <div class="health-card" v-for="h in healthMetrics" :key="h.label">
              <div class="health-card-header">
                <span class="health-label">{{ h.label }}</span>
                <i :class="h.icon" :style="{ color: h.color }"></i>
              </div>
              <div class="health-value-row">
                <span class="health-value">{{ h.value }}</span>
                <span class="health-unit">{{ h.unit }}</span>
              </div>
              <p class="health-trend" :style="{ color: h.trendColor }">
                <i :class="h.trendIcon"></i> {{ h.change }}
              </p>
            </div>
          </div>
          <div class="chart-card">
            <h4 class="chart-title">{{ $t('section.bloodSugar') }}</h4>
            <div class="chart-container" ref="bloodSugarChartRef"></div>
          </div>
        </div>
      </div>

      <!-- ========== 药品页 ========== -->
      <div class="page" v-show="activeTab === 'medicine'">
        <div class="page-topbar">
          <h2>我的药品</h2>
          <button class="btn-primary-sm" @click="openAddMed"><i class="fas fa-plus mr-1"></i> 添加药品</button>
        </div>
        <div class="med-list" v-if="medicines.length">
          <div class="med-item" v-for="med in medicines" :key="med.id">
            <div class="med-item-icon" :style="{ background: medColors[med.id % medColors.length] }">
              <i :class="medFormIcon(med.form)"></i>
            </div>
            <div class="med-item-info">
              <h3>{{ med.name }}</h3>
              <p>{{ med.dosage }}</p>
              <div class="med-item-tags">
                <span class="badge" :class="med.reminder ? 'badge-green' : 'badge-gray'">
                  {{ med.reminder ? $t('med.reminderSet') : $t('med.reminderNotSet') }}
                </span>
                <span class="med-repeat">{{ repeatLabel(med.repeat) }}</span>
              </div>
            </div>
            <div class="med-more-wrap">
              <button class="med-more-btn" @click.stop="toggleMedMenu(med.id)"><i class="fas fa-ellipsis-v"></i></button>
              <div class="med-dropdown" v-if="activeMedMenu === med.id" @click.stop>
                <button class="dropdown-item" @click="editMedicine(med)"><i class="fas fa-edit"></i> 编辑</button>
                <button class="dropdown-item danger" @click="deleteMedicine(med)"><i class="fas fa-trash-alt"></i> 删除</button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <i class="fas fa-pills empty-icon"></i>
          <p>暂无药品，点击上方按钮添加</p>
        </div>

        <!-- 提醒设置 -->
        <div class="section-block" style="margin-top:32px">
          <h3 style="font-size:18px;font-weight:600;margin-bottom:16px">提醒设置</h3>
          <div class="setting-row-card">
            <div>
              <p class="setting-title">语音提醒</p>
              <p class="setting-desc">用药时播放语音提示</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="voiceEnabled" />
              <div class="toggle-track"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- ========== 数据页 ========== -->
      <div class="page" v-show="activeTab === 'data'">
        <div class="page-topbar">
          <h2>{{ $t('data.title') }}</h2>
          <button class="btn-secondary-sm" @click="openModal('report')"><i class="fas fa-download mr-1"></i> {{ $t('data.generateReport') }}</button>
        </div>
        <!-- 实时心率 -->
        <div class="heart-card">
          <div class="heart-card-header">
            <h3>{{ $t('data.realTimeHR') }}</h3>
            <span class="heart-update">{{ $t('data.updatedAt', { time: heartUpdateTime }) }}</span>
          </div>
          <div class="heart-display-area">
            <div class="heart-circle-wrapper">
              <canvas ref="heartCanvas" width="192" height="192"></canvas>
              <div class="heart-text-overlay">
                <span class="heart-bpm">{{ currentHeartRate }}</span>
                <span class="heart-bpm-unit">bpm</span>
              </div>
            </div>
          </div>
          <div class="heart-stats">
            <span>{{ $t('data.restingHR') }}: <strong>65 bpm</strong></span>
            <span>{{ $t('data.maxHR') }}: <strong>180 bpm</strong></span>
          </div>
        </div>
        <!-- 图表 -->
        <div class="charts-grid">
          <div class="chart-card-full">
            <h3>心率趋势</h3>
            <div class="chart-container-large" ref="heartChartRef"></div>
          </div>
          <div class="chart-card-full">
            <h3>睡眠时长</h3>
            <div class="chart-container-large" ref="sleepChartRef"></div>
          </div>
        </div>
        <!-- 健康报告 -->
        <div class="report-card">
          <div class="report-card-header">
            <h3>{{ $t('data.healthReport') }}</h3>
            <button class="bmi-info-btn" @click="showBmiInfo" :title="$t('data.bmi')">
              <i class="fas fa-question-circle"></i>
            </button>
          </div>
          <div class="report-grid">
            <div class="report-item" v-for="r in reportItems" :key="r.label">
              <p class="report-label">{{ r.label }}</p>
              <p class="report-value">{{ r.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 我的页 ========== -->
      <div class="page" v-show="activeTab === 'profile'">
        <div class="profile-header-section">
          <div class="avatar-wrapper">
            <div class="avatar-large">
              <img v-if="avatarUrl" :src="avatarUrl" />
              <i v-else class="fas fa-user"></i>
            </div>
            <button class="camera-btn" @click="openAvatarModal"><i class="fas fa-camera"></i></button>
          </div>
          <div class="name-row">
            <h2 class="profile-name">{{ userName }}</h2>
            <button class="edit-name-btn" @click="openNameEdit"><i class="fas fa-edit"></i></button>
          </div>
        </div>

        <!-- 个人信息 -->
        <div class="profile-card">
          <h3>{{ $t('profile.title') }}</h3>
          <div class="info-row" v-for="item in personalInfo" :key="item.label">
            <span class="info-label">{{ item.label }}</span>
            <span class="info-value">{{ item.value }}</span>
          </div>
          <button class="btn-secondary-sm" style="margin-top:16px;width:100%" @click="openProfileEdit">
            <i class="fas fa-edit mr-1"></i> 编辑个人信息
          </button>
        </div>

        <!-- 设置列表 -->
        <div class="profile-card">
          <div class="card-title-bar"><h3>{{ $t('profile.settings') }}</h3></div>
          <div class="setting-link" v-for="s in settings" :key="s.key" @click="handleSetting(s.key)">
            <div class="setting-link-left">
              <i :class="s.icon" class="link-icon"></i>
              <span>{{ s.label }}</span>
            </div>
            <i class="fas fa-chevron-right link-arrow"></i>
          </div>
        </div>

        <div class="profile-card">
          <div class="card-title-bar"><h3>{{ $t('profile.help') }}</h3></div>
          <div class="setting-link" v-for="h in helpItems" :key="h.key" @click="handleSetting(h.key)">
            <div class="setting-link-left">
              <i :class="h.icon" class="link-icon"></i>
              <span>{{ h.label }}</span>
            </div>
            <i class="fas fa-chevron-right link-arrow"></i>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <nav class="bottom-nav">
      <button class="nav-item" :class="{ active: activeTab === 'home' }" @click="switchTab('home')">
        <i class="fas fa-home"></i>
        <span>{{ $t('nav.home') }}</span>
      </button>
      <button class="nav-item" :class="{ active: activeTab === 'medicine' }" @click="switchTab('medicine')">
        <i class="fas fa-pills"></i>
        <span>{{ $t('nav.medicine') }}</span>
      </button>
      <button class="nav-item" :class="{ active: activeTab === 'data' }" @click="switchTab('data')">
        <i class="fas fa-chart-line"></i>
        <span>{{ $t('nav.data') }}</span>
      </button>
      <button class="nav-item" :class="{ active: activeTab === 'profile' }" @click="switchTab('profile')">
        <i class="fas fa-user"></i>
        <span>{{ $t('nav.profile') }}</span>
      </button>
    </nav>

    <!-- ========== MODALS ========== -->
    
    <!-- 药品识别弹窗 -->
    <div class="modal-overlay" v-if="modals.medication" @click.self="closeModal('medication')">
      <div class="modal-box med-recog-modal">

        <!-- 步骤1: 上传图片 -->
        <template v-if="recogStep === 'upload'">
          <div class="modal-topbar"><h3>药品识别</h3><button class="modal-close" @click="closeModal('medication'); resetRecognition()"><i class="fas fa-times"></i></button></div>
          <p class="modal-desc">上传药盒包装图片，系统将自动识别药品信息</p>
          <div class="recog-upload-box" @click="triggerRecogInput" @dragover.prevent @drop.prevent="handleRecogDrop">
            <input type="file" ref="recogFileInput" accept="image/*" capture="environment" @change="handleRecogFile" style="display:none" />
            <div v-if="!recogPreviewUrl" class="recog-upload-placeholder">
              <i class="fas fa-camera"></i>
              <p>点击拍摄或上传药盒照片</p>
              <span>支持 JPG / PNG 格式</span>
            </div>
            <img v-else :src="recogPreviewUrl" class="recog-preview-img" />
          </div>
          <div class="recog-actions">
            <button class="btn-secondary-sm" style="flex:1" @click="triggerRecogInput('camera')"><i class="fas fa-camera mr-1"></i> 拍摄</button>
            <button class="btn-secondary-sm" style="flex:1" @click="triggerRecogInput"><i class="fas fa-folder-open mr-1"></i> 相册</button>
          </div>
          <button class="btn-primary-sm" style="width:100%;margin-top:12px" :disabled="!recogPreviewUrl" @click="startRecognition">
            <i class="fas fa-search mr-1"></i> 开始识别
          </button>
          <!-- 快速体验：预置药品图片 -->
          <div class="recog-demo">
            <p class="recog-demo-label"><i class="fas fa-bolt"></i> 快速体验（点击即可识别）</p>
            <div class="recog-demo-grid">
              <div class="recog-demo-item" v-for="demo in demoMedImages" :key="demo.key" @click="useDemoImage(demo)">
                <img :src="`/medicine-images/${demo.file}`" :alt="demo.name" />
                <span>{{ demo.name }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 步骤2: 扫描中 -->
        <template v-if="recogStep === 'scanning'">
          <div class="modal-topbar"><h3>药品识别</h3><button class="modal-close" @click="closeModal('medication'); resetRecognition()"><i class="fas fa-times"></i></button></div>
          <div class="recog-scanning">
            <div class="scan-animation-wrap">
              <div class="scan-circle"><i class="fas fa-pills"></i></div>
              <div class="scan-ring-1"></div>
              <div class="scan-ring-2"></div>
            </div>
            <p class="scan-status">正在识别药品信息...</p>
            <div class="scan-progress-track">
              <div class="scan-progress-fill" :style="{ width: scanProgress + '%' }"></div>
            </div>
            <p class="scan-percent">{{ scanProgress }}%</p>
            <p class="scan-hint">正在分析药盒图像特征...</p>
          </div>
        </template>

        <!-- 步骤3: 识别结果 -->
        <template v-if="recogStep === 'result'">
          <div class="modal-topbar"><h3>识别结果</h3><button class="modal-close" @click="closeModal('medication'); resetRecognition()"><i class="fas fa-times"></i></button></div>
          <div class="recog-result-success">
            <div class="recog-success-icon"><i class="fas fa-check-circle"></i></div>
            <h4>识别成功！</h4>
          </div>
          <div class="recog-result-card">
            <div class="recog-result-top">
              <img v-if="recogPreviewUrl" :src="recogPreviewUrl" class="recog-result-img" />
              <div class="recog-result-info">
                <h3 class="recog-drug-name">{{ recogResult.name }}</h3>
                <div class="recog-result-tags">
                  <span class="badge badge-green" v-for="tag in recogResult.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
            <div class="recog-result-details">
              <div class="recog-detail-row">
                <span class="recog-detail-label"><i class="fas fa-building"></i> 生产厂家</span>
                <span class="recog-detail-value">{{ recogResult.manufacturer }}</span>
              </div>
              <div class="recog-detail-row">
                <span class="recog-detail-label"><i class="fas fa-weight"></i> 规格</span>
                <span class="recog-detail-value">{{ recogResult.spec }}</span>
              </div>
              <div class="recog-detail-row">
                <span class="recog-detail-label"><i class="fas fa-heartbeat"></i> 功效</span>
                <span class="recog-detail-value">{{ recogResult.effect }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions" style="margin-top:16px">
            <button class="btn-secondary-sm" @click="resetRecognition"><i class="fas fa-redo mr-1"></i> 重新识别</button>
            <button class="btn-primary-sm" @click="addRecognizedMed"><i class="fas fa-plus mr-1"></i> 添加到用药列表</button>
          </div>
        </template>

      </div>
    </div>

    <!-- 用药提醒弹窗 -->
    <div class="modal-overlay" v-if="modals.reminder" @click.self="closeModal('reminder')">
      <div class="modal-box">
        <div class="modal-topbar"><h3>设置用药提醒</h3><button class="modal-close" @click="closeModal('reminder')"><i class="fas fa-times"></i></button></div>
        <div class="modal-form">
          <label>药品名称</label>
          <input class="modal-input" v-model="reminderForm.name" readonly />
          <label>服用剂量</label>
          <input class="modal-input" v-model="reminderForm.dosage" />
          <label>提醒时间</label>
          <div class="time-slots">
            <div class="time-slot" v-for="(t, i) in reminderForm.times" :key="i">
              <input type="time" class="modal-input" v-model="reminderForm.times[i]" />
              <button v-if="reminderForm.times.length>1" class="del-time" @click="reminderForm.times.splice(i,1)"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
          <button class="add-time-btn" @click="reminderForm.times.push('12:00')"><i class="fas fa-plus-circle"></i> 添加时间</button>
          <label>重复</label>
          <div class="repeat-grid">
            <div v-for="d in ['一','二','三','四','五','六','日']" :key="d"
              class="repeat-day" :class="{ active: reminderForm.repeat.includes(d) }"
              @click="toggleRepeatDay(d)">{{ d }}</div>
          </div>
          <label class="checkbox-label"><input type="checkbox" v-model="reminderForm.voice" /> <span>启用语音提醒</span></label>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary-sm" @click="closeModal('reminder')">取消</button>
          <button class="btn-primary-sm" @click="saveReminder">保存提醒</button>
        </div>
      </div>
    </div>

    <!-- 设备管理弹窗 -->
    <div class="modal-overlay" v-if="modals.devices" @click.self="closeModal('devices')">
      <div class="modal-box">
        <div class="modal-topbar"><h3>设备管理</h3><button class="modal-close" @click="closeModal('devices')"><i class="fas fa-times"></i></button></div>
        <button class="btn-primary-sm" style="width:100%;margin-bottom:20px" @click="simulateAddDevice"><i class="fas fa-plus mr-1"></i> 添加新设备</button>
        <h4 style="font-weight:600;margin-bottom:12px;font-size:15px">已连接设备</h4>
        <div class="device-item" v-for="d in connectedDevices" :key="d.name">
          <div class="device-left">
            <div class="device-icon" :style="{ background: d.bg }"><i :class="d.icon" :style="{color:d.color}"></i></div>
            <div><p style="font-weight:500">{{ d.name }}</p><p style="font-size:12px;color:#9CA3AF">{{ d.model }}</p></div>
          </div>
          <span class="badge badge-green">已连接</span>
        </div>
        <h4 style="font-weight:600;margin:20px 0 12px;font-size:15px">可用设备</h4>
        <div class="device-item" v-for="d in availableDevices" :key="d.name">
          <div class="device-left">
            <div class="device-icon" :style="{ background: d.bg }"><i :class="d.icon" :style="{color:d.color}"></i></div>
            <div><p style="font-weight:500">{{ d.name }}</p><p style="font-size:12px;color:#9CA3AF">{{ d.model }}</p></div>
          </div>
          <button class="btn-link" @click="simulateConnect(d.name)">连接</button>
        </div>
      </div>
    </div>

    <!-- 健康报告弹窗 -->
    <div class="modal-overlay" v-if="modals.report" @click.self="closeModal('report')">
      <div class="modal-box">
        <div class="modal-topbar"><h3>健康报告</h3><button class="modal-close" @click="closeModal('report')"><i class="fas fa-times"></i></button></div>
        <div class="report-tabs">
          <span class="report-tab active">本周报告</span>
          <span class="report-tab">本月报告</span>
          <span class="report-tab">季度报告</span>
          <span class="report-tab">年度报告</span>
        </div>
        <div class="score-card">
          <div class="score-left">
            <h4>健康评分</h4>
            <p style="font-size:12px;opacity:.8">2023年11月13日-11月19日</p>
          </div>
          <div class="score-badge">87 分</div>
        </div>
        <div class="progress-bar-wrap"><div class="progress-fill" style="width:87%"></div></div>
        <p style="font-size:12px;color:#6B7280;margin:4px 0 16px">较上周提升3分，继续保持！</p>
        <div class="report-chart-box" ref="reportChartRef"></div>
        <div class="compliance-card">
          <p>本周用药完成率</p>
          <div class="compliance-bar"><div style="width:92%"></div></div>
          <p style="font-size:13px;color:#6B7280">92% - 您的用药依从性良好</p>
        </div>
      </div>
    </div>

    <!-- 姓名编辑弹窗 -->
    <div class="modal-overlay" v-if="showNameEdit" @click.self="showNameEdit=false">
      <div class="modal-box modal-sm">
        <div class="modal-topbar"><h3>修改姓名</h3><button class="modal-close" @click="showNameEdit=false"><i class="fas fa-times"></i></button></div>
        <input class="modal-input" v-model="nameInput" placeholder="请输入新姓名" />
        <div class="modal-actions"><button class="btn-secondary-sm" @click="showNameEdit=false">取消</button><button class="btn-primary-sm" @click="saveName">保存</button></div>
      </div>
    </div>

    <!-- 个人信息编辑弹窗 -->
    <div class="modal-overlay" v-if="showProfileEdit" @click.self="showProfileEdit=false">
      <div class="modal-box modal-sm">
        <div class="modal-topbar"><h3>编辑个人信息</h3><button class="modal-close" @click="showProfileEdit=false"><i class="fas fa-times"></i></button></div>
        <div class="modal-form">
          <div class="form-row">
            <div class="form-half">
              <label>性别</label>
              <select class="modal-input" v-model="profileForm.gender">
                <option>男</option><option>女</option>
              </select>
            </div>
            <div class="form-half">
              <label>年龄</label>
              <input class="modal-input" type="number" v-model.number="profileForm.age" min="1" max="150" />
            </div>
          </div>
          <label>身高 (cm)</label>
          <input class="modal-input" type="number" v-model.number="profileForm.height" />
          <label>体重 (kg)</label>
          <input class="modal-input" type="number" v-model.number="profileForm.weight" />
          <label>血型</label>
          <select class="modal-input" v-model="profileForm.bloodType">
            <option>A型</option><option>B型</option><option>O型</option><option>AB型</option>
          </select>
        </div>
        <div class="modal-actions"><button class="btn-secondary-sm" @click="showProfileEdit=false">取消</button><button class="btn-primary-sm" @click="saveProfile">保存</button></div>
      </div>
    </div>

    <!-- 头像上传弹窗 -->
    <div class="modal-overlay" v-if="showAvatarModal" @click.self="showAvatarModal=false">
      <div class="modal-box modal-sm">
        <div class="modal-topbar"><h3>更换头像</h3><button class="modal-close" @click="showAvatarModal=false"><i class="fas fa-times"></i></button></div>
        <div class="avatar-preview">
          <div class="avatar-large">
            <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" class="avatar-img" />
            <i v-else class="fas fa-user"></i>
          </div>
        </div>
        <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileSelected" />
        <div class="camera-actions">
          <button class="btn-primary-sm" style="flex:1" @click="$refs.fileInputRef.click()"><i class="fas fa-upload mr-1"></i> 从相册选择</button>
        </div>
        <div class="avatar-actions" v-if="avatarPreviewUrl">
          <button class="btn-primary-sm" style="flex:1" @click="confirmAvatar">确认使用</button>
          <button class="btn-secondary-sm" style="flex:1" @click="cancelAvatar">重新选择</button>
        </div>
      </div>
    </div>

    <!-- 添加药品弹窗 -->
    <div class="modal-overlay" v-if="showAddMed" @click.self="showAddMed=false">
      <div class="modal-box add-med-modal">
        <div class="modal-topbar">
          <h3>{{ editingMedId ? '编辑药品' : '添加药品' }}</h3>
          <button class="modal-close" @click="showAddMed=false; resetAddMedForm()"><i class="fas fa-times"></i></button>
        </div>

        <!-- 搜索/选择常见药品 -->
        <div class="add-med-step" v-if="!selectedCommonMed && !addMedForm.isCustom">
          <div class="search-med-wrap">
            <i class="fas fa-search search-icon"></i>
            <input class="search-med-input" v-model="addMedSearch" placeholder="搜索常见药品..." />
          </div>
          <div class="common-med-grid">
            <div class="common-med-card" v-for="med in filteredCommonMeds" :key="med.name" @click="selectCommonMed(med)">
              <span class="med-form-badge">{{ med.form }}</span>
              <span class="med-name">{{ med.name }}</span>
              <span class="med-dosage-preview">{{ med.adultDosage }}</span>
            </div>
          </div>
          <button class="btn-secondary-sm" style="width:100%;margin-top:12px" @click="setCustomMode">
            <i class="fas fa-pen mr-1"></i> 手动输入药品
          </button>
        </div>

        <!-- 药品详情配置 -->
        <div class="add-med-step" v-else>
          <div v-if="selectedCommonMed" class="selected-med-banner">
            <i class="fas fa-check-circle"></i> 已选择：<strong>{{ selectedCommonMed.name }}</strong>
            <span class="form-badge" v-if="selectedCommonMed">{{ selectedCommonMed.form }}</span>
            <p class="age-tip" v-if="selectedCommonMed">
              <i class="fas fa-user"></i> 当前用户{{ profileStore.info.age }}岁
              <template v-if="(profileStore.info.age||30) < selectedCommonMed.minAge">
                → <span class="child-tip">儿童剂量</span>：{{ selectedCommonMed.childDosage }}
              </template>
              <template v-else>
                → <span class="adult-tip">成人剂量</span>：{{ selectedCommonMed.adultDosage }}
              </template>
            </p>
          </div>

          <div class="add-med-form">
            <label>药品名称</label>
            <input class="modal-input" v-model="addMedForm.name" placeholder="输入药品名称" />
            <div class="form-row">
              <div class="form-half">
                <label>剂型</label>
                <select class="modal-input" v-model="addMedForm.form">
                  <option>片剂</option><option>胶囊</option><option>冲剂</option><option>口服液</option><option>滴剂</option><option>喷雾</option>
                </select>
              </div>
              <div class="form-half">
                <label>每次{{ formLabels[addMedForm.form] || '份' }}数</label>
                <div class="quantity-input">
                  <button @click="addMedForm.perDose = Math.max(0.25, addMedForm.perDose - 0.25)">−</button>
                  <span>{{ addMedForm.perDose }}</span>
                  <button @click="addMedForm.perDose += 0.25">+</button>
                </div>
              </div>
            </div>
            <label>用药说明</label>
            <input class="modal-input" v-model="addMedForm.dosage" placeholder="例如：每日2次，每次1片" />
            <label>提醒时间</label>
            <div class="time-slots">
              <div class="time-slot" v-for="(t,i) in addMedForm.times" :key="i">
                <input type="time" class="modal-input" v-model="addMedForm.times[i]" />
                <button v-if="addMedForm.times.length>1" class="del-time" @click="addMedForm.times.splice(i,1)"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <button class="add-time-btn" @click="addMedForm.times.push('12:00')"><i class="fas fa-plus-circle"></i> 添加时间</button>
            <label>重复</label>
            <div class="repeat-grid">
              <div v-for="d in ['一','二','三','四','五','六','日']" :key="d"
                class="repeat-day" :class="{ active: addMedForm.repeat.includes(d) }"
                @click="toggleAddRepeat(d)">{{ d }}</div>
            </div>
            <label class="checkbox-label"><input type="checkbox" v-model="addMedForm.reminder" /> <span>启用用药提醒</span></label>
          </div>

          <div class="modal-actions" style="margin-top:20px">
            <button class="btn-secondary-sm" @click="resetAddMedForm()">返回选择</button>
            <button class="btn-primary-sm" @click="confirmAddMed">确认添加</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 账号管理弹窗（含退出登录） -->
    <div class="modal-overlay" v-if="showAccountModal" @click.self="showAccountModal=false">
      <div class="modal-box">
        <div class="modal-topbar">
          <h3>账号管理</h3>
          <button class="modal-close" @click="showAccountModal=false"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-form">
          <label>用户 ID（登录用，不可修改）</label>
          <input class="modal-input" :value="authStore.user?.username || 'admin'" readonly style="background:#F3F4F6;color:#6B7280" />

          <label>显示名称</label>
          <input class="modal-input" v-model="accountForm.displayName" placeholder="请输入显示名称" />
          <p v-if="accountErrors.displayName" class="field-error">{{ accountErrors.displayName }}</p>

          <label>绑定邮箱</label>
          <input class="modal-input" v-model="accountForm.email" placeholder="可用于登录" />
          <p v-if="accountErrors.email" class="field-error">{{ accountErrors.email }}</p>

          <label>绑定手机号</label>
          <input class="modal-input" v-model="accountForm.phone" placeholder="请输入手机号" />
          <p v-if="accountErrors.phone" class="field-error">{{ accountErrors.phone }}</p>

          <label>当前密码</label>
          <input class="modal-input" type="password" v-model="accountForm.currentPassword" placeholder="修改信息需输入当前密码" />

          <label>新密码（留空则不修改）</label>
          <input class="modal-input" type="password" v-model="accountForm.newPassword" placeholder="新密码" />
          <input class="modal-input" type="password" v-model="accountForm.confirmPassword" placeholder="确认新密码" style="margin-top:6px" />
          <p v-if="accountErrors.password" class="field-error">{{ accountErrors.password }}</p>

          <div class="session-info">
            <i class="fas fa-clock"></i>
            <span>登录剩余时间：<strong>{{ remaining }}秒</strong></span>
          </div>

          <p v-if="accountSaveMsg" class="field-success" style="text-align:center;margin:8px 0">{{ accountSaveMsg }}</p>

          <button class="save-account-btn" @click="saveAccount">
            <i class="fas fa-save"></i> 保存修改
          </button>
          <button class="logout-btn" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i> 退出登录
          </button>
        </div>
      </div>
    </div>

    <!-- BMI说明弹窗 -->
    <div class="modal-overlay" v-if="showBmiModal" @click.self="showBmiModal=false">
      <div class="modal-box modal-sm">
        <div class="modal-topbar">
          <h3>📊 BMI指数说明</h3>
          <button class="modal-close" @click="showBmiModal=false"><i class="fas fa-times"></i></button>
        </div>
        <div class="bmi-modal-body">
          <div class="bmi-formula">BMI = 体重(kg) &divide; 身高(m)&sup2;</div>
          <div class="bmi-table">
            <div class="bmi-row"><span class="bmi-label">偏瘦</span><span class="bmi-range">&lt; 18.5</span><span class="bmi-dot" style="background:#93C5FD"></span></div>
            <div class="bmi-row"><span class="bmi-label">正常</span><span class="bmi-range">18.5 ~ 23.9</span><span class="bmi-dot" style="background:#52B788"></span></div>
            <div class="bmi-row"><span class="bmi-label">超重</span><span class="bmi-range">24 ~ 27.9</span><span class="bmi-dot" style="background:#FBBF24"></span></div>
            <div class="bmi-row"><span class="bmi-label">肥胖</span><span class="bmi-range">&ge; 28</span><span class="bmi-dot" style="background:#F87171"></span></div>
          </div>
          <div class="bmi-tip">
            <i class="fas fa-lightbulb" style="color:#F59E0B"></i>
            <span>BMI仅作为参考指标，不适用于运动员、孕妇、老年人等特殊人群。建议结合体脂率、腰围等综合评估。</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 通用设置弹窗 -->
    <div class="modal-overlay" v-if="showSettingModal" @click.self="showSettingModal=''">
      <div class="modal-box modal-sm">
        <div class="modal-topbar">
          <h3>{{ getSettingContent(showSettingModal).title }}</h3>
          <button class="modal-close" @click="showSettingModal=''"><i class="fas fa-times"></i></button>
        </div>
        <div class="setting-modal-body">

          <!-- 开关类型 -->
          <template v-if="getSettingContent(showSettingModal).type === 'toggle'">
            <div class="setting-modal-item" v-for="key in Object.keys(settingStates[showSettingModal]||{})" :key="key" @click="toggleSetting(showSettingModal, key)">
              <span>{{ key }}</span>
              <i :class="settingStates[showSettingModal]?.[key] ? 'fas fa-toggle-on' : 'fas fa-toggle-off'" :style="{ color: settingStates[showSettingModal]?.[key] ? '#52B788' : '#D1D5DB' }"></i>
            </div>
          </template>

          <!-- 选择类型 -->
          <template v-else-if="getSettingContent(showSettingModal).type === 'select'">
            <div class="setting-modal-item" v-for="opt in getSettingContent(showSettingModal).options" :key="opt" @click="selectSetting(showSettingModal, opt)">
              <span>{{ opt }}</span>
              <i v-if="settingStates[showSettingModal]?.selected === opt" class="fas fa-check-circle" style="color:#52B788"></i>
            </div>
          </template>

          <!-- 信息展示类型 -->
          <template v-else-if="getSettingContent(showSettingModal).type === 'info'">
            <div class="setting-modal-item" v-for="item in getSettingContent(showSettingModal).items" :key="item.label" @click="item.copyable ? copyText(item.value) : ''">
              <span>{{ item.label }}：{{ item.value }}</span>
              <i v-if="item.copyable" class="fas fa-copy" style="color:#9CA3AF; font-size:12px"></i>
            </div>
          </template>

          <!-- 操作类型（导出） -->
          <template v-else-if="getSettingContent(showSettingModal).type === 'action'">
            <div class="setting-modal-item action-item" v-for="act in getSettingContent(showSettingModal).actions" :key="act.label" @click="handleSettingAction(act.label)">
              <div><span class="action-label">{{ act.label }}</span><span class="action-desc">{{ act.desc }}</span></div>
              <i class="fas fa-download" style="color:#52B788"></i>
            </div>
          </template>

          <!-- FAQ类型 -->
          <template v-else-if="getSettingContent(showSettingModal).type === 'faq'">
            <div class="setting-modal-item faq-item" v-for="(answer, q) in faqAnswers" :key="q" @click="toggleFaq(q)">
              <div class="faq-q"><span>{{ q }}</span><i :class="expandedFaq === q ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" style="color:#9CA3AF"></i></div>
              <div class="faq-a" v-if="expandedFaq === q">{{ answer }}</div>
            </div>
          </template>

          <!-- 关于我们 -->
          <template v-else-if="getSettingContent(showSettingModal).type === 'about'">
            <div class="about-section">
              <i class="fas fa-heartbeat about-icon"></i>
              <h3>健康管家 v1.0.0</h3>
              <p class="about-desc">您的个人健康助手，帮助您管理健康数据，记录生活习惯。</p>
              <p class="about-copy">&copy; 2026 健康管家 版权所有</p>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- 用药提醒闹钟弹窗 -->
    <div class="modal-overlay" v-if="alarmMed" @click.self="">
      <div class="modal-box modal-sm" style="text-align:center">
        <div class="alarm-icon-wrap"><i class="fas fa-bell alarm-ring"></i></div>
        <h3 class="alarm-title">用药提醒</h3>
        <p class="alarm-med-name">{{ alarmMed.name }}</p>
        <p class="alarm-med-info">{{ alarmMed.dosage }} · {{ alarmMed.time }}</p>
        <div class="alarm-actions">
          <button class="alarm-btn primary" @click="alarmTaken"><i class="fas fa-check"></i> 已经用药</button>
          <button class="alarm-btn warning" @click="alarmSnooze"><i class="fas fa-clock"></i> 过5分钟提醒</button>
          <button class="alarm-btn secondary" @click="alarmDismiss"><i class="fas fa-times"></i> 关闭闹钟</button>
        </div>
      </div>
    </div>

    <!-- 登录过期弹窗 -->
    <div class="modal-overlay" v-if="showExpireModal" @click.self="">
      <div class="modal-box modal-sm" style="text-align:center">
        <div style="margin:16px 0"><i class="fas fa-hourglass-end" style="font-size:56px;color:#F59E0B"></i></div>
        <h3 style="font-size:20px;font-weight:bold;margin-bottom:8px">登录已过期</h3>
        <p style="font-size:14px;color:#6B7280;margin-bottom:24px;line-height:1.6">
          您的登录状态已失效，<br />请重新登录以继续使用。
        </p>
        <button class="alarm-btn primary" style="width:100%" @click="goToLogin">
          <i class="fas fa-sign-in-alt"></i> 重新登录
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { useProfileStore } from '@/stores/profile'
import { useMedicineStore } from '@/stores/medicine'
import { useHealthStore } from '@/stores/health'
import 'dayjs/locale/zh-cn'
import { switchLanguage } from '@/i18n'
import { useI18n } from 'vue-i18n'

dayjs.locale('zh-cn')

const { t } = useI18n()

// ================= 状态 =================
const activeTab = ref('home')
const authStore = useAuthStore()
const profileStore = useProfileStore()
const medicineStore = useMedicineStore()
const healthStore = useHealthStore()
const router = useRouter()
const userName = computed(() => authStore.user?.name || '用户')
// 每次强制读 localStorage 实时计算剩余秒数，不被 computed 缓存
const remaining = ref(0)
let expireTimer = null

const showExpireModal = ref(false)

function tickExpire() {
  const exp = parseInt(localStorage.getItem('expiresAt') || '0')
  const sec = Math.max(0, Math.round((exp - Date.now()) / 1000))
  remaining.value = sec
  if (sec <= 0 && !showExpireModal.value) {
    authStore.logout()
    showExpireModal.value = true
  }
}

function goToLogin() {
  showExpireModal.value = false
  router.push('/login')
}
onMounted(() => {
  tickExpire()
  expireTimer = setInterval(tickExpire, 1000)
})
onUnmounted(() => { clearInterval(expireTimer) })

const avatarUrl = computed(() => {
  return localStorage.getItem('avatarUrl') || authStore.user?.avatar || ''
})
const currentDate = computed(() => {
  const isEn = t('nav.home') === 'Home'
  return isEn ? dayjs().format('dddd, MMMM D, YYYY') : dayjs().format('YYYY年M月D日 dddd')
})
const showNotif = ref(false)

// 通知
const notifications = [
  { id: 1, icon: 'fas fa-pills', iconBg: '#52B788', title: '用药提醒', content: '您该服用降压药了', time: '5分钟前' },
  { id: 2, icon: 'fas fa-bell', iconBg: '#F59E0B', title: '健康报告', content: '您的本周健康报告已生成', time: '1小时前' },
  { id: 3, icon: 'fas fa-heartbeat', iconBg: '#40916C', title: '心率异常', content: '您的心率超过正常范围', time: '昨天' },
]

// 用药数据 - 从 medicineStore 实时同步
const alarmLog = ref(JSON.parse(localStorage.getItem('alarmLog') || '[]')) // 已提醒记录 { medId, time, date }
const snoozed = ref(JSON.parse(localStorage.getItem('snoozed') || '[]')) // 稍后提醒 { medId, time, until }
const ICON_COLORS = ['#52B788','#F59E0B','#8B5CF6','#EF4444','#3B82F6','#EC4899']

const todayMeds = computed(() => {
  const now = dayjs()
  const todayStr = now.format('YYYY-MM-DD')
  const todayNum = now.day() || 7 // 1=周一...7=周日
  const currentMin = now.hour() * 60 + now.minute()
  const result = []

  medicineStore.medicines.forEach((med, idx) => {
    if (!med.reminder) return
    // 检查今天是否在重复周期内
    if (med.repeat && !med.repeat.includes(todayNum)) return

    med.times.forEach(t => {
      const [h, m] = t.split(':').map(Number)
      const timeMin = h * 60 + m
      const diff = timeMin - currentMin
      const medId = med.id + '-' + t

      // 判断状态
      let status, badgeClass
      if (diff < -5) {
        // 已过时超过5分钟
        const taken = alarmLog.value.some(log => log.medId === medId && log.date === todayStr && log.action === 'taken')
        status = taken ? '已用药' : '已过期'
        badgeClass = taken ? 'badge-green' : 'badge-gray'
      } else if (diff <= 30) {
        status = '即将提醒'
        badgeClass = 'badge-yellow'
      } else {
        status = '待提醒'
        badgeClass = 'badge-gray'
      }

      const formIcons = { '片剂':'fas fa-tablets', '胶囊':'fas fa-capsules', '冲剂':'fas fa-prescription-bottle', '口服液':'fas fa-flask', '滴剂':'fas fa-eye-dropper', '喷雾':'fas fa-spray-can' }
      result.push({
        id: med.id, timeId: medId, name: med.name, dosage: med.dosage, form: med.form || '片剂',
        formIcon: formIcons[med.form] || 'fas fa-pills',
        time: t, status, badgeClass, iconBg: ICON_COLORS[idx % ICON_COLORS.length],
        diff, timeMin,
      })
    })
  })

  // 按时间排序
  result.sort((a, b) => a.timeMin - b.timeMin)
  return result
})

// 健康数据 — 从 healthStore 读取，首页和数据页同步
const healthMetrics = computed(() => [
  { label: '心率', icon: 'fas fa-heart', value: String(healthStore.heartRate), unit: 'bpm', color: '#EF4444', trendIcon: 'fas fa-arrow-down', change: '较昨日下降2bpm', trendColor: '#52C41A' },
  { label: '血糖', icon: 'fas fa-tint', value: healthStore.bloodSugar.toFixed(1), unit: 'mmol/L', color: '#8B5CF6', trendIcon: 'fas fa-arrow-down', change: '较昨日下降0.3mmol/L', trendColor: '#52C41A' },
  { label: '睡眠', icon: 'fas fa-moon', value: healthStore.sleepHours.toFixed(1), unit: '小时', color: '#3B82F6', trendIcon: 'fas fa-arrow-down', change: '较昨日减少0.5小时', trendColor: '#F5222D' },
  { label: '步数', icon: 'fas fa-walking', value: healthStore.steps.toLocaleString(), unit: '步', color: '#52C41A', trendIcon: 'fas fa-arrow-up', change: '较昨日增加1,245步', trendColor: '#52C41A' },
])

// 药品列表
const voiceEnabled = ref(true)

function repeatLabel(repeat) {
  const map = {1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'日'}
  return repeat.map(d => map[d]||d).join('、')
}

// ================= 闹钟系统 =================
const alarmMed = ref(null)
const alarmAudioCtx = ref(null)

// Web Audio API 生成提示音（.ncm 格式无法在浏览器播放）
function playAlarmSound() {
  try {
    if (!alarmAudioCtx.value) alarmAudioCtx.value = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = alarmAudioCtx.value
    // 播放三声急促的铃声
    const notes = [800, 1000, 800, 1000, 800]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.25 + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.25)
      osc.stop(ctx.currentTime + i * 0.25 + 0.2)
    })
  } catch {}
}

// 检查是否有药品到提醒时间
function checkAlarms() {
  // 通知总开关——关闭时所有用药提醒静音
  const notifState = settingStates['notification']
  if (notifState && notifState['用药提醒通知'] === false) return

  const now = dayjs()
  const todayStr = now.format('YYYY-MM-DD')
  const currentMin = now.hour() * 60 + now.minute()
  const todayNum = now.day() || 7

  // 如果有闹钟正在显示，不重复弹
  if (alarmMed.value) return

  for (const med of medicineStore.medicines) {
    if (!med.reminder) continue
    if (med.repeat && !med.repeat.includes(todayNum)) continue

    for (const t of med.times) {
      const [h, m] = t.split(':').map(Number)
      const timeMin = h * 60 + m
      const diff = currentMin - timeMin
      const medId = med.id + '-' + t

      // 恰好到时间（0~1分钟窗口）
      if (diff >= 0 && diff <= 1) {
        // 检查是否已提醒过
        const already = alarmLog.value.some(log => log.medId === medId && log.date === todayStr)
        // 检查是否在稍后提醒中
        const snoozedItem = snoozed.value.find(s => s.medId === medId)
        if (snoozedItem && dayjs(snoozedItem.until).isAfter(dayjs())) continue

        if (!already) {
          playAlarmSound()
          alarmMed.value = { medId, name: med.name, dosage: med.dosage, time: t, id: med.id }
          return
        }
      }
    }
  }
}

function alarmTaken() {
  if (!alarmMed.value) return
  alarmLog.value.push({ medId: alarmMed.value.medId, date: dayjs().format('YYYY-MM-DD'), action: 'taken', time: dayjs().format('HH:mm') })
  localStorage.setItem('alarmLog', JSON.stringify(alarmLog.value))
  alarmMed.value = null
}

function alarmSnooze() {
  if (!alarmMed.value) return
  const existing = snoozed.value.find(s => s.medId === alarmMed.value.medId)
  const until = dayjs().add(5, 'minute').toISOString()
  if (existing) existing.until = until
  else snoozed.value.push({ medId: alarmMed.value.medId, until })
  localStorage.setItem('snoozed', JSON.stringify(snoozed.value))
  alarmMed.value = null
}

function alarmDismiss() {
  if (!alarmMed.value) return
  alarmLog.value.push({ medId: alarmMed.value.medId, date: dayjs().format('YYYY-MM-DD'), action: 'dismissed', time: dayjs().format('HH:mm') })
  localStorage.setItem('alarmLog', JSON.stringify(alarmLog.value))
  alarmMed.value = null
}

// 每15秒检查一次闹钟
let alarmTimer = null

// ================= 药品数据库 / 添加药品 =================
const medicines = computed(() => medicineStore.medicines)

const showAddMed = ref(false)
const activeMedMenu = ref(null)
const addMedSearch = ref('')
const selectedCommonMed = ref(null)
const addMedForm = reactive({
  name: '', dosage: '', form: '片剂', perDose: 1, times: ['08:00', '20:00'], reminder: true,
  repeat: ['一','二','三','四','五'], voice: true, isCustom: false,
})
const editingMedId = ref(null) // 编辑模式用

// 常见药品库
const commonMedicines = [
  { name: '阿司匹林肠溶片', form: '片剂', adultDosage: '每日1次，每次1片', childDosage: '遵医嘱', adultPerDose: 1, childPerDose: 0, freq: 1, adultTimes: ['20:00'], childTimes: [], minAge: 16 },
  { name: '布洛芬缓释胶囊', form: '胶囊', adultDosage: '每日2次，每次1粒', childDosage: '每日2次，每次半粒', adultPerDose: 1, childPerDose: 0.5, freq: 2, adultTimes: ['09:00', '21:00'], childTimes: ['09:00', '21:00'], minAge: 6 },
  { name: '盐酸二甲双胍片', form: '片剂', adultDosage: '每日3次，每次2片', childDosage: '遵医嘱', adultPerDose: 2, childPerDose: 0, freq: 3, adultTimes: ['07:30', '12:30', '18:30'], childTimes: [], minAge: 18 },
  { name: '辛伐他汀片', form: '片剂', adultDosage: '每日1次，每次1片', childDosage: '遵医嘱', adultPerDose: 1, childPerDose: 0, freq: 1, adultTimes: ['20:00'], childTimes: [], minAge: 18 },
  { name: '维生素C片', form: '片剂', adultDosage: '每日1次，每次2片', childDosage: '每日1次，每次1片', adultPerDose: 2, childPerDose: 1, freq: 1, adultTimes: ['08:00'], childTimes: ['08:00'], minAge: 3 },
  { name: '阿莫西林胶囊', form: '胶囊', adultDosage: '每日3次，每次1粒', childDosage: '每日3次，每次半粒', adultPerDose: 1, childPerDose: 0.5, freq: 3, adultTimes: ['08:00', '14:00', '20:00'], childTimes: ['08:00', '14:00', '20:00'], minAge: 1 },
  { name: '头孢克肟颗粒', form: '冲剂', adultDosage: '每日2次，每次1袋', childDosage: '每日2次，每次半袋', adultPerDose: 1, childPerDose: 0.5, freq: 2, adultTimes: ['08:00', '20:00'], childTimes: ['08:00', '20:00'], minAge: 1 },
  { name: '感冒灵颗粒', form: '冲剂', adultDosage: '每日3次，每次1袋', childDosage: '每日3次，每次半袋', adultPerDose: 1, childPerDose: 0.5, freq: 3, adultTimes: ['08:00', '14:00', '20:00'], childTimes: ['08:00', '14:00', '20:00'], minAge: 3 },
  { name: '板蓝根颗粒', form: '冲剂', adultDosage: '每日3次，每次1袋', childDosage: '每日3次，每次半袋', adultPerDose: 1, childPerDose: 0.5, freq: 3, adultTimes: ['08:00', '14:00', '20:00'], childTimes: ['08:00', '14:00', '20:00'], minAge: 1 },
  { name: '蒙脱石散', form: '冲剂', adultDosage: '每日3次，每次1袋', childDosage: '每日3次，每次半袋', adultPerDose: 1, childPerDose: 0.5, freq: 3, adultTimes: ['08:00', '14:00', '20:00'], childTimes: ['08:00', '14:00', '20:00'], minAge: 1 },
  { name: '氯雷他定片', form: '片剂', adultDosage: '每日1次，每次1片', childDosage: '每日1次，每次半片', adultPerDose: 1, childPerDose: 0.5, freq: 1, adultTimes: ['08:00'], childTimes: ['08:00'], minAge: 2 },
  { name: '奥美拉唑肠溶胶囊', form: '胶囊', adultDosage: '每日1次，每次1粒', childDosage: '遵医嘱', adultPerDose: 1, childPerDose: 0, freq: 1, adultTimes: ['07:00'], childTimes: [], minAge: 18 },
  { name: '藿香正气口服液', form: '口服液', adultDosage: '每日2次，每次1支', childDosage: '每日2次，每次半支', adultPerDose: 1, childPerDose: 0.5, freq: 2, adultTimes: ['12:00', '20:00'], childTimes: ['12:00', '20:00'], minAge: 3 },
  { name: '复方甘草片', form: '片剂', adultDosage: '每日3次，每次3片', childDosage: '每日3次，每次1片', adultPerDose: 3, childPerDose: 1, freq: 3, adultTimes: ['08:00', '14:00', '20:00'], childTimes: ['08:00', '14:00', '20:00'], minAge: 6 },
  { name: '氨酚黄那敏颗粒', form: '冲剂', adultDosage: '每日3次，每次1袋', childDosage: '每日3次，每次半袋', adultPerDose: 1, childPerDose: 0.5, freq: 3, adultTimes: ['08:00', '14:00', '20:00'], childTimes: ['08:00', '14:00', '20:00'], minAge: 1 },
]

const filteredCommonMeds = computed(() => {
  const q = addMedSearch.value.trim().toLowerCase()
  if (!q) return commonMedicines
  return commonMedicines.filter(m => m.name.includes(q))
})

function selectCommonMed(med) {
  selectedCommonMed.value = med
  const age = profileStore.info.age || 30
  const isChild = age < med.minAge
  const dosage = isChild ? med.childDosage : med.adultDosage
  const perDose = isChild ? med.childPerDose : med.adultPerDose
  const times = isChild ? (med.childTimes.length ? med.childTimes : med.adultTimes) : med.adultTimes

  addMedForm.name = med.name
  addMedForm.form = med.form
  addMedForm.dosage = dosage
  addMedForm.perDose = perDose
  addMedForm.times = [...times]
  addMedForm.isCustom = false
}

function resetAddMedForm() {
  selectedCommonMed.value = null
  addMedSearch.value = ''
  addMedForm.name = ''
  addMedForm.dosage = ''
  addMedForm.form = '片剂'
  addMedForm.perDose = 1
  addMedForm.times = ['08:00', '20:00']
  addMedForm.reminder = true
  addMedForm.repeat = ['一','二','三','四','五']
  addMedForm.voice = true
  addMedForm.isCustom = false
  editingMedId.value = null
}

function openAddMed() {
  resetAddMedForm()
  showAddMed.value = true
}

function confirmAddMed() {
  const name = addMedForm.name.trim()
  if (!name) { alert('请选择或输入药品名称'); return }

  const dayMap = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'日':7}
  const data = {
    name,
    dosage: addMedForm.dosage || '每日' + addMedForm.times.length + '次',
    times: addMedForm.times,
    form: addMedForm.form,
    perDose: addMedForm.perDose,
    reminder: addMedForm.reminder,
    repeat: addMedForm.repeat.map(d => dayMap[d] || 1),
    voiceReminder: addMedForm.voice,
  }

  if (editingMedId.value) {
    medicineStore.updateMedicine(editingMedId.value, data)
  } else {
    medicineStore.addMedicine(data)
  }
  showAddMed.value = false
  resetAddMedForm()
}

function toggleAddRepeat(d) {
  const idx = addMedForm.repeat.indexOf(d)
  if (idx > -1) addMedForm.repeat.splice(idx, 1)
  else addMedForm.repeat.push(d)
}

function toggleMedMenu(id) {
  activeMedMenu.value = activeMedMenu.value === id ? null : id
}

function editMedicine(med) {
  activeMedMenu.value = null
  // 回填到添加表单
  const dayLabels = {1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'日'}
  addMedForm.name = med.name
  addMedForm.dosage = med.dosage
  addMedForm.form = med.form || '片剂'
  addMedForm.perDose = med.perDose || 1
  addMedForm.times = med.times ? [...med.times] : ['08:00','20:00']
  addMedForm.reminder = med.reminder !== false
  addMedForm.repeat = (med.repeat || [1,2,3,4,5]).map(d => dayLabels[d] || '一')
  addMedForm.voice = med.voiceReminder !== false
  addMedForm.isCustom = true
  editingMedId.value = med.id
  selectedCommonMed.value = { name: med.name }
  showAddMed.value = true
}

function deleteMedicine(med) {
  activeMedMenu.value = null
  if (confirm(`确定要删除「${med.name}」吗？`)) {
    medicineStore.deleteMedicine(med.id)
  }
}

let closeMenuHandler = null

function setCustomMode() {
  selectedCommonMed.value = null
  addMedForm.isCustom = true
  addMedForm.name = ''
  addMedForm.dosage = ''
  addMedForm.perDose = 1
}

const formLabels = { '片剂':'片','胶囊':'粒','冲剂':'袋','口服液':'支','滴剂':'滴','喷雾':'喷' }
const formIcons = { '片剂':'fas fa-tablets', '胶囊':'fas fa-capsules', '冲剂':'fas fa-prescription-bottle', '口服液':'fas fa-flask', '滴剂':'fas fa-eye-dropper', '喷雾':'fas fa-spray-can' }
const medColors = ['#52B788','#F59E0B','#8B5CF6','#3B82F6','#EC4899','#14B8A6']

function medFormIcon(form) { return formIcons[form] || 'fas fa-pills' }

// 个人资料 - 从 profileStore 读取，编辑时持久化
const profileInfo = profileStore.info
const personalInfo = computed(() => [
  { label: t('profile.gender'), value: profileInfo.gender },
  { label: t('profile.age'), value: `${profileInfo.age}${t('common.devAge')}` },
  { label: t('profile.height'), value: `${profileInfo.height} cm` },
  { label: t('profile.weight'), value: `${profileInfo.weight} kg` },
  { label: t('profile.bloodType'), value: profileInfo.bloodType },
])
const settings = computed(() => [
  { key: 'account', label: t('profile.account'), icon: 'fas fa-user-circle' },
  { key: 'notification', label: t('profile.notification'), icon: 'fas fa-bell' },
  { key: 'device', label: t('profile.device'), icon: 'fas fa-bluetooth' },
  { key: 'privacy', label: t('profile.privacy'), icon: 'fas fa-shield-alt' },
  { key: 'language', label: t('profile.language'), icon: 'fas fa-language' },
  { key: 'theme', label: t('profile.theme'), icon: 'fas fa-moon' },
  { key: 'sync', label: t('profile.sync'), icon: 'fas fa-cloud' },
  { key: 'export', label: t('profile.export'), icon: 'fas fa-download' },
  { key: 'about', label: t('profile.about'), icon: 'fas fa-question-circle' },
])
const helpItems = computed(() => [
  { key: 'faq', label: t('profile.faq'), icon: 'fas fa-question-circle' },
  { key: 'contact', label: t('profile.contact'), icon: 'fas fa-headset' },
])

const showSettingModal = ref('')
// 设置弹窗中的交互状态
const settingStates = reactive({})

function initSettingStates(key) {
  const savedTheme = localStorage.getItem('health_theme') || '浅色模式'
  const savedLang = localStorage.getItem('health_language') || '简体中文'
  const defaults = {
    notification: { '用药提醒通知': true, '健康报告通知': true, '心率异常通知': false, '系统通知': true },
    privacy: { '允许数据同步': true, '允许位置信息': false, '允许健康数据分享': true, '匿名使用统计': false },
    sync: { 'WiFi下自动同步': true, '使用移动数据同步': false },
    theme: { selected: savedTheme },
    language: { selected: savedLang },
  }
  if (!settingStates[key]) {
    settingStates[key] = defaults[key] ? { ...defaults[key] } : {}
  }
}

function toggleSetting(key, label) {
  if (settingStates[key] && label in settingStates[key]) {
    settingStates[key][label] = !settingStates[key][label]
  }
}

function selectSetting(key, value) {
  if (settingStates[key]) settingStates[key].selected = value
  if (key === 'theme') {
    applyTheme(value)
    localStorage.setItem('health_theme', value)
  }
  if (key === 'language') {
    localStorage.setItem('health_language', value)
    switchLanguage(value)
  }
}

function applyTheme(mode) {
  if (mode === '深色模式') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

// 启动时恢复主题
const savedTheme = localStorage.getItem('health_theme') || '浅色模式'
onMounted(() => {
  // ... existing
})

// 在设置初始化时恢复
// 在 initSettingStates 后面补充 theme 初始化

function handleSetting(key) {
  if (key === 'account') {
    // 回填当前值
    const acct = authStore.getAccountInfo()
    accountForm.displayName = authStore.user?.name || ''
    accountForm.email = acct.email || ''
    accountForm.phone = acct.phone || ''
    accountForm.currentPassword = ''
    accountForm.newPassword = ''
    accountForm.confirmPassword = ''
    clearAccountErrors()
    showAccountModal.value = true
    return
  }
  initSettingStates(key)
  showSettingModal.value = key
}

const faqAnswers = {
  '如何添加药品？': '进入「药品」页面 → 点击右上角「添加药品」按钮 → 从常见药品列表选择或手动输入 → 配置用量和时间 → 确认添加。',
  '忘记服药怎么办？': '如果错过服药时间，请尽快补服。如果已接近下一次服药时间，则跳过本次，按原计划服用下一次。切勿一次服用双倍剂量。',
  '数据如何同步？': '数据会自动保存在本地。您可以在「设置 → 数据同步」中配置WiFi下自动同步到云端。',
  '如何更换头像？': '进入「我的」页面 → 点击头像右下角的相机按钮 → 从相册选择图片 → 系统自动裁剪为圆形 → 确认使用。',
}

function getSettingContent(key) {
  const map = {
    notification: { title: '通知设置', type: 'toggle' },
    privacy: { title: '隐私设置', type: 'toggle' },
    sync: { title: '数据同步', type: 'toggle' },
    export: { title: '数据导出', type: 'action', actions: [
      { label: '导出健康报告', desc: '生成HTML报告并下载' },
      { label: '导出用药记录', desc: '生成CSV表格' },
      { label: '导出心率数据', desc: '生成JSON文件' },
      { label: '导出睡眠数据', desc: '生成JSON文件' },
    ]},
    faq: { title: '常见问题', type: 'faq' },
    contact: { title: '联系客服', type: 'info', items: [
      { label: '客服电话', value: '13800001111', copyable: true },
      { label: '在线时间', value: '9:00 - 21:00' },
      { label: '服务邮箱', value: '1226597506@qq.com', copyable: true },
      { label: '微信公众号', value: '健康管家' },
    ]},
    theme: { title: '主题设置', type: 'select', options: ['浅色模式', '深色模式', '跟随系统'] },
    language: { title: '语言设置', type: 'select', options: ['简体中文', 'English', '日本語', '한국어'] },
    device: { title: '设备管理', type: 'info', items: [
      { label: '已连接设备', value: '2 台' },
      { label: '可用设备', value: '2 台' },
      { label: '蓝牙状态', value: '已开启' },
      { label: '上次同步', value: '今天 20:00' },
    ]},
    about: { title: '关于我们', type: 'about' },
  }
  return map[key] || { title: '设置', type: 'info', items: [{ label: '', value: '功能开发中' }] }
}

function exportHealthReport() {
  const now = dayjs()
  const weekStart = now.subtract(6, 'day').format('YYYY年M月D日')
  const weekEnd = now.format('YYYY年M月D日')
  const h = profileInfo.height / 100
  const w = profileInfo.weight
  const bmi = h > 0 ? (w / (h * h)).toFixed(1) : '-'
  const userName = profileInfo.name || '用户'
  const meds = medicineStore.medicines || []
  const medSummary = meds.length > 0 ? meds.map(m => `  · ${m.name}（${m.dosage || ''}）`).join('\n') : '  暂无用药记录'

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>健康报告 - ${weekStart} ~ ${weekEnd}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif; color: #2D3748; line-height: 1.6; max-width: 700px; margin: 0 auto; padding: 40px 24px; background: #F0FDF4; }
    .report-card { background: #fff; border-radius: 16px; padding: 32px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { text-align: center; padding-bottom: 24px; border-bottom: 3px solid #52B788; margin-bottom: 24px; }
    .header h1 { font-size: 28px; color: #2C5F2D; margin-bottom: 6px; }
    .header p { font-size: 14px; color: #718096; }
    .section-title { font-size: 18px; color: #2C5F2D; border-left: 4px solid #52B788; padding-left: 12px; margin-bottom: 16px; font-weight: 600; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-item { background: #F7FAFC; border-radius: 10px; padding: 16px; text-align: center; }
    .grid-item .val { font-size: 24px; font-weight: bold; color: #2C5F2D; }
    .grid-item .lbl { font-size: 12px; color: #718096; margin-top: 4px; }
    .score-box { background: linear-gradient(135deg, #3B82F6, #2563EB); color: #fff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px; }
    .score-box .score-num { font-size: 48px; font-weight: bold; }
    .score-box .score-label { font-size: 14px; opacity: 0.85; margin-top: 4px; }
    .med-list { background: #F7FAFC; border-radius: 10px; padding: 16px; font-size: 14px; white-space: pre-line; }
    .compliance { background: #F0FFF4; border: 1px solid #C6F6D5; border-radius: 10px; padding: 16px; text-align: center; font-size: 16px; color: #276749; margin-top: 12px; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table td { padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px; }
    .info-table td:first-child { color: #718096; width: 100px; }
    .info-table td:last-child { font-weight: 500; }
    .footer { text-align: center; font-size: 12px; color: #A0AEC0; margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <h1>🏥 健康管家 · 周度健康报告</h1>
      <p>报告周期：<strong>${weekStart} ~ ${weekEnd}</strong></p>
      <p style="margin-top:6px">生成时间：${now.format('YYYY年M月D日 HH:mm')} &nbsp;|&nbsp; 用户：${userName}</p>
    </div>

    <div class="score-box">
      <div class="score-num">87</div>
      <div class="score-label">综合健康评分（较上周提升3分）</div>
    </div>

    <h2 class="section-title">📊 核心指标</h2>
    <div class="grid-2" style="margin-bottom:20px">
      <div class="grid-item"><div class="val">${healthStore.heartRate}</div><div class="lbl">💓 平均心率 (bpm)</div></div>
      <div class="grid-item"><div class="val">${healthStore.bloodSugar.toFixed(1)}</div><div class="lbl">🩸 血糖 (mmol/L)</div></div>
      <div class="grid-item"><div class="val">${healthStore.sleepHours.toFixed(1)}</div><div class="lbl">🌙 平均睡眠 (小时)</div></div>
      <div class="grid-item"><div class="val">${healthStore.steps.toLocaleString()}</div><div class="lbl">🚶 周均步数</div></div>
    </div>

    <h2 class="section-title">💊 用药情况</h2>
    <div class="med-list">${medSummary}</div>
    <div class="compliance">✅ 本周用药完成率：92% — 依从性良好</div>

    <h2 class="section-title" style="margin-top:24px">👤 个人信息</h2>
    <table class="info-table">
      <tr><td>姓名</td><td>${userName}</td></tr>
      <tr><td>性别</td><td>${profileInfo.gender || '-'}</td></tr>
      <tr><td>年龄</td><td>${profileInfo.age || '-'}岁</td></tr>
      <tr><td>身高</td><td>${profileInfo.height || '-'} cm</td></tr>
      <tr><td>体重</td><td>${profileInfo.weight || '-'} kg</td></tr>
      <tr><td>血型</td><td>${profileInfo.bloodType || '-'}</td></tr>
      <tr><td>BMI</td><td>${bmi}</td></tr>
    </table>
  </div>

  <div class="footer">
    本报告由「健康管家」自动生成 &nbsp;|&nbsp; 仅供参考，不构成医疗建议
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `健康报告_${now.format('YYYYMMDD')}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  showSettingModal.value = ''
}

function handleSettingAction(action) {
  exportHealthReport()
}

const expandedFaq = ref('')

function toggleFaq(q) {
  expandedFaq.value = expandedFaq.value === q ? '' : q
}

function copyText(text) {
  navigator.clipboard?.writeText(text)
  // 界面反馈
  const btn = document.activeElement
  if (btn) {
    const icon = btn.querySelector('.fa-copy')
    if (icon) { icon.className = 'fas fa-check'; setTimeout(() => { icon.className = 'fas fa-copy' }, 1200) }
  }
}

function showAllNotifications() {
  showNotif.value = false
  const msg = notifications.map(n => `${n.title}: ${n.content}`).join('\n')
  alert('📋 全部通知\n\n' + msg)
}

// ================= 药品识别系统 =================
const recogStep = ref('upload') // upload | scanning | result
const recogPreviewUrl = ref('')
const scanProgress = ref(0)
const recogResult = ref({})
const recogFileInput = ref(null)
let scanTimer = null

// 药品知识库（可识别以下药品）
const drugRecognitionDB = [
  { name: '阿司匹林肠溶片', manufacturer: '拜耳医药保健有限公司', spec: '100mg×30片/盒', effect: '用于缓解轻度或中度疼痛，亦用于抗血小板聚集，预防心脑血管疾病', tags: ['OTC', '西药'] },
  { name: '布洛芬缓释胶囊', manufacturer: '中美天津史克制药有限公司', spec: '300mg×20粒/盒', effect: '用于缓解关节痛、神经痛、肌肉痛、头痛、牙痛及退热', tags: ['OTC', '西药'] },
  { name: '盐酸二甲双胍片', manufacturer: '中美上海施贵宝制药有限公司', spec: '0.5g×30片/盒', effect: '用于2型糖尿病的治疗，控制血糖水平', tags: ['处方药', '西药'] },
  { name: '辛伐他汀片', manufacturer: '杭州默沙东制药有限公司', spec: '20mg×28片/盒', effect: '用于高脂血症和冠心病的治疗，降低胆固醇', tags: ['处方药', '西药'] },
  { name: '维生素C片', manufacturer: '东北制药集团沈阳第一制药有限公司', spec: '100mg×100片/瓶', effect: '补充维生素C，增强机体免疫力，用于预防坏血病', tags: ['OTC', '保健品'] },
  { name: '阿莫西林胶囊', manufacturer: '珠海联邦制药股份有限公司', spec: '0.5g×24粒/盒', effect: '用于敏感菌所致的呼吸道感染、泌尿生殖道感染等', tags: ['处方药', '西药'] },
  { name: '头孢克肟颗粒', manufacturer: '广州白云山医药集团', spec: '50mg×6袋/盒', effect: '用于支气管炎、肺炎、淋菌性尿道炎等感染性疾病', tags: ['处方药', '西药'] },
  { name: '感冒灵颗粒', manufacturer: '华润三九医药股份有限公司', spec: '10g×9袋/盒', effect: '用于感冒引起的头痛、发热、鼻塞、流涕、咽痛', tags: ['OTC', '中成药'] },
  { name: '板蓝根颗粒', manufacturer: '广州白云山和记黄埔中药有限公司', spec: '10g×20袋/包', effect: '清热解毒，凉血利咽，用于肺胃热盛所致的咽喉肿痛', tags: ['OTC', '中成药'] },
  { name: '连花清瘟胶囊', manufacturer: '石家庄以岭药业股份有限公司', spec: '0.35g×36粒/盒', effect: '用于流行性感冒属热毒袭肺证，症见发热、恶寒、鼻塞流涕', tags: ['OTC', '中成药'] },
  { name: '奥美拉唑肠溶胶囊', manufacturer: '常州四药制药有限公司', spec: '20mg×14粒/盒', effect: '用于胃食管反流病、消化性溃疡的治疗', tags: ['处方药', '西药'] },
  { name: '硝苯地平缓释片', manufacturer: '拜耳医药保健有限公司', spec: '30mg×30片/盒', effect: '用于高血压、冠心病的治疗，平稳控制血压', tags: ['处方药', '西药'] },
]

// 快速体验预置图片
const demoMedImages = [
  { key: 'aspirin', file: 'aspirin.png', name: '阿司匹林肠溶片', drugName: '阿司匹林肠溶片' },
  { key: 'ibuprofen', file: 'ibuprofen.png', name: '布洛芬缓释胶囊', drugName: '布洛芬缓释胶囊' },
  { key: 'vitamin-c', file: 'vitamin-c.png', name: '维生素C片', drugName: '维生素C片' },
  { key: 'banlangen', file: 'banlangen.png', name: '板蓝根颗粒', drugName: '板蓝根颗粒' },
  { key: 'ganmaoling', file: 'ganmaoling.png', name: '感冒灵颗粒', drugName: '感冒灵颗粒' },
]

function useDemoImage(demo) {
  // 直接加载预置图片
  recogPreviewUrl.value = `/medicine-images/${demo.file}`
  // 匹配对应药品
  const match = drugRecognitionDB.find(d => d.name === demo.drugName)
  if (match) {
    recogResult.value = { ...match }
  } else {
    const idx = Math.floor(Math.random() * drugRecognitionDB.length)
    recogResult.value = { ...drugRecognitionDB[idx] }
  }
  // 直接跳到结果
  recogStep.value = 'result'
}

function triggerRecogInput(mode) {
  if (mode === 'camera') recogFileInput.value.setAttribute('capture', 'environment')
  else recogFileInput.value.removeAttribute('capture')
  recogFileInput.value.click()
}

function handleRecogFile(e) {
  const file = e.target.files[0]
  if (!file) return
  recogPreviewUrl.value = URL.createObjectURL(file)
}

function handleRecogDrop(e) {
  const file = e.dataTransfer.files[0]
  if (!file || !file.type.startsWith('image/')) return
  recogPreviewUrl.value = URL.createObjectURL(file)
}

function startRecognition() {
  recogStep.value = 'scanning'
  scanProgress.value = 0

  // 模拟扫描进度动画
  let progress = 0
  clearInterval(scanTimer)
  scanTimer = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 3
    if (progress >= 100) {
      progress = 100
      clearInterval(scanTimer)
      // 扫描完成，随机匹配一个药品
      const idx = Math.floor(Math.random() * drugRecognitionDB.length)
      recogResult.value = { ...drugRecognitionDB[idx] }
      setTimeout(() => { recogStep.value = 'result' }, 400)
    }
    scanProgress.value = progress
  }, 120)
}

function resetRecognition() {
  clearInterval(scanTimer)
  recogStep.value = 'upload'
  scanProgress.value = 0
  recogPreviewUrl.value = ''
  recogResult.value = {}
  if (recogFileInput.value) recogFileInput.value.value = ''
}

function addRecognizedMed() {
  if (!recogResult.value.name) return
  const form = recogResult.value.spec.includes('胶囊') || recogResult.value.name.includes('胶囊') ? '胶囊' : '片剂'
  const perDose = recogResult.value.name === '板蓝根颗粒' || recogResult.value.name === '感冒灵颗粒' || recogResult.value.name === '头孢克肟颗粒' ? 1 : 1
  medicineStore.addMedicine({
    name: recogResult.value.name,
    dosage: '每日2次，每次1' + (form === '胶囊' ? '粒' : '片'),
    times: ['08:00', '20:00'],
    reminder: true,
    repeat: [1,2,3,4,5,6,7],
    voiceReminder: true,
    form: form,
    perDose: perDose,
  })
  resetRecognition()
  closeModal('medication')
  // 切换到药品页面
  activeTab.value = 'medicine'
}

function simulateAddDevice() {
  alert('📡 正在搜索附近设备...\n\n已发现新设备：华为智能手环 8\n点击「连接」即可配对')
}

function simulateConnect(name) {
  alert(`🔗 正在连接 ${name}...\n\n连接成功！`)
}

function saveReminder() {
  const times = reminderForm.times.join('、')
  const days = reminderForm.repeat.join('、')
  alert(`✅ 用药提醒已保存\n\n药品：${reminderForm.name}\n时间：${times}\n重复：${days ? '每周' + days : '仅一次'}\n语音提醒：${reminderForm.voice ? '开启' : '关闭'}`)
  closeModal('reminder')
}

const showBmiModal = ref(false)

function showBmiInfo() { showBmiModal.value = true }

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

// 心率和图表
const currentHeartRate = ref(72)
const heartUpdateTime = ref('刚刚')
const heartCanvas = ref(null)
const bloodSugarChartRef = ref(null)
const heartChartRef = ref(null)
const sleepChartRef = ref(null)
const reportChartRef = ref(null)

let heartTimer = null
let chartsInited = false

function initBloodSugarChart() {
  if (!bloodSugarChartRef.value) return
  const chart = echarts.init(bloodSugarChartRef.value)
  chart.setOption({
    grid: { top: '8%', right: '3%', bottom: '12%', left: '3%' },
    xAxis: { type: 'category', data: getLast7DayLabels(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color:'#6B7280' } },
    yAxis: { type: 'value', min:4, max:8, interval:1, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color:'#6B7280' }, splitLine: { lineStyle:{color:'#F3F4F6'} } },
    series: [{ data: [5.8,6.2,5.9,5.7,5.5,5.4,5.4], type:'line', smooth:true, symbol:'circle', symbolSize:6, itemStyle:{color:'#3B82F6'}, lineStyle:{color:'#3B82F6',width:2}, areaStyle:{ color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(59,130,246,0.2)'},{offset:1,color:'rgba(59,130,246,0)'}]} } }],
    tooltip: { trigger:'axis' },
  })
}

// 生成最近7天的横轴标签，最后一天显示"今天"
function getLast7DayLabels() {
  const labels = []
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day')
    if (i === 0) labels.push('今天')
    else labels.push(d.format('dddd'))
  }
  return labels
}

let heartChartInstance = null
let sleepChartInstance = null

function initHeartChart() {
  if (!heartChartRef.value) return
  // 先销毁已有实例
  if (heartChartInstance) { heartChartInstance.dispose(); heartChartInstance = null }
  heartChartInstance = echarts.init(heartChartRef.value)
  const w = heartChartRef.value.clientWidth || 400
  heartChartInstance.setOption({
    grid: { top:48, right:20, bottom:44, left: Math.max(50, w * 0.14) },
    xAxis: {
      type:'category',
      data: getLast7DayLabels(),
      axisLine:{ show:true, lineStyle:{ color:'#E5E7EB', width:1 } },
      axisTick:{ show:true, alignWithLabel:true, lineStyle:{ color:'#D1D5DB' } },
      axisLabel:{ color:'#6B7280', fontSize:12, fontWeight:500, margin:10 },
    },
    yAxis: {
      type:'value', min:60, max:90, interval:10,
      name:'bpm', nameTextStyle:{ color:'#9CA3AF', fontSize:12 },
      axisLine:{ show:true, lineStyle:{ color:'#E5E7EB' } },
      axisTick:{ show:true, length:4, lineStyle:{ color:'#D1D5DB' } },
      axisLabel:{ color:'#6B7280', fontSize:11, fontWeight:500 },
      splitLine:{ show:true, lineStyle:{ color:'#F3F4F6', type:'dashed' } },
    },
    series: [{
      data:[72,75,70,78,74,76,73], type:'line', smooth:true, symbol:'circle', symbolSize:8,
      itemStyle:{ color:'#EF4444' },
      lineStyle:{ color:'#EF4444', width:3 },
      areaStyle:{ color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(239,68,68,0.25)'},{offset:1,color:'rgba(239,68,68,0.02)'}] } },
      markLine:{ silent:true, data:[{ yAxis:72, name:'静息均值', lineStyle:{ color:'#9CA3AF', type:'dashed', width:1 }, label:{ formatter:'静息 72', color:'#9CA3AF', fontSize:10, position:'insideEndTop' } }] },
      markArea:{ silent:true, data:[[{ yAxis:60, itemStyle:{ color:'rgba(82,196,26,0.06)' } },{ yAxis:80 }]] },
    }],
    tooltip:{ trigger:'axis', backgroundColor:'rgba(255,255,255,0.95)', borderColor:'#E5E7EB', borderWidth:1, padding:[10,14], textStyle:{ fontSize:12, color:'#374151' } },
  })
}

function initSleepChart() {
  if (!sleepChartRef.value) return
  if (sleepChartInstance) { sleepChartInstance.dispose(); sleepChartInstance = null }
  sleepChartInstance = echarts.init(sleepChartRef.value)
  const w = sleepChartRef.value.clientWidth || 400
  sleepChartInstance.setOption({
    grid: { top:48, right:20, bottom:44, left: Math.max(50, w * 0.14) },
    xAxis: {
      type:'category',
      data: getLast7DayLabels(),
      axisLine:{ show:true, lineStyle:{ color:'#E5E7EB', width:1 } },
      axisTick:{ show:true, alignWithLabel:true, lineStyle:{ color:'#D1D5DB' } },
      axisLabel:{ color:'#6B7280', fontSize:12, fontWeight:500, margin:10 },
    },
    yAxis: {
      type:'value', min:5, max:9, interval:1,
      name:'小时', nameTextStyle:{ color:'#9CA3AF', fontSize:12 },
      axisLine:{ show:true, lineStyle:{ color:'#E5E7EB' } },
      axisTick:{ show:true, length:4, lineStyle:{ color:'#D1D5DB' } },
      axisLabel:{ color:'#6B7280', fontSize:11, fontWeight:500 },
      splitLine:{ show:true, lineStyle:{ color:'#F3F4F6', type:'dashed' } },
    },
    series: [{
      data:[7.5,7.2,7.8,7.0,7.3,8.0,7.6], type:'bar', barWidth:'45%',
      itemStyle:{
        color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'#8B5CF6'},{offset:1,color:'#A78BFA'}] },
        borderRadius:[8,8,0,0],
      },
      label:{
        show:true, position:'top', color:'#8B5CF6', fontWeight:'bold', fontSize:12,
        formatter:(p) => p.value + 'h',
      },
      markLine:{
        silent:true,
        data:[{ yAxis:7, name:'推荐下限', lineStyle:{ color:'#F59E0B', type:'dashed', width:1 }, label:{ formatter:'推荐 7h', color:'#F59E0B', fontSize:10, position:'insideEndTop' } }],
      },
    }],
    tooltip:{ trigger:'axis', backgroundColor:'rgba(255,255,255,0.95)', borderColor:'#E5E7EB', borderWidth:1, padding:[10,14], textStyle:{ fontSize:12, color:'#374151' } },
  })
}

function initReportChart() {
  if (!reportChartRef.value) return
  const chart = echarts.init(reportChartRef.value)
  const w = reportChartRef.value.clientWidth || 400
  chart.setOption({
    grid: { top:40, right:20, bottom:72, left: Math.max(45, w * 0.13) },
    xAxis: {
      type:'category', data:['第1周','第2周','第3周','第4周'],
      axisLine:{ show:true, lineStyle:{ color:'#E5E7EB', width:1 } },
      axisTick:{ show:true, alignWithLabel:true },
      axisLabel:{ color:'#6B7280', fontSize:12, fontWeight:500, margin:10 },
    },
    yAxis: {
      type:'value', min:70, max:95, interval:5,
      axisLine:{ show:true, lineStyle:{ color:'#E5E7EB' } },
      axisTick:{ show:true, length:4 },
      axisLabel:{ color:'#6B7280', fontSize:11, fontWeight:500 },
      splitLine:{ show:true, lineStyle:{ color:'#F3F4F6', type:'dashed' } },
    },
    series: [
      {
        name:'健康评分', data:[82,80,84,87], type:'line', smooth:true,
        symbol:'circle', symbolSize:8,
        itemStyle:{ color:'#3B82F6' },
        lineStyle:{ color:'#3B82F6', width:3 },
        areaStyle:{ color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(59,130,246,0.2)'},{offset:1,color:'rgba(59,130,246,0)'}] } },
      },
      {
        name:'用药依从性', data:[75,85,88,92], type:'line', smooth:true,
        symbol:'circle', symbolSize:8,
        itemStyle:{ color:'#10B981' },
        lineStyle:{ color:'#10B981', width:3 },
      },
    ],
    legend: {
      bottom:8, left:'center', icon:'circle',
      textStyle:{ color:'#6B7280', fontSize:12 },
      itemWidth:10, itemHeight:10,
    },
    tooltip: {
      trigger:'axis',
      backgroundColor:'rgba(255,255,255,0.96)',
      borderColor:'#E5E7EB', borderWidth:1,
      padding:[12,16],
      textStyle:{ fontSize:13, color:'#374151' },
      formatter(params) {
        const p = params[0]
        let html = `<div style="font-weight:600;font-size:14px;margin-bottom:6px">${p.axisValue}</div>`
        params.forEach(item => {
          html += `<div style="display:flex;justify-content:space-between;gap:24px;padding:2px 0">
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${item.color};margin-right:6px"></span>${item.seriesName}</span>
            <span style="font-weight:600">${item.value}</span>
          </div>`
        })
        return html
      },
    },
  })
}

// 心率脉冲动画
function drawHeartPulse() {
  const canvas = heartCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  const cx = w/2, cy = h/2, r = 72
  let pulse = 0

  function animate() {
    ctx.clearRect(0, 0, w, h)
    // 外圈脉冲
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(239,68,68,${0.3 + Math.sin(pulse) * 0.2})`
    ctx.lineWidth = 4
    ctx.stroke()
    // 内圈
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2)
    ctx.strokeStyle = '#EF4444'
    ctx.lineWidth = 2
    ctx.stroke()
    pulse += 0.05
    requestAnimationFrame(animate)
  }
  animate()
}

function initCharts() {
  nextTick(() => {
    initBloodSugarChart()
    initHeartChart()
    initSleepChart()
  })
}

// 提醒表单
const reminderForm = reactive({
  name: '阿司匹林肠溶片',
  dosage: '每日2次，每次1片',
  times: ['08:00', '20:00'],
  repeat: ['一','二','三','四','五'],
  voice: true,
})

function toggleRepeatDay(d) {
  const idx = reminderForm.repeat.indexOf(d)
  if (idx > -1) reminderForm.repeat.splice(idx, 1)
  else reminderForm.repeat.push(d)
}

// 设备列表
const connectedDevices = [
  { name: '智能手环', model: '小米手环 7', icon: 'fas fa-watch', color: '#3B82F6', bg: '#DBEAFE' },
  { name: '血糖仪', model: '强生稳捷', icon: 'fas fa-tint', color: '#8B5CF6', bg: '#E9D5FF' },
]
const availableDevices = [
  { name: '心率监测仪', model: '华为心率监测仪', icon: 'fas fa-heartbeat', color: '#EF4444', bg: '#FEE2E2' },
  { name: '睡眠监测器', model: 'Fitbit 睡眠监测器', icon: 'fas fa-bed', color: '#F59E0B', bg: '#FEF3C7' },
]

// 报告 — 与首页健康数据同步
const reportItems = computed(() => {
  const h = profileInfo.height / 100
  const w = profileInfo.weight
  const bmi = h > 0 ? (w / (h * h)).toFixed(1) : '-'
  return [
    { label: '平均心率', value: healthStore.heartRate + ' bpm' },
    { label: '平均睡眠', value: healthStore.sleepHours.toFixed(1) + ' 小时' },
    { label: '运动步数', value: healthStore.steps.toLocaleString() + ' 步' },
    { label: 'BMI指数', value: bmi },
  ]
})

// Modal控制
const modals = reactive({ medication: false, reminder: false, devices: false, report: false })
const showNameEdit = ref(false)
const showProfileEdit = ref(false)
const showAvatarModal = ref(false)
const showAccountModal = ref(false)
const fileInputRef = ref(null)
const avatarPreviewUrl = ref('')
const cropping = ref(false)
const nameInput = ref('')
const profileForm = reactive({ gender: '男', age: 30, height: 175, weight: 70, bloodType: 'A型' })
const accountForm = reactive({
  displayName: authStore.user?.name || '',
  email: authStore.getAccountInfo().email || '',
  phone: authStore.getAccountInfo().phone || '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const accountErrors = reactive({ displayName: '', email: '', phone: '', password: '' })
const accountSaveMsg = ref('')

function clearAccountErrors() {
  accountErrors.displayName = ''
  accountErrors.email = ''
  accountErrors.phone = ''
  accountErrors.password = ''
  accountSaveMsg.value = ''
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

function saveAccount() {
  clearAccountErrors()

  // 验证当前密码
  const currentPwd = accountForm.currentPassword.trim()
  const storedPwd = authStore.getStoredPassword()
  if (storedPwd && currentPwd !== storedPwd) {
    accountErrors.password = '当前密码不正确'
    return
  }

  // 验证显示名称
  const displayName = accountForm.displayName.trim()
  if (!displayName) {
    accountErrors.displayName = '显示名称不能为空'
    return
  }

  // 验证邮箱
  const email = accountForm.email.trim()
  if (email && !validateEmail(email)) {
    accountErrors.email = '邮箱格式不正确（示例：user@example.com）'
    return
  }

  // 验证手机号
  const phone = accountForm.phone.trim()
  if (phone && !validatePhone(phone)) {
    accountErrors.phone = '手机号格式不正确（11位手机号）'
    return
  }

  // 验证新密码
  const newPwd = accountForm.newPassword
  const confirmPwd = accountForm.confirmPassword
  if (newPwd || confirmPwd) {
    if (newPwd.length < 3) {
      accountErrors.password = '密码至少3个字符'
      return
    }
    if (newPwd !== confirmPwd) {
      accountErrors.password = '两次输入的密码不一致'
      return
    }
  }

  // === 开始保存 ===

  // 1. 更新显示名称（同步到 authStore 和 profileStore）
  authStore.updateProfile({
    name: displayName,
  })
  profileStore.updateInfo({ name: displayName })

  // 2. 更新邮箱和手机号
  authStore.saveAccountInfo({ email, phone })
  profileStore.updateInfo({ email, phone })

  // 3. 更新密码
  if (newPwd) {
    authStore.updatePassword(newPwd)
  }

  // 4. 刷新表单
  accountForm.currentPassword = ''
  accountForm.newPassword = ''
  accountForm.confirmPassword = ''
  accountForm.displayName = displayName
  accountForm.email = email
  accountForm.phone = phone

  accountSaveMsg.value = '✅ 保存成功！'
  setTimeout(() => { accountSaveMsg.value = '' }, 2500)
}

function openModal(name) { modals[name] = true; if (name === 'report') nextTick(() => initReportChart()) }
function closeModal(name) { modals[name] = false }

function openNameEdit() { nameInput.value = authStore.user?.name || ''; showNameEdit.value = true }
function saveName() {
  const newName = nameInput.value.trim()
  if (newName) {
    authStore.updateProfile({ name: newName })
    profileStore.updateInfo({ name: newName })
    showNameEdit.value = false
  }
}

function openProfileEdit() {
  profileForm.gender = profileInfo.gender
  profileForm.age = profileInfo.age
  profileForm.height = profileInfo.height
  profileForm.weight = profileInfo.weight
  profileForm.bloodType = profileInfo.bloodType
  showProfileEdit.value = true
}
function saveProfile() {
  profileStore.updateInfo({
    gender: profileForm.gender,
    age: profileForm.age,
    height: profileForm.height,
    weight: profileForm.weight,
    bloodType: profileForm.bloodType,
  })
  showProfileEdit.value = false
}

function openAvatarModal() {
  avatarPreviewUrl.value = ''
  cropping.value = false
  showAvatarModal.value = true
}

function onFileSelected(e) {
  const file = e.target.files[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    // 使用 canvas 做圆形裁剪
    const size = Math.min(img.width, img.height)
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    // 绘制圆形路径
    ctx.beginPath()
    ctx.arc(100, 100, 100, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    // 居中取正方形区域绘制
    const sx = (img.width - size) / 2
    const sy = (img.height - size) / 2
    ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200)
    avatarPreviewUrl.value = canvas.toDataURL('image/jpeg', 0.9)
    cropping.value = true
  }
  img.src = URL.createObjectURL(file)
  // 重置 input，允许重复选同一张
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function confirmAvatar() {
  if (avatarPreviewUrl.value) {
    localStorage.setItem('avatarUrl', avatarPreviewUrl.value)
    // 同步到 authStore 的 user 对象，保证刷新后 user 里也存着头像
    authStore.updateProfile({ avatar: avatarPreviewUrl.value })
  }
  showAvatarModal.value = false
}

function cancelAvatar() {
  avatarPreviewUrl.value = ''
  cropping.value = false
}
function toggleNotification() { showNotif.value = !showNotif.value }

function switchTab(tab) {
  activeTab.value = tab
  showNotif.value = false
  if (tab === 'data') {
    // 用 requestAnimationFrame 确保容器渲染完成拿到真实宽高
    nextTick(() => {
      requestAnimationFrame(() => {
        initHeartChart()
        initSleepChart()
      })
    })
  }
}

onMounted(() => {
  if (medicineStore.medicines.length === 0) medicineStore.loadMedicines()
  // 恢复主题
  const savedTheme = localStorage.getItem('health_theme') || '浅色模式'
  applyTheme(savedTheme)
  closeMenuHandler = () => { activeMedMenu.value = null }
  document.addEventListener('click', closeMenuHandler)
  drawHeartPulse()
  // 启动闹钟检查，每15秒一次
  alarmTimer = setInterval(checkAlarms, 15000)
  setTimeout(checkAlarms, 1000) // 首次快速检查
  // 默认首页不初始化图表，切换到数据页时再初始化
  heartTimer = setInterval(() => {
    currentHeartRate.value = 65 + Math.floor(Math.random() * 20)
    heartUpdateTime.value = dayjs().format('HH:mm')
  }, 5000)
})

onUnmounted(() => {
  clearInterval(heartTimer)
  clearInterval(alarmTimer)
  if (alarmAudioCtx.value) alarmAudioCtx.value.close()
  if (closeMenuHandler) document.removeEventListener('click', closeMenuHandler)
})
</script>

<style>
/* ====== 全局 ====== */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F0FDF4; color: #1F2937; }

.app-shell { max-width: 480px; margin: 0 auto; height: 100vh; display: flex; flex-direction: column; position: relative; background: #F0FDF4; }

/* ====== 顶部导航 ====== */
.app-header { background: #fff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 20; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.header-left { display: flex; align-items: center; gap: 8px; }
.header-logo-icon { color: #52B788; font-size: 22px; }
.header-title { font-size: 18px; font-weight: bold; }
.header-welcome { font-size: 12px; color: #6B7280; margin-left: 12px; padding-left: 12px; border-left: 1.5px solid #E5E7EB; white-space: nowrap; line-height: 1; }
.header-welcome strong { color: #52B788; }
.header-right { display: flex; align-items: center; gap: 14px; }
.notification-btn { position: relative; padding: 6px; border-radius: 50%; cursor: pointer; color: #6B7280; font-size: 18px; }
.notif-dot { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; background: #EF4444; border-radius: 50%; }
.avatar-circle { width: 36px; height: 36px; border-radius: 50%; background: #D1FAE5; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; color: #52B788; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }

/* ====== 通知面板 ====== */
.notification-panel { position: absolute; top: 60px; right: 12px; width: 300px; background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); z-index: 100; }
.notif-header { padding: 12px 16px; border-bottom: 1px solid #F3F4F6; }
.notif-header h3 { font-size: 14px; font-weight: 600; }
.notif-list { max-height: 320px; overflow-y: auto; }
.notif-item { padding: 12px 16px; display: flex; gap: 12px; cursor: pointer; }
.notif-item:hover { background: #F9FAFB; }
.notif-icon-wrapper { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notif-icon-wrapper i { font-size: 12px; }
.notif-content { flex: 1; }
.notif-title { font-size: 13px; font-weight: 500; }
.notif-desc { font-size: 12px; color: #6B7280; }
.notif-time { font-size: 11px; color: #9CA3AF; margin-top: 4px; }
.notif-footer { padding: 10px; text-align: center; border-top: 1px solid #F3F4F6; }
.notif-footer a { color: #52B788; font-size: 13px; }

/* ====== 深色模式覆盖 ====== */
[data-theme="dark"] .app-shell { background: #1a1a2e; color: #e5e7eb; }
[data-theme="dark"] .app-header { background: #16213e; border-bottom-color: #2a2a4a; }
[data-theme="dark"] .app-header { box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
[data-theme="dark"] .header-title { color: #e5e7eb; }
[data-theme="dark"] .notification-btn { color: #9CA3AF; }
[data-theme="dark"] .avatar-circle { background: #2a2a4a; color: #52B788; }
[data-theme="dark"] .notification-panel { background: #16213e; border: 1px solid #2a2a4a; }
[data-theme="dark"] .notif-header { border-bottom-color: #2a2a4a; color: #e5e7eb; }
[data-theme="dark"] .notif-item:hover { background: #1a1a2e; }
[data-theme="dark"] .notif-footer { border-top-color: #2a2a4a; }
[data-theme="dark"] .greeting { color: #e5e7eb; }
[data-theme="dark"] .date-text { color: #9CA3AF; }
[data-theme="dark"] .med-card { background: #16213e; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
[data-theme="dark"] .med-info h4 { color: #e5e7eb; }
[data-theme="dark"] .med-info p { color: #9CA3AF; }
[data-theme="dark"] .med-time { color: #e5e7eb; }
[data-theme="dark"] .health-card { background: #16213e; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
[data-theme="dark"] .health-label { color: #9CA3AF; }
[data-theme="dark"] .health-value { color: #e5e7eb; }
[data-theme="dark"] .health-unit { color: #6B7280; }
[data-theme="dark"] .chart-card { background: #16213e; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
[data-theme="dark"] .chart-title { color: #e5e7eb; }
[data-theme="dark"] .heart-card { background: #16213e; }
[data-theme="dark"] .heart-card-header h3 { color: #e5e7eb; }
[data-theme="dark"] .heart-update { color: #9CA3AF; }
[data-theme="dark"] .heart-bpm { color: #52B788; }
[data-theme="dark"] .heart-stats { color: #9CA3AF; }
[data-theme="dark"] .chart-card-full { background: #16213e; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
[data-theme="dark"] .chart-card-full h3 { color: #e5e7eb; }
[data-theme="dark"] .report-card { background: #16213e; }
[data-theme="dark"] .report-card h3 { color: #e5e7eb; }
[data-theme="dark"] .report-item { background: #2a2a4a; }
[data-theme="dark"] .report-label { color: #9CA3AF; }
[data-theme="dark"] .report-value { color: #e5e7eb; }
[data-theme="dark"] .page-topbar h2 { color: #e5e7eb; }
[data-theme="dark"] .med-item { background: #16213e; }
[data-theme="dark"] .med-item-info h3 { color: #e5e7eb; }
[data-theme="dark"] .med-item-info p { color: #9CA3AF; }
[data-theme="dark"] .setting-row-card { background: #16213e; }
[data-theme="dark"] .setting-title { color: #e5e7eb; }
[data-theme="dark"] .setting-desc { color: #9CA3AF; }
[data-theme="dark"] .profile-card { background: #16213e; }
[data-theme="dark"] .profile-card h3 { color: #e5e7eb; }
[data-theme="dark"] .profile-name { color: #e5e7eb; }
[data-theme="dark"] .profile-basic { color: #9CA3AF; }
[data-theme="dark"] .info-row { border-bottom-color: #2a2a4a; }
[data-theme="dark"] .info-label { color: #9CA3AF; }
[data-theme="dark"] .info-value { color: #e5e7eb; }
[data-theme="dark"] .setting-link { border-bottom-color: #2a2a4a; }
[data-theme="dark"] .setting-link-left span { color: #e5e7eb; }
[data-theme="dark"] .section-header h3 { color: #e5e7eb; }
[data-theme="dark"] .bottom-nav { background: #16213e; border-top-color: #2a2a4a; }
[data-theme="dark"] .modal-overlay { background: rgba(0,0,0,0.7); }
[data-theme="dark"] .modal-box { background: #16213e; }
[data-theme="dark"] .modal-topbar h3 { color: #e5e7eb; }
[data-theme="dark"] .modal-desc { color: #9CA3AF; }
[data-theme="dark"] .modal-form label { color: #9CA3AF; }
[data-theme="dark"] .modal-input { background: #1a1a2e; border-color: #2a2a4a; color: #e5e7eb; }
[data-theme="dark"] .modal-input:focus { background: #1a1a2e; }
[data-theme="dark"] .search-med-input { background: #1a1a2e; border-color: #2a2a4a; color: #e5e7eb; }
[data-theme="dark"] .search-med-input:focus { background: #1a1a2e; }
[data-theme="dark"] .common-med-card { background: #1a1a2e; border-color: #2a2a4a; }
[data-theme="dark"] .common-med-card:active { border-color: #52B788; }
[data-theme="dark"] .common-med-card .med-name { color: #e5e7eb; }
[data-theme="dark"] .selected-med-banner { background: #1a2e1a; border-color: #2a4a2a; }
[data-theme="dark"] .setting-modal-item { border-bottom-color: #2a2a4a; color: #e5e7eb; }
[data-theme="dark"] .setting-modal-item:hover { background: #1a1a2e; }
[data-theme="dark"] .bmi-table .bmi-row { background: #1a1a2e; }
[data-theme="dark"] .bmi-formula { background: #1a2e1a; color: #52B788; }
[data-theme="dark"] .faq-a { background: #1a2e1a; color: #9CA3AF; }
[data-theme="dark"] .about-desc { color: #9CA3AF; }
[data-theme="dark"] .med-dropdown { background: #16213e; border: 1px solid #2a2a4a; }
[data-theme="dark"] .dropdown-item { color: #e5e7eb; }
[data-theme="dark"] .dropdown-item:hover { background: #1a1a2e; }
[data-theme="dark"] .compliance-card { background: #1a1a2e; }
[data-theme="dark"] .btn-secondary-sm { background: transparent; }
[data-theme="dark"] .session-info { background: #1a2e1a; color: #9CA3AF; }
[data-theme="dark"] .quantity-input { border-color: #2a2a4a; }
[data-theme="dark"] .quantity-input span { color: #e5e7eb; }
[data-theme="dark"] .quantity-input button { background: #2a2a4a; color: #e5e7eb; }
[data-theme="dark"] .header-welcome { color: #9CA3AF; border-left-color: #2a2a4a; }
[data-theme="dark"] .header-welcome strong { color: #52B788; }
[data-theme="dark"] .header-right .header-icon { color: #9CA3AF; }

/* ====== 主内容 ====== */
.main-content { flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 80px; }
.page { animation: fadeIn .25s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* ====== 首页 ====== */
.welcome-section { margin-bottom: 24px; }
.greeting { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
.date-text { color: #6B7280; font-size: 14px; }
.date-highlight { color: #1F2937; font-weight: 500; }

.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.quick-card { border: none; border-radius: 12px; padding: 20px 12px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all .2s; }
.quick-card:active { transform: scale(.96); }
.quick-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; margin-bottom: 10px; }
.quick-label { font-weight: 500; font-size: 14px; }

.section-block { margin-bottom: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.section-header h3 { font-size: 18px; font-weight: bold; }
.section-more { color: #52B788; font-size: 13px; }

.med-card { background: #fff; border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.med-left { display: flex; align-items: center; gap: 12px; }
.med-icon-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; }
.med-info h4 { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
.med-info p { font-size: 12px; color: #6B7280; }
.med-right { text-align: right; }
.med-time { font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px; }

.badge { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; display: inline-block; }
.badge-green { background: #D1FAE5; color: #059669; }
.badge-yellow { background: #FEF3C7; color: #D97706; }
.badge-gray { background: #F3F4F6; color: #6B7280; }

.health-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.health-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.health-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.health-label { font-size: 12px; color: #6B7280; }
.health-card-header i { font-size: 16px; }
.health-value-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
.health-value { font-size: 24px; font-weight: bold; }
.health-unit { font-size: 12px; color: #9CA3AF; }
.health-trend { font-size: 11px; display: flex; align-items: center; gap: 3px; }

.chart-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.chart-title { font-size: 14px; font-weight: 500; margin-bottom: 10px; }
.chart-container, .chart-container-large { width: 100%; height: 180px; }
.chart-container-large { height: 280px; }
.charts-grid { display: flex; flex-direction: column; gap: 24px; margin-bottom: 16px; }
.chart-card-full { background: #fff; border-radius: 14px; padding: 20px 16px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.chart-card-full h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; padding-left: 4px; }

/* ====== 药品页 ====== */
.page-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-topbar h2 { font-size: 20px; font-weight: bold; }

.btn-primary-sm { background: linear-gradient(135deg, #52B788, #40916C); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; }
.btn-primary-sm:active { opacity: .85; }
.btn-secondary-sm { background: #fff; color: #52B788; border: 1px solid #52B788; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; }
.btn-secondary-sm:active { background: #D1FAE5; }

.med-list { display: flex; flex-direction: column; gap: 12px; }
.med-item { background: #fff; border-radius: 12px; padding: 16px; display: flex; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.med-item-img { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; }
.med-item-icon { width: 64px; height: 64px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; flex-shrink: 0; }
.med-item-info { flex: 1; margin-left: 14px; }
.med-item-info h3 { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
.med-item-info p { font-size: 13px; color: #6B7280; margin-bottom: 6px; }
.med-item-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.med-repeat { font-size: 12px; color: #9CA3AF; }
.med-more-btn { background: none; border: none; color: #6B7280; font-size: 18px; cursor: pointer; padding: 8px; }
.med-more-wrap { position: relative; }
.med-dropdown { position: absolute; right: 0; top: 100%; background: #fff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 10; min-width: 110px; overflow: hidden; }
.dropdown-item { width: 100%; padding: 10px 16px; border: none; background: none; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #374151; transition: background .1s; }
.dropdown-item:hover { background: #F9FAFB; }
.dropdown-item.danger { color: #EF4444; }
.dropdown-item.danger:hover { background: #FEF2F2; }

.empty-state { text-align: center; padding: 60px 20px; color: #9CA3AF; }
.empty-icon { font-size: 48px; margin-bottom: 12px; display: block; }

.setting-row-card { background: #fff; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.setting-title { font-weight: 500; margin-bottom: 2px; }
.setting-desc { font-size: 13px; color: #6B7280; }

.toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
.toggle-switch input { display: none; }
.toggle-track { position: absolute; inset: 0; background: #D1D5DB; border-radius: 12px; transition: .3s; }
.toggle-switch input:checked + .toggle-track { background: #52B788; }
.toggle-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: .3s; }
.toggle-switch input:checked + .toggle-track::after { transform: translateX(20px); }

/* ====== 数据页 ====== */
.heart-card { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.heart-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.heart-card-header h3 { font-size: 15px; font-weight: 600; }
.heart-update { font-size: 12px; color: #9CA3AF; }
.heart-display-area { display: flex; justify-content: center; margin-bottom: 16px; }
.heart-circle-wrapper { position: relative; width: 192px; height: 192px; }
.heart-circle-wrapper canvas { position: absolute; inset: 0; }
.heart-text-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.heart-bpm { font-size: 40px; font-weight: bold; color: #52B788; line-height: 1; }
.heart-bpm-unit { font-size: 16px; color: #6B7280; }
.heart-stats { display: flex; justify-content: center; gap: 24px; font-size: 13px; color: #6B7280; }



.report-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.report-card-header { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.report-card-header h3 { font-size: 16px; font-weight: 600; margin: 0; }
.bmi-info-btn { background: none; border: none; color: #9CA3AF; font-size: 16px; cursor: pointer; padding: 0; line-height: 1; transition: color .15s; }
.bmi-info-btn:hover { color: #52B788; }
.report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.report-item { background: #D1FAE5; border-radius: 10px; padding: 14px; text-align: center; }
.report-label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
.report-value { font-size: 18px; font-weight: bold; color: #1F2937; }

/* ====== 我的页 ====== */
.profile-header-section { text-align: center; padding: 8px 0 20px; }
.avatar-wrapper { position: relative; display: inline-block; margin-bottom: 12px; }
.avatar-large { width: 100px; height: 100px; border-radius: 50%; background: #D1FAE5; display: flex; align-items: center; justify-content: center; overflow: hidden; color: #52B788; font-size: 36px; }
.avatar-large img { width: 100%; height: 100%; object-fit: cover; }
.camera-btn { position: absolute; bottom: 0; right: 0; width: 36px; height: 36px; border-radius: 50%; background: #52B788; color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.name-row { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 4px; }
.profile-name { font-size: 18px; font-weight: bold; }
.edit-name-btn { background: none; border: none; color: #52B788; cursor: pointer; font-size: 14px; }


.profile-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.profile-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.card-title-bar { border-bottom: 1px solid #F3F4F6; margin: -16px -16px 0; padding: 16px; }
.card-title-bar h3 { margin-bottom: 0; }
.info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
.info-row:last-child { border-bottom: none; }
.info-label { color: #6B7280; font-size: 14px; }
.info-value { color: #1F2937; font-weight: 500; }

.setting-link { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #F3F4F6; cursor: pointer; }
.setting-link:last-child { border-bottom: none; }
.setting-link-left { display: flex; align-items: center; gap: 12px; }
.link-icon { width: 18px; color: #52B788; font-size: 15px; text-align: center; }
.link-arrow { color: #9CA3AF; font-size: 12px; }

/* ====== 底部导航 ====== */
.bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: #fff; display: flex; border-top: 1px solid #F3F4F6; padding: 6px 0; z-index: 20; box-shadow: 0 -2px 10px rgba(0,0,0,0.04); }
.nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 4px 0; }
.nav-item i { font-size: 18px; }
.nav-item span { font-size: 10px; }
.nav-item.active { color: #52B788; }

/* ====== 模态框 ====== */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: flex-start; justify-content: center; padding-top: 60px; }
.modal-box { background: #fff; border-radius: 16px; padding: 20px; width: 90%; max-width: 400px; max-height: 80vh; overflow-y: auto; }
.modal-sm { max-width: 340px; }
.modal-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-topbar h3 { font-size: 18px; font-weight: bold; }
.modal-close { background: none; border: none; color: #6B7280; font-size: 18px; cursor: pointer; }
.modal-desc { font-size: 14px; color: #6B7280; margin-bottom: 16px; }
.modal-form label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin: 12px 0 4px; }
.modal-input { width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; outline: none; }
.modal-input:focus { border-color: #52B788; box-shadow: 0 0 0 2px rgba(82,183,136,0.15); }
.modal-actions { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }

.camera-area { width: 100%; aspect-ratio: 1; background: #F3F4F6; border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
.camera-area img { width: 100%; height: 100%; object-fit: cover; }
.camera-actions { display: flex; gap: 10px; }

.time-slots { display: flex; flex-direction: column; gap: 8px; }
.time-slot { display: flex; align-items: center; gap: 8px; }
.time-slot .modal-input { width: auto; flex: 1; }
.del-time { background: none; border: none; color: #EF4444; cursor: pointer; }
.add-time-btn { background: none; border: none; color: #52B788; font-size: 13px; cursor: pointer; margin-top: 6px; display: flex; align-items: center; gap: 4px; }

.repeat-grid { display: flex; gap: 8px; flex-wrap: wrap; }
.repeat-day { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; background: #F3F4F6; color: #6B7280; cursor: pointer; }
.repeat-day.active { background: #52B788; color: #fff; }

.checkbox-label { display: flex !important; align-items: center; gap: 8px; cursor: pointer; margin-top: 16px !important; }
.checkbox-label input { width: 18px; height: 18px; accent-color: #52B788; }

.report-tabs { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px; }
.report-tab { padding: 6px 14px; border-radius: 20px; font-size: 13px; background: #F3F4F6; color: #6B7280; white-space: nowrap; cursor: pointer; }
.report-tab.active { background: #52B788; color: #fff; }
.score-card { background: linear-gradient(135deg, #3B82F6, #2563EB); color: #fff; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.score-left h4 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
.score-badge { background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); padding: 6px 14px; border-radius: 8px; font-size: 20px; font-weight: bold; }
.progress-bar-wrap { height: 8px; background: rgba(59,130,246,0.15); border-radius: 4px; overflow: hidden; margin-bottom: 4px; }
.progress-fill { height: 100%; background: #fff; border-radius: 4px; }
.report-chart-box { width: 100%; height: 220px; margin: 16px 0; }
.compliance-card { background: #F9FAFB; border-radius: 12px; padding: 16px; }
.compliance-card p:first-child { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.compliance-bar { height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
.compliance-bar div { height: 100%; background: #10B981; border-radius: 4px; }

.device-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
.device-item:last-child { border-bottom: none; }
.device-left { display: flex; align-items: center; gap: 12px; }
.device-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.btn-link { background: none; border: none; color: #52B788; font-weight: 500; cursor: pointer; font-size: 13px; }

.avatar-preview { text-align: center; margin-bottom: 16px; }
.avatar-preview .avatar-large { margin: 0 auto; }

.mr-1 { margin-right: 4px; }

/* 账号管理 */
.session-info { display: flex; align-items: center; gap: 8px; margin: 20px 0 12px; padding: 10px 14px; background: #F0FDF4; border-radius: 8px; font-size: 13px; color: #374151; }
.session-info i { color: #52B788; }
.logout-btn { width: 100%; padding: 12px; background: #FEF2F2; color: #EF4444; border: 1px solid #FECACA; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; }
.logout-btn:active { background: #FEE2E2; }
.save-account-btn { width: 100%; padding: 12px; background: #F0FDF4; color: #059669; border: 1px solid #A7F3D0; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.save-account-btn:active { background: #D1FAE5; }
.field-error { font-size: 12px; color: #EF4444; margin: -6px 0 8px; padding-left: 2px; }
.field-success { font-size: 14px; color: #059669; font-weight: 500; }

/* ====== BMI说明弹窗 ====== */
.bmi-modal-body { font-size: 14px; color: #374151; }
.bmi-formula { text-align: center; background: #F0FDF4; padding: 12px; border-radius: 10px; font-weight: 600; color: #059669; margin-bottom: 16px; font-size: 15px; }
.bmi-table { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.bmi-row { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #F9FAFB; border-radius: 8px; }
.bmi-label { width: 40px; font-weight: 500; }
.bmi-range { flex: 1; color: #6B7280; font-size: 13px; }
.bmi-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.bmi-tip { display: flex; gap: 8px; padding: 12px; background: #FEF3C7; border-radius: 10px; font-size: 12px; color: #92400E; line-height: 1.5; }
.bmi-tip i { flex-shrink: 0; margin-top: 1px; font-size: 14px; }

/* ====== 用药提醒闹钟 ====== */
@keyframes ring { 0%,100% { transform:rotate(0deg) } 25% { transform:rotate(15deg) } 75% { transform:rotate(-15deg) } }
.alarm-icon-wrap { margin: 8px 0 16px; }
.alarm-ring { font-size: 56px; color: #EF4444; animation: ring .5s ease-in-out infinite; }
.alarm-title { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
.alarm-med-name { font-size: 18px; font-weight: 600; color: #1F2937; margin-bottom: 4px; }
.alarm-med-info { font-size: 14px; color: #6B7280; margin-bottom: 24px; }
.alarm-actions { display: flex; flex-direction: column; gap: 10px; }
.alarm-btn { padding: 12px; border-radius: 10px; border: none; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity .15s; }
.alarm-btn:active { opacity: .8; }
.alarm-btn.primary { background: linear-gradient(135deg,#52B788,#40916C); color: #fff; }
.alarm-btn.warning { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
.alarm-btn.secondary { background: #F3F4F6; color: #6B7280; }

/* ====== 通用设置弹窗 ====== */
.setting-modal-body { display: flex; flex-direction: column; gap: 2px; }
.setting-modal-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 12px; border-bottom: 1px solid #F3F4F6; font-size: 14px; color: #374151; cursor: pointer; transition: background .1s; }
.setting-modal-item:hover { background: #F9FAFB; }
.setting-modal-item:last-child { border-bottom: none; }
.setting-modal-item i { font-size: 16px; transition: color .2s; }
.action-item { flex-direction: column; align-items: stretch; gap: 2px; }
.action-label { font-weight: 500; }
.action-desc { font-size: 12px; color: #9CA3AF; }
.faq-item { flex-direction: column; align-items: stretch; gap: 6px; }
.faq-q { display: flex; justify-content: space-between; align-items: center; }
.faq-a { font-size: 13px; color: #6B7280; line-height: 1.6; padding: 8px 12px; background: #F0FDF4; border-radius: 8px; margin-top: 4px; }
.about-section { text-align: center; padding: 24px 12px; }
.about-icon { font-size: 48px; color: #52B788; display: block; margin-bottom: 12px; }
.about-section h3 { font-size: 18px; font-weight: bold; margin: 0 0 8px; }
.about-desc { font-size: 14px; color: #6B7280; margin: 0 0 16px; line-height: 1.6; }
.about-copy { font-size: 12px; color: #9CA3AF; margin: 0; }

/* ====== 添加药品 ====== */
.add-med-modal { max-height: 85vh; }
.search-med-wrap { position: relative; margin-bottom: 16px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9CA3AF; z-index: 1; }
.search-med-input { width: 100%; padding: 12px 14px 12px 38px; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 14px; outline: none; background: #F9FAFB; box-sizing: border-box; }
.search-med-input:focus { border-color: #52B788; background: #fff; }
.common-med-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 300px; overflow-y: auto; }
.common-med-card { background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 12px; cursor: pointer; transition: all .15s; display: flex; flex-direction: column; gap: 4px; }
.common-med-card:active { border-color: #52B788; background: #F0FDF4; }
.med-form-badge { font-size: 10px; background: #D1FAE5; color: #059669; padding: 1px 8px; border-radius: 6px; align-self: flex-start; }
.med-name { font-size: 13px; font-weight: 600; }
.med-dosage-preview { font-size: 11px; color: #6B7280; }
.selected-med-banner { background: #F0FDF4; border: 1.5px solid #A7F3D0; border-radius: 10px; padding: 12px; margin-bottom: 16px; font-size: 14px; }
.selected-med-banner i { color: #52B788; }
.selected-med-banner .form-badge { font-size: 11px; background: #52B788; color: #fff; padding: 1px 10px; border-radius: 8px; margin-left: 8px; display: inline-block; }
.age-tip { font-size: 12px; color: #6B7280; margin-top: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.age-tip i { font-size: 11px; }
.child-tip { color: #F59E0B; font-weight: 600; }
.adult-tip { color: #52B788; font-weight: 600; }
.form-row { display: flex; gap: 12px; }
.form-half { flex: 1; }
.quantity-input { display: flex; align-items: center; gap: 8px; justify-content: center; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 6px; }
.quantity-input button { width: 32px; height: 32px; border-radius: 50%; border: none; background: #F3F4F6; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #374151; }
.quantity-input button:active { background: #E5E7EB; }
.quantity-input span { font-size: 16px; font-weight: 600; min-width: 36px; text-align: center; }

/* ====== 药品识别弹窗 ====== */
.med-recog-modal { min-height: 420px; }
.recog-upload-box { border: 2px dashed #D1D5DB; border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; transition: all .2s; margin: 0 0 12px; background: #FAFAFA; }
.recog-upload-box:active { border-color: #52B788; background: #F0FDF4; }
.recog-upload-placeholder i { font-size: 48px; color: #9CA3AF; display: block; margin-bottom: 8px; }
.recog-upload-placeholder p { font-size: 15px; color: #6B7280; margin: 0 0 4px; }
.recog-upload-placeholder span { font-size: 12px; color: #9CA3AF; }
.recog-preview-img { width: 100%; max-height: 200px; object-fit: contain; border-radius: 10px; }
.recog-actions { display: flex; gap: 10px; }
/* 扫描动画 */
.recog-scanning { text-align: center; padding: 30px 10px; }
.scan-animation-wrap { position: relative; width: 100px; height: 100px; margin: 0 auto 20px; }
.scan-circle { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg,#52B788,#40916C); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; }
.scan-circle i { font-size: 40px; color: #fff; }
.scan-ring-1, .scan-ring-2 { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); border-radius: 50%; border: 3px solid #52B788; }
.scan-ring-1 { width: 120px; height: 120px; animation: scan-pulse 1.5s ease-out infinite; }
.scan-ring-2 { width: 140px; height: 140px; animation: scan-pulse 1.5s ease-out infinite 0.5s; }
@keyframes scan-pulse { 0% { opacity: 0.6; transform: translate(-50%,-50%) scale(0.8); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(1.3); } }
.scan-status { font-size: 16px; font-weight: 600; color: #1F2937; margin-bottom: 16px; }
.scan-progress-track { height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; margin: 0 auto; max-width: 240px; }
.scan-progress-fill { height: 100%; background: linear-gradient(90deg,#52B788,#40916C); border-radius: 4px; transition: width .1s linear; }
.scan-percent { font-size: 22px; font-weight: bold; color: #52B788; margin: 10px 0 4px; }
.scan-hint { font-size: 12px; color: #9CA3AF; }
/* 识别结果 */
.recog-result-success { text-align: center; padding: 8px 0 12px; }
.recog-success-icon i { font-size: 40px; color: #52B788; }
.recog-result-success h4 { font-size: 16px; color: #1F2937; margin: 4px 0 0; }
.recog-result-card { background: #F9FAFB; border-radius: 14px; padding: 16px; border: 1px solid #E5E7EB; }
.recog-result-top { display: flex; gap: 14px; margin-bottom: 14px; }
.recog-result-img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex-shrink: 0; }
.recog-result-info { flex: 1; min-width: 0; }
.recog-drug-name { font-size: 17px; font-weight: 700; color: #1F2937; margin: 0 0 6px; }
.recog-result-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.recog-result-details { border-top: 1px solid #E5E7EB; padding-top: 12px; }
.recog-detail-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 0; gap: 12px; }
.recog-detail-label { font-size: 12px; color: #9CA3AF; white-space: nowrap; min-width: 64px; }
.recog-detail-label i { margin-right: 4px; width: 14px; text-align: center; }
.recog-detail-value { font-size: 13px; color: #374151; text-align: right; flex: 1; }
/* 快速体验 */
.recog-demo { margin-top: 16px; padding-top: 14px; border-top: 1px solid #F3F4F6; }
.recog-demo-label { font-size: 12px; color: #9CA3AF; margin-bottom: 10px; }
.recog-demo-label i { color: #F59E0B; margin-right: 4px; }
.recog-demo-grid { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.recog-demo-grid::-webkit-scrollbar { height: 8px; }
.recog-demo-grid::-webkit-scrollbar-thumb { background: #52B788; border-radius: 4px; }
.recog-demo-grid::-webkit-scrollbar-track { background: #F0FDF4; border-radius: 4px; }
.recog-demo-item { flex-shrink: 0; width: 86px; text-align: center; cursor: pointer; transition: transform .15s; }
.recog-demo-item:active { transform: scale(0.92); }
.recog-demo-item img { width: 68px; height: 68px; border-radius: 10px; object-fit: cover; border: 2px solid #E5E7EB; background: #fff; display: block; margin: 0 auto 4px; }
.recog-demo-item span { font-size: 10px; color: #6B7280; display: block; line-height: 1.2; }
</style>
