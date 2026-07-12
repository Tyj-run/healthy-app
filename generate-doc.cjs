const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopPosition, TabStopType, convertInchesToTwip
} = require('docx');

// ===== 颜色和样式常量 =====
const COLORS = {
  primary:       '1a73e8',
  secondary:     '34a853',
  accent:        'ea4335',
  dark:          '202124',
  gray:          '5f6368',
  lightGray:     'f8f9fa',
  borderGray:    'dadce0',
  tableHeaderBg: '1a73e8',
  white:         'ffffff',
  orange:        'fbbc04',
  purple:        '7c3aed',
};

// ===== 辅助函数 =====
function heading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 32 : 28, color: COLORS.dark })],
  });
}

function heading1(text) { return heading(text, HeadingLevel.HEADING_1); }
function heading2(text) { return heading(text, HeadingLevel.HEADING_2); }
function heading3(text) { return heading(text, HeadingLevel.HEADING_3); }

function para(text, options = {}) {
  const runs = [];
  if (typeof text === 'string') {
    runs.push(new TextRun({ text, size: 24, color: COLORS.dark, ...options }));
  } else if (Array.isArray(text)) {
    text.forEach(t => {
      if (typeof t === 'string') runs.push(new TextRun({ text: t, size: 24, color: COLORS.dark }));
      else runs.push(new TextRun({ size: 24, color: COLORS.dark, ...t }));
    });
  }
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 360 },
    children: runs,
    ...options,
  });
}

function bullet(text, indent = 0) {
  return new Paragraph({
    spacing: { before: 40, after: 40, line: 320 },
    indent: { left: indent * 600 + 400 },
    bullet: { level: indent },
    children: [new TextRun({ text, size: 24, color: COLORS.dark })],
  });
}

function boldBullet(boldPart, normalPart, indent = 0) {
  return new Paragraph({
    spacing: { before: 40, after: 40, line: 320 },
    indent: { left: indent * 600 + 400 },
    bullet: { level: indent },
    children: [
      new TextRun({ text: boldPart, bold: true, size: 24, color: COLORS.dark }),
      new TextRun({ text: normalPart, size: 24, color: COLORS.dark }),
    ],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { before: 0, after: 0 }, children: [] });
}

// ===== 表格辅助 =====
const tableBorder = {
  top:   { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray },
  bottom:{ style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray },
  left:  { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray },
  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray },
};

function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.SOLID, color: COLORS.tableHeaderBg, fill: COLORS.tableHeaderBg },
    borders: tableBorder,
    children: [new Paragraph({
      spacing: { before: 40, after: 40 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 22, color: COLORS.white })],
    })],
  });
}

function dataCell(text, width, options = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: options.shading ? { type: ShadingType.SOLID, color: options.shading, fill: options.shading } : undefined,
    borders: tableBorder,
    children: [new Paragraph({
      spacing: { before: 30, after: 30 },
      alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: String(text), size: 21, color: COLORS.dark, bold: options.bold })],
    })],
  });
}

// ===== 分隔线 =====
function separator() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.primary, space: 1 },
    },
    children: [],
  });
}

// ===== 代码块 =====
function codeBlock(lines) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 400 },
    shading: { type: ShadingType.SOLID, color: COLORS.lightGray, fill: COLORS.lightGray },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.primary, space: 8 },
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray, space: 8 },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray, space: 8 },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray, space: 8 },
    },
    children: lines.map(line =>
      new TextRun({
        text: typeof line === 'string' ? line : line.text,
        font: 'Consolas',
        size: 18,
        color: typeof line === 'object' && line.color ? line.color : COLORS.dark,
        bold: typeof line === 'object' && line.bold || false,
        break: 1,
      })
    ),
  });
}

// ===== QA 块 =====
function qaBlock(q, a) {
  const aParts = [
    new TextRun({ text: 'A：', bold: true, size: 24, color: COLORS.secondary }),
  ];
  if (typeof a === 'string') {
    aParts.push(new TextRun({ text: a, size: 24, color: COLORS.dark }));
  } else if (Array.isArray(a)) {
    const text = a.map(item =>
      typeof item === 'string' ? item : (item.text || '')
    ).join('');
    aParts.push(new TextRun({ text, size: 24, color: COLORS.dark }));
  }
  return new Paragraph({
    spacing: { before: 40, after: 120, line: 360 },
    indent: { left: 200 },
    shading: { type: ShadingType.SOLID, color: COLORS.lightGray, fill: COLORS.lightGray },
    children: [
      new TextRun({ text: 'Q：', bold: true, size: 24, color: COLORS.accent }),
      new TextRun({ text: q, bold: true, size: 24, color: COLORS.dark }),
      new TextRun({ text: '\n', break: 1 }),
      ...aParts,
    ],
  });
}

// ===== 封面 =====
function createCover() {
  return [
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: '🏥', size: 96 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: '健康管家', size: 72, bold: true, color: COLORS.primary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: '答辩备战手册', size: 48, bold: true, color: COLORS.gray })],
    }),
    separator(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: 'Vue 3 前端大作业 · 技术详解与答辩指南', size: 28, color: COLORS.gray })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: '涵盖：Vue 3 / Vite / Vue Router 4 / Pinia / Ant Design Vue / ECharts', size: 24, color: COLORS.gray })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: '共预设 ', size: 24, color: COLORS.gray }),
        new TextRun({ text: '15', size: 28, bold: true, color: COLORS.accent }),
        new TextRun({ text: ' 个高频答辩问题及详细答案', size: 24, color: COLORS.gray }),
      ],
    }),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [new TextRun({ text: '2026 年 7 月', size: 24, color: COLORS.gray })],
    }),
  ];
}

// ===== 第一章：技术栈总览 =====
function createChapter1() {
  return [
    heading1('一、项目整体技术栈总览'),
    para('本项目的技术选型如下表所示：'),
    emptyLine(),

    // 技术栈表格
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('技术', 25), headerCell('用途', 55), headerCell('版本', 20)] }),
        new TableRow({ children: [dataCell('Vue 3', 25, { bold: true }), dataCell('核心框架（Composition API + <script setup>）', 55), dataCell('^3.4.21', 20, { center: true })] }),
        new TableRow({ children: [dataCell('Vite', 25, { bold: true, shading: COLORS.lightGray }), dataCell('构建工具 / 开发服务器', 55, { shading: COLORS.lightGray }), dataCell('^5.2.0', 20, { center: true, shading: COLORS.lightGray })] }),
        new TableRow({ children: [dataCell('Vue Router 4', 25, { bold: true }), dataCell('前端路由（SPA 页面跳转）', 55), dataCell('^4.3.0', 20, { center: true })] }),
        new TableRow({ children: [dataCell('Pinia', 25, { bold: true, shading: COLORS.lightGray }), dataCell('全局状态管理（替代 Vuex）', 55, { shading: COLORS.lightGray }), dataCell('^2.1.7', 20, { center: true, shading: COLORS.lightGray })] }),
        new TableRow({ children: [dataCell('Ant Design Vue 4', 25, { bold: true }), dataCell('UI 组件库（按钮、表格、表单等）', 55), dataCell('^4.2.1', 20, { center: true })] }),
        new TableRow({ children: [dataCell('ECharts', 25, { bold: true, shading: COLORS.lightGray }), dataCell('数据可视化图表', 55, { shading: COLORS.lightGray }), dataCell('^6.1.0', 20, { center: true, shading: COLORS.lightGray })] }),
        new TableRow({ children: [dataCell('dayjs', 25, { bold: true }), dataCell('轻量日期处理库', 55), dataCell('^1.11.10', 20, { center: true })] }),
        new TableRow({ children: [dataCell('localStorage', 25, { bold: true, shading: COLORS.lightGray }), dataCell('浏览器本地持久化存储', 55, { shading: COLORS.lightGray }), dataCell('浏览器原生 API', 20, { center: true, shading: COLORS.lightGray })] }),
      ],
    }),
    para('老师最可能问的就是这个表中的每一项，要确保每一项你都知道"用来干什么"。'),
  ];
}

// ===== 第二章：逐项技术详解 =====
function createChapter2() {
  return [
    heading1('二、逐项技术详解（答辩时这么说）'),
    separator(),

    // 2.1 Vue 3
    heading2('2.1 Vue 3 框架'),
    heading3('核心概念'),
    bullet('声明式渲染：你只需要在 <template> 里写 HTML 模板，数据变了页面自动更新，不需要手动操作 DOM。'),
    bullet('组件化：每个页面（Login.vue、Dashboard.vue 等）都是一个独立的 .vue 文件，包含模板、脚本、样式三合一。'),
    bullet('响应式系统：ref() 和 reactive() 让普通变量变成"响应式"——变了就会触发界面重绘。'),
    heading3('项目中的体现'),
    codeBlock([
      { text: '<script setup>', color: '#1a73e8' },
      { text: 'import { ref } from "vue"', color: '#5f6368' },
      { text: 'const username = ref("")   // 响应式数据' },
      { text: '</script>', color: '#1a73e8' },
    ]),
    para('用户输入用户名 → username 的值变化 → 页面上绑定了 v-model="username" 的输入框自动显示新值。'),
    heading3('为什么用 Vue 3 而不是 Vue 2？'),
    bullet('Vue 3 性能更好（虚拟 DOM 重写，PatchFlag 优化）'),
    bullet('Composition API（setup / ref / computed / watch）比 Options API（data / methods）更灵活'),
    bullet('TypeScript 支持更好，内置类型推导'),
    bullet('长远来看 Vue 3 是主流，官方已停止对 Vue 2 的更新维护'),

    // 2.2 Vite
    heading2('2.2 Vite — 构建工具'),
    para('Vite 就是"帮你跑项目"的工具。你执行 npm run dev，它就会：'),
    bullet('启动一个开发服务器（本项目端口 3000）'),
    bullet('你改了代码，它秒级热更新（HMR），浏览器立刻刷新'),
    bullet('npm run build 把项目打包成最终上线用的静态文件'),
    heading3('项目配置'),
    codeBlock([
      { text: 'export default defineConfig({', color: '#5f6368' },
      { text: '  plugins: [vue()],                // 让 Vite 认识 .vue 文件' },
      { text: '  resolve: { alias: { "@": path } }, // @ 代表 src/ 目录' },
      { text: '  server: { port: 3000, open: true } // 自动打开浏览器' },
      { text: '})', color: '#5f6368' },
    ]),
    heading3('和 Webpack 的区别（高频考题）'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('对比维度', 33), headerCell('Vite', 33), headerCell('Webpack', 34)] }),
        new TableRow({ children: [dataCell('开发启动速度', 33, { bold: true }), dataCell('秒级（按需编译）', 33), dataCell('慢（全部打包）', 34)] }),
        new TableRow({ children: [dataCell('热更新', 33, { bold: true, shading: COLORS.lightGray }), dataCell('模块级，毫秒级响应', 33, { shading: COLORS.lightGray }), dataCell('文件级，缓慢', 34, { shading: COLORS.lightGray })] }),
        new TableRow({ children: [dataCell('底层机制', 33, { bold: true }), dataCell('ES Modules 原生加载', 33), dataCell('CommonJS + 打包', 34)] }),
        new TableRow({ children: [dataCell('配置复杂度', 33, { bold: true, shading: COLORS.lightGray }), dataCell('简洁，开箱即用', 33, { shading: COLORS.lightGray }), dataCell('复杂，需大量配置', 34, { shading: COLORS.lightGray })] }),
      ],
    }),

    // 2.3 Vue Router
    heading2('2.3 Vue Router 4 — 路由'),
    para('单页应用（SPA）的页面导航：传统网站点击链接会刷新页面，SPA 在同一个页面内切换不同组件，不需要真正刷新。'),
    heading3('项目的路由表'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('路径', 30), headerCell('对应页面', 40), headerCell('需要登录', 30)] }),
        new TableRow({ children: [dataCell('/login', 30), dataCell('Login.vue', 40), dataCell('❌', 30, { center: true })] }),
        new TableRow({ children: [dataCell('/', 30, { shading: COLORS.lightGray }), dataCell('AppShell + 子路由', 40, { shading: COLORS.lightGray }), dataCell('✅', 30, { center: true, shading: COLORS.lightGray })] }),
        new TableRow({ children: [dataCell('其他路径', 30), dataCell('重定向到 /login', 40), dataCell('—', 30, { center: true })] }),
      ],
    }),
    heading3('核心代码：路由守卫'),
    codeBlock([
      { text: 'router.beforeEach((to, from, next) => {', color: '#5f6368' },
      { text: '  const token = localStorage.getItem("token")' },
      { text: '  // 需要登录但没 token → 踢回登录页' },
      { text: '  if (to.meta.requiresAuth !== false && !token) {' },
      { text: '    return next("/login")' },
      { text: '  }' },
      { text: '  next()' },
      { text: '})', color: '#5f6368' },
    ]),
    heading3('老师可能会问'),
    boldBullet('如果登录过期了怎么办？', '我们检查了 expiresAt，过期自动清理 token 并跳回登录页。'),
    boldBullet('路由懒加载怎么实现的？', '使用 component: () => import("@/views/xxx.vue") 按需加载，减少首屏体积。'),

    // 2.4 Pinia
    heading2('2.4 Pinia — 状态管理'),
    para('多个页面之间要"共享数据"。例如用户登录后，首页和个人中心都要显示用户名，不能用各自存一份的方式，而要用 Pinia 这个"全局仓库"统一管理。'),
    heading3('项目中的 Store'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Store 文件', 25), headerCell('管理什么数据', 50), headerCell('持久化', 25)] }),
        new TableRow({ children: [dataCell('auth.js', 25, { bold: true }), dataCell('登录状态、用户信息、token、过期时间', 50), dataCell('localStorage', 25, { center: true })] }),
        new TableRow({ children: [dataCell('health.js', 25, { bold: true, shading: COLORS.lightGray }), dataCell('心率/血糖/睡眠/步数等健康指标', 50, { shading: COLORS.lightGray }), dataCell('localStorage', 25, { center: true, shading: COLORS.lightGray })] }),
        new TableRow({ children: [dataCell('heartRate.js', 25, { bold: true }), dataCell('心率历史记录（增删改查）', 50), dataCell('localStorage', 25, { center: true })] }),
        new TableRow({ children: [dataCell('sleep.js', 25, { bold: true, shading: COLORS.lightGray }), dataCell('睡眠记录（增删改查）', 50, { shading: COLORS.lightGray }), dataCell('localStorage', 25, { center: true, shading: COLORS.lightGray })] }),
        new TableRow({ children: [dataCell('medicine.js', 25, { bold: true }), dataCell('药品列表（增删改查）', 50), dataCell('localStorage', 25, { center: true })] }),
        new TableRow({ children: [dataCell('profile.js', 25, { bold: true, shading: COLORS.lightGray }), dataCell('个人信息（姓名、身高体重等）', 50, { shading: COLORS.lightGray }), dataCell('localStorage', 25, { center: true, shading: COLORS.lightGray })] }),
        new TableRow({ children: [dataCell('notification.js', 25, { bold: true }), dataCell('通知消息', 50), dataCell('内存', 25, { center: true })] }),
      ],
    }),
    heading3('核心模式'),
    codeBlock([
      { text: 'export const useHeartRateStore = defineStore("heartRate", () => {', color: '#5f6368' },
      { text: '  const records = ref([])       // 数据' },
      { text: '  const loading = ref(false)   // 加载状态' },
      { text: '' },
      { text: '  function addRecord(data) {    // 操作', color: '#34a853' },
      { text: '    records.value.unshift({ id: nextId, ...data })' },
      { text: '    persist()' },
      { text: '  }' },
      { text: '' },
      { text: '  function persist() {          // 自动保存到 localStorage', color: '#34a853' },
      { text: '    localStorage.setItem("health_heartRateRecords",' },
      { text: '      JSON.stringify(records.value))' },
      { text: '  }' },
      { text: '' },
      { text: '  return { records, loading, addRecord, ... }' },
      { text: '})', color: '#5f6368' },
    ]),
    heading3('和 Vuex 的区别（高频考题）'),
    bullet('Pinia 更轻量、API 更简洁（没有 mutations、getters 等概念，直接用函数）'),
    bullet('Pinia 完整支持 TypeScript'),
    bullet('官方推荐 Pinia 作为 Vue 3 的状态管理方案'),

    // 2.5 Ant Design Vue
    heading2('2.5 Ant Design Vue — UI 组件库'),
    para('"别人帮你写好的美观组件"——你不用自己手写按钮、表格、弹窗、菜单的样式和交互。'),
    heading3('项目中用到的组件'),
    boldBullet('布局类：', 'a-layout / a-layout-sider / a-layout-header → 页面布局结构'),
    boldBullet('导航类：', 'a-menu / a-menu-item → 侧边栏导航'),
    boldBullet('基础组件：', 'a-button / a-tag / a-badge → 按钮、标签、徽标'),
    boldBullet('数据展示：', 'a-table / a-form / a-modal → 表格、表单、弹窗'),
    boldBullet('输入类：', 'a-input / a-select / a-date-picker / a-slider → 输入控件'),
    boldBullet('其他：', 'a-avatar / a-dropdown / a-breadcrumb → 头像、下拉菜单、面包屑'),

    // 2.6 ECharts
    heading2('2.6 ECharts — 数据可视化图表'),
    para('把数字变成折线图、柱状图，让人一看就懂。'),
    heading3('项目中的图表'),
    bullet('首页 Dashboard：血糖趋势折线图（7 天数据）'),
    bullet('健康数据 DataCharts：心率趋势折线图 + 睡眠时长柱状图'),
    heading3('核心代码模式'),
    codeBlock([
      { text: 'import VChart from "vue-echarts"', color: '#5f6368' },
      { text: 'import { use } from "echarts/core"', color: '#5f6368' },
      { text: 'import { CanvasRenderer } from "echarts/renderers"' },
      { text: 'import { LineChart } from "echarts/charts"' },
      { text: 'import { GridComponent, TooltipComponent } from "echarts/components"' },
      { text: '' },
      { text: 'use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])' },
      { text: '' },
      { text: 'const option = {', color: '#1a73e8' },
      { text: '  xAxis: { type: "category", data: ["周一","周二",...] },' },
      { text: '  yAxis: { type: "value", min: 60, max: 90 },' },
      { text: '  series: [{ data: [72, 75, ...], type: "line", smooth: true }],' },
      { text: '  tooltip: { trigger: "axis" },' },
      { text: '}', color: '#1a73e8' },
    ]),
    para('为什么要用 use() 按需注册？→ 减少打包体积，只引入需要的图表类型和渲染器，而不是全部导入。'),

    // 2.7 dayjs
    heading2('2.7 dayjs — 日期处理'),
    codeBlock([
      { text: 'dayjs().format("YYYY-MM-DD")              // → "2026-07-12"' },
      { text: 'dayjs().format("YYYY年M月D日 dddd")       // → "2026年7月12日 星期日"' },
      { text: 'dayjs("2026-07-11").isBefore("2026-07-12") // → true' },
    ]),
    para('比 Moment.js 轻量很多（2KB vs 200KB），API 基本一致。'),

    // 2.8 localStorage
    heading2('2.8 localStorage — 浏览器本地存储'),
    para('浏览器的"小本本"，关了页面再打开数据还在。我们用它来保存用户数据，这样页面刷新不会丢失。'),
    heading3('项目中统一模式'),
    codeBlock([
      { text: 'const STORAGE_KEY = "health_heartRateRecords"' },
      { text: 'const DEFAULTS = [...]   // 示例数据' },
      { text: '' },
      { text: 'function loadFromStorage() {', color: '#34a853' },
      { text: '  const saved = localStorage.getItem(STORAGE_KEY)' },
      { text: '  return saved ? JSON.parse(saved) : null', color: '#5f6368' },
      { text: '}' },
      { text: '' },
      { text: 'function saveToStorage(data) {', color: '#34a853' },
      { text: '  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))' },
      { text: '}' },
      { text: '' },
      { text: 'const records = ref(loadFromStorage() || [...DEFAULTS])' },
      { text: 'function persist() { saveToStorage(records.value) }', color: '#ea4335' },
    ]),
    heading3('localStorage 的特点（老师可能会问）'),
    bullet('容量：一般 5MB 左右'),
    bullet('作用域：按域名隔离，不同网站不能互相读取'),
    bullet('同步操作：读写都是同步的，简单场景够用'),
    bullet('只存字符串：存对象必须 JSON.stringify()，读出来要 JSON.parse()'),
    bullet('注意：不能存敏感信息，明文存储没有加密'),
    heading3('和 sessionStorage 的区别'),
    boldBullet('localStorage：', '永久保存，除非手动清除'),
    boldBullet('sessionStorage：', '关闭标签页就清空'),
  ];
}

// ===== 第三章：项目数据流总结 =====
function createChapter3() {
  return [
    heading1('三、项目数据流总结'),
    para('以下是整个项目的数据流转过程，是面试时展示"架构理解"的关键：'),
    separator(),
    new Paragraph({ spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: '用户操作（点击、输入）', size: 26, bold: true, color: COLORS.accent }),
    ]}),
    new Paragraph({ spacing: { before: 0, after: 0 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: '         ⬇', size: 28, color: COLORS.gray }),
    ]}),
    new Paragraph({ spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'Vue 组件（.vue 文件）', size: 26, bold: true, color: COLORS.primary }),
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [
      new TextRun({ text: '  模板层 <template>  ·  脚本层 <script setup>  ·  样式层 <style>', size: 22, color: COLORS.gray }),
    ]}),
    new Paragraph({ spacing: { before: 30, after: 30 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: '         ⬇', size: 28, color: COLORS.gray }),
    ]}),
    new Paragraph({ spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'Pinia Store → 更新内存数据 → UI 自动更新', size: 26, bold: true, color: COLORS.secondary }),
    ]}),
    new Paragraph({ spacing: { before: 30, after: 30 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: '         ⬇', size: 28, color: COLORS.gray }),
    ]}),
    new Paragraph({ spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'localStorage → 数据持久化 → 刷新后恢复', size: 26, bold: true, color: COLORS.orange }),
    ]}),
    separator(),
    para('一句话总结：用户操作 → 组件响应 → Pinia 更新状态 → 视图自动重绘 → localStorage 保存数据。'),
  ];
}

// ===== 第四章：高频答辩问题 =====
function createChapter4() {
  return [
    heading1('四、常见答辩问题（预设答案）'),
    para('以下是答辩中最可能被问到的 15 个问题，每个都附上了可以直接说出来的回答。'),
    separator(),

    // Q1
    heading2('基础类问题'),
    qaBlock(
      '为什么选择 Vue 3 而不是 React？',
      '因为本课程是前端课程，Vue 3 是课程重点。Vue 上手门槛低，对初学者友好，模板语法直观；且 Vue 3 的 Composition API 让代码组织更灵活。Vue 在国内企业中使用广泛（阿里、字节跳动都有大量 Vue 项目），学习 Vue 有很好的就业前景。'
    ),

    qaBlock(
      'Vue 2 和 Vue 3 的主要区别？',
      [
        { text: '1. 响应式原理：', bold: true }, 'Vue 2 用 Object.defineProperty，Vue 3 用 Proxy，性能更好且能监听到数组下标修改和新增属性。\n',
        { text: '2. API 风格：', bold: true }, 'Vue 2 是 Options API（data/methods/computed 分开写），Vue 3 推荐 Composition API（按功能组织代码，逻辑复用更简单）。\n',
        { text: '3. 体积更小：', bold: true }, 'Tree-shaking 支持更好，没用到的功能不会打包。\n',
        { text: '4. TypeScript 支持：', bold: true }, 'Vue 3 的源码本身就是用 TypeScript 重写的。'
      ]
    ),

    qaBlock(
      '什么是 SPA（单页应用）？有什么优缺点？',
      'SPA 是 Single Page Application 的缩写，整个应用只有一个 HTML 页面，通过前端路由动态切换显示不同组件。\n\n优点：页面切换流畅（不需要刷新），用户体验好；前后端分离，开发效率高。\n\n缺点：首屏加载较慢（需要先下载 JS）；SEO 不友好；浏览器需要支持 JavaScript。'
    ),

    // 路由类
    heading2('路由类问题'),
    qaBlock(
      '路由守卫（导航守卫）的作用？项目中如何使用？',
      '路由守卫是 Vue Router 提供的拦截机制，在路由跳转前/后执行特定逻辑。本项目在 router.beforeEach 中做登录校验：如果用户要去需要登录的页面但没有 token，就重定向到登录页；如果已登录的用户访问登录页，自动跳到首页。此外还设置了每个页面的标题。'
    ),

    qaBlock(
      '什么是路由懒加载？为什么用？',
      '路由懒加载是通过动态导入（() => import("@/views/xxx.vue")）实现的，只有用户访问某个页面时才加载对应的 JS 文件。这样可以减少首屏加载的体积，提升首次打开速度。如果不用懒加载，整个应用的所有页面代码都会打包成一个巨大的 JS 文件。'
    ),

    // 状态管理类
    heading2('状态管理类问题'),
    qaBlock(
      'Pinia 和 Vuex 有什么区别？为什么选 Pinia？',
      'Pinia 是 Vue 官方推荐的新一代状态管理库。区别：\n\n1. Pinia 没有 mutations，直接在 actions 里写逻辑，代码更少\n2. Pinia 完整支持 TypeScript\n3. API 更简洁，不需要 mapState、mapActions 辅助函数\n4. 体积更小（约 1KB）\n5. 本项目作为新项目，当然选择官方推荐的新方案'
    ),

    qaBlock(
      '为什么需要状态管理？不用行不行？',
      '如果只是单个组件内部用，确实不需要。但本项目中多个页面都需要访问同一份数据，比如登录信息（auth）、健康记录（heartRate/sleep）。如果不做状态管理，就要通过 props 层层传递（太麻烦），或者每个页面各自从 localStorage 读取（数据不一致）。Pinia 提供了一个统一的"数据仓库"，所有页面共享同一份数据，数据变更后所有页面同步更新。'
    ),

    qaBlock(
      '为什么选择 Pinia 的组合式 API（setup store）而不是选项式？',
      '组合式 API 更灵活，可以像编写普通函数一样编写 store 逻辑，同时能方便地组合多个 store（在一个 store 中调用另一个 store）。而且和使用 Composition API 的组件风格一致，降低了学习成本。'
    ),

    // 数据持久化类
    heading2('数据持久化类问题'),
    qaBlock(
      '为什么选择 localStorage 而不是数据库？',
      '本项目是一个前端课程项目，目标是展示 Vue 技术栈的能力，没有涉及后端开发。localStorage 是浏览器原生提供的本地存储方案，零依赖、零配置，对于个人健康管理这种数据量小、安全性要求不高的场景完全够用。如果需要真正的后端存储，可以后续接入 MySQL 或 SQLite + 后端 API。'
    ),

    qaBlock(
      '数据刷新后怎么恢复的？',
      '每个 Store 初始化时会从 localStorage 读取之前保存的数据，如果读取到有效数据就使用它，否则使用预设的默认示例数据。每次用户增删改数据后，都会调用 persist() 函数同步写入 localStorage。这样就实现了"刷新不丢失"的效果。'
    ),

    // 具体功能类
    heading2('具体功能类问题'),
    qaBlock(
      '药品提醒功能是怎么实现的？',
      '药品页面支持添加药品、设置提醒时间（每天几点吃）、选择重复周期（工作日/每天）。提醒设置保存在 localStorage 中。首页的"今日用药提醒"模块会根据当前时间，计算出哪些药品到了该吃的时间。不过完整的推送通知需要 Notification API 或 Service Worker 支持，目前我们做了数据层面的展示——用户访问首页时能看到待服用的药品列表。'
    ),

    qaBlock(
      '图表数据是静态的还是动态的？',
      '目前心率趋势图和睡眠时长图使用的是预设示例数据，但代码结构已经支持动态展示——只要把 Pinia store 中的真实记录数据传给 ECharts 的 option，图表就会实时更新。这也是后续可以优化的方向。'
    ),

    qaBlock(
      '移动端适配是怎么做的？',
      '通过 CSS 媒体查询（@media (max-width: 768px)），在手机端隐藏桌面侧边栏，底部显示一个固定的 Tab 导航栏，包含首页、睡眠、心率、数据、我的五个入口。内容区域自动调整间距和 padding。Ant Design Vue 的组件本身也支持响应式，比如 a-row 的 gutter 和 a-col 的 span 属性。'
    ),

    qaBlock(
      '登录功能其实没有后端，怎么回答？',
      '我们采用了"模拟登录"的方式。前端校验用户名和密码（比如 admin/admin123），登录成功后在 localStorage 中存入 token 和过期时间。这展示了完整的前端认证流程设计：路由守卫、过期检测、自动跳转。如果有后端，只需要把校验逻辑替换为 API 请求即可。'
    ),

    // 项目拓展类
    heading2('项目拓展类问题'),
    qaBlock(
      '这个项目还有什么可以改进的地方？',
      '1. 接入后端 API：目前数据存在 localStorage，可以做真正的后端存储和用户登录注册\n2. 消息推送：用药提醒可以用浏览器 Notification API 做推送通知\n3. 数据同步：支持多设备间数据同步\n4. 更丰富的图表：加入更多维度的健康分析图表\n5. 单元测试：为 Store 和组件编写测试用例，提高代码质量'
    ),

    qaBlock(
      '项目中遇到的最大困难是什么？怎么解决的？',
      '数据持久化是最初遇到的问题。最开始心率和睡眠记录是纯内存数据，一刷新就丢了。后来参考了药品管理的实现模式，给每个 Store 增加了 localStorage 的读写逻辑，并添加了 loadFromStorage、persist() 辅助函数，实现了"增删改自动保存、初始化自动恢复"的效果。'
    ),

    qaBlock(
      '你在项目中负责了哪些部分？',
      '参与了全部开发：页面布局设计、路由配置、状态管理（Pinia Store 的搭建）、数据持久化（localStorage 同步）、ECharts 图表集成、响应式适配、以及各页面功能的编码实现。'
    ),
  ];
}

// ===== 第五章：核心代码片段 =====
function createChapter5() {
  return [
    heading1('五、核心代码片段（必须记住）'),
    para('以下代码片段是答辩时可能被要求解释的，务必理解每一行在做什么。'),
    separator(),

    heading2('5.1 应用入口 — main.js'),
    codeBlock([
      { text: 'import { createApp } from "vue"', color: '#5f6368' },
      { text: 'import { createPinia } from "pinia"', color: '#5f6368' },
      { text: 'import Antd from "ant-design-vue"', color: '#5f6368' },
      { text: 'import "ant-design-vue/dist/reset.css"' },
      { text: 'import App from "./App.vue"', color: '#5f6368' },
      { text: 'import router from "./router"', color: '#5f6368' },
      { text: '' },
      { text: 'const app = createApp(App)' },
      { text: 'app.use(createPinia())     // 注册 Pinia', color: '#34a853' },
      { text: 'app.use(router)            // 注册路由', color: '#34a853' },
      { text: 'app.use(Antd)              // 注册 UI 库', color: '#34a853' },
      { text: 'app.mount("#app")          // 挂载到 index.html 中的 #app' },
    ]),
    para('这是项目的启动入口。可以看到 Vue 应用的"三件套"：状态管理（Pinia）、路由（Router）、UI 库（Antd）。'),

    heading2('5.2 路由守卫'),
    codeBlock([
      { text: 'router.beforeEach((to, from, next) => {', color: '#5f6368' },
      { text: '  const token = localStorage.getItem("token")' },
      { text: '  const expiresAt = localStorage.getItem("expiresAt")' },
      { text: '  const expired = expiresAt && Date.now() > parseInt(expiresAt)' },
      { text: '  const loggedIn = !!token && !expired' },
      { text: '' },
      { text: '  // 需要登录但没登录 → 踢回登录页', color: '#5f6368' },
      { text: '  if (to.meta.requiresAuth !== false && !loggedIn) {' },
      { text: '    localStorage.removeItem("token")' },
      { text: '    return next("/login")' },
      { text: '  }' },
      { text: '' },
      { text: '  // 已登录用户访问登录页 → 跳回首页', color: '#5f6368' },
      { text: '  if (to.path === "/login" && loggedIn) return next("/")' },
      { text: '' },
      { text: '  // 设置页面标题', color: '#5f6368' },
      { text: '  if (to.meta.title) document.title = to.meta.title + " - 健康管家"' },
      { text: '  next()' },
      { text: '})', color: '#5f6368' },
    ]),
    para('路由守卫的逻辑链：①检查是否有 token→②检查是否过期→③未登录则跳转登录页→④已登录访问登录页则跳首页→⑤设置页面标题。'),

    heading2('5.3 Pinia Store 标准模式'),
    codeBlock([
      { text: 'const STORAGE_KEY = "health_sleepRecords"' },
      { text: 'const DEFAULTS = [...]   // 预设示例数据' },
      { text: '' },
      { text: 'function loadFromStorage() {', color: '#34a853' },
      { text: '  const saved = localStorage.getItem(STORAGE_KEY)' },
      { text: '  if (saved) {' },
      { text: '    const parsed = JSON.parse(saved)' },
      { text: '    if (Array.isArray(parsed) && parsed.length > 0) return parsed' },
      { text: '  }' },
      { text: '  return null' },
      { text: '}' },
      { text: '' },
      { text: 'function saveToStorage(data) {', color: '#34a853' },
      { text: '  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))' },
      { text: '}' },
      { text: '' },
      { text: 'export const useSleepStore = defineStore("sleep", () => {', color: '#5f6368' },
      { text: '  const saved = loadFromStorage()' },
      { text: '  const records = ref(saved || [...DEFAULTS])' },
      { text: '' },
      { text: '  function persist() { saveToStorage(records.value) }' },
      { text: '' },
      { text: '  function addRecord(record) {   // 增', color: '#1a73e8' },
      { text: '    records.value.unshift({ id: nextId, ...record })' },
      { text: '    persist()' },
      { text: '  }' },
      { text: '  function updateRecord(id, data) { // 改', color: '#fbbc04' },
      { text: '    // 查找 → 更新 → persist' },
      { text: '  }' },
      { text: '  function deleteRecord(id) {     // 删', color: '#ea4335' },
      { text: '    records.value = records.value.filter(r => r.id !== id)' },
      { text: '    persist()' },
      { text: '  }' },
      { text: '' },
      { text: '  return { records, addRecord, updateRecord, deleteRecord }' },
      { text: '})', color: '#5f6368' },
    ]),
    para('这是所有 Store 的统一模板：初始化从 localStorage 读取 → 操作后调用 persist() 同步 → 实现 CRUD + 持久化。'),
  ];
}

// ===== 第六章：答辩话术 =====
function createChapter6() {
  return [
    heading1('六、答辩话术模板'),
    para('以下是可以直接背下来的答辩发言，适当调整使自然流畅即可。'),
    separator(),

    heading2('自我介绍'),
    new Paragraph({
      spacing: { before: 80, after: 80, line: 360 },
      indent: { left: 400 },
      shading: { type: ShadingType.SOLID, color: COLORS.lightGray, fill: COLORS.lightGray },
      border: {
        left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.primary, space: 8 },
      },
      children: [
        new TextRun({
          text: '各位老师好，我本次大作业的项目是《健康管家》，一款基于 Vue 3 生态的健康管理 SPA 应用。项目采用 Vue 3 + Vite + Vue Router + Pinia 作为核心框架，使用 Ant Design Vue 作为 UI 组件库，用 ECharts 做数据可视化，结合 localStorage 实现数据的本地持久化存储。',
          size: 24, color: COLORS.dark,
        }),
      ],
    }),

    heading2('项目功能介绍'),
    new Paragraph({
      spacing: { before: 80, after: 80, line: 360 },
      indent: { left: 400 },
      shading: { type: ShadingType.SOLID, color: COLORS.lightGray, fill: COLORS.lightGray },
      border: {
        left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.primary, space: 8 },
      },
      children: [
        new TextRun({
          text: '项目主要包含以下模块：\n1. 登录模块：模拟登录，支持 token 过期管理\n2. 首页：展示今日用药提醒、健康数据概览、血糖趋势图表\n3. 睡眠分析：记录和管理每日睡眠数据，支持筛选\n4. 心率趋势：记录和查看心率变化，支持按日期/数值筛选\n5. 药品管理：增删改查药品，设置服药提醒\n6. 健康数据：心率/睡眠可视化图表展示\n7. 个人中心：个人信息管理',
          size: 24, color: COLORS.dark,
        }),
      ],
    }),

    heading2('结尾'),
    new Paragraph({
      spacing: { before: 80, after: 80, line: 360 },
      indent: { left: 400 },
      shading: { type: ShadingType.SOLID, color: COLORS.lightGray, fill: COLORS.lightGray },
      border: {
        left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.primary, space: 8 },
      },
      children: [
        new TextRun({
          text: '以上就是我的项目介绍，感谢各位老师的聆听，欢迎批评指正。',
          size: 24, color: COLORS.dark,
        }),
      ],
    }),
  ];
}

// ===== 组装文档 =====
async function main() {
  const doc = new Document({
    title: '健康管家 - 答辩备战手册',
    description: 'Vue 3 前端大作业技术详解与答辩指南',
    creator: 'AI Assistant',
    styles: {
      default: {
        document: {
          run: { font: 'Microsoft YaHei', size: 24, color: COLORS.dark },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1.2) },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: '健康管家 · 答辩备战手册', size: 18, color: COLORS.gray })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '第 ', size: 18, color: COLORS.gray }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLORS.gray }),
                new TextRun({ text: ' 页', size: 18, color: COLORS.gray }),
              ],
            })],
          }),
        },
        children: [
          ...createCover(),
          new Paragraph({ children: [new PageBreak()] }),

          // 目录页
          heading1('目  录'),
          separator(),
          bullet('一、项目整体技术栈总览'),
          bullet('二、逐项技术详解（答辩时这么说）'),
          bullet('三、项目数据流总结'),
          bullet('四、常见答辩问题（预设答案）'),
          bullet('五、核心代码片段（必须记住）'),
          bullet('六、答辩话术模板'),
          new Paragraph({ children: [new PageBreak()] }),

          ...createChapter1(),
          new Paragraph({ children: [new PageBreak()] }),
          ...createChapter2(),
          new Paragraph({ children: [new PageBreak()] }),
          ...createChapter3(),
          new Paragraph({ children: [new PageBreak()] }),
          ...createChapter4(),
          new Paragraph({ children: [new PageBreak()] }),
          ...createChapter5(),
          new Paragraph({ children: [new PageBreak()] }),
          ...createChapter6(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = 'c:/Users/Lenovo/Desktop/health-app/答辩备战手册.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ 文档已生成：' + outputPath);
}

main().catch(console.error);
