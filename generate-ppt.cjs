const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10" × 5.625"
pres.title = '健康管家 - 答辩演示';
pres.author = '答辩人';

const COLORS = {
  primary: "2C5F2D",
  secondary: "52B788",
  accent: "97BC62",
  dark: "1A1A2E",
  light: "F5F5F5",
  white: "FFFFFF",
  text: "2D3748",
  muted: "718096",
  cardBg: "FFFFFF",
};

function addCard(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill || COLORS.cardBg },
    shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.08 }
  });
}

// ========== 第1页：封面 ==========
let slide1 = pres.addSlide();
slide1.background = { color: COLORS.dark };

slide1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.12, fill: { color: COLORS.secondary }
});

slide1.addText("健康管家", {
  x: 0.5, y: 1.8, w: 9, h: 1.0,
  fontSize: 56, fontFace: "Arial Black", bold: true,
  color: COLORS.white, align: "center", margin: 0
});

slide1.addText("基于 Vue 3 的移动端个人健康管理应用", {
  x: 0.5, y: 3.0, w: 9, h: 0.5,
  fontSize: 20, fontFace: "Arial",
  color: COLORS.accent, align: "center", margin: 0
});

slide1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 4.7, w: 10, h: 0.925,
  fill: { color: "0F3460", transparency: 50 }
});

slide1.addText("答辩演示", {
  x: 0.5, y: 4.85, w: 4, h: 0.45,
  fontSize: 18, fontFace: "Arial", bold: true,
  color: COLORS.white, align: "left", valign: "middle", margin: 0
});

slide1.addText("2026年7月", {
  x: 5.5, y: 4.85, w: 4, h: 0.45,
  fontSize: 16, fontFace: "Arial",
  color: COLORS.accent, align: "right", valign: "middle", margin: 0
});

// ========== 第2页：目录 ==========
let slide2 = pres.addSlide();
slide2.background = { color: COLORS.light };

slide2.addText("目 录", {
  x: 0.5, y: 0.25, w: 9, h: 0.7,
  fontSize: 36, fontFace: "Arial Black", bold: true,
  color: COLORS.primary, align: "left", margin: 0
});

slide2.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.88, w: 1.5, h: 0.05, fill: { color: COLORS.secondary }
});

const tocItems = [
  { num: "01", title: "项目概述", desc: "背景与目标" },
  { num: "02", title: "技术架构", desc: "Vue 3 + Pinia + ECharts" },
  { num: "03", title: "核心功能", desc: "用药 / 数据 / 个人中心" },
  { num: "04", title: "界面展示", desc: "运行截图与说明" },
  { num: "05", title: "技术亮点", desc: "路由守卫 / 持久化 / 语音" },
  { num: "06", title: "总结展望", desc: "成果与未来方向" }
];

const tocPositions = [
  [0.5, 1.3], [3.5, 1.3], [6.5, 1.3],
  [0.5, 3.0], [3.5, 3.0], [6.5, 3.0]
];

tocItems.forEach((item, i) => {
  const [x, y] = tocPositions[i];

  slide2.addShape(pres.shapes.OVAL, {
    x: x, y: y, w: 0.55, h: 0.55, fill: { color: COLORS.secondary }
  });
  slide2.addText(item.num, {
    x: x, y: y + 0.07, w: 0.55, h: 0.38,
    fontSize: 18, fontFace: "Arial", bold: true,
    color: COLORS.white, align: "center", valign: "middle", margin: 0
  });

  slide2.addText(item.title, {
    x: x + 0.75, y: y, w: 2.2, h: 0.3,
    fontSize: 20, fontFace: "Arial", bold: true,
    color: COLORS.text, align: "left", valign: "middle", margin: 0
  });

  slide2.addText(item.desc, {
    x: x + 0.75, y: y + 0.3, w: 2.2, h: 0.25,
    fontSize: 13, fontFace: "Arial",
    color: COLORS.muted, align: "left", valign: "top", margin: 0
  });
});

// ========== 第3页：项目概述（纯文字，无底部条） ==========
let slide3 = pres.addSlide();
slide3.background = { color: COLORS.light };

slide3.addText("01 项目概述", {
  x: 0.5, y: 0.25, w: 9, h: 0.7,
  fontSize: 36, fontFace: "Arial Black", bold: true,
  color: COLORS.primary, align: "left", margin: 0
});
slide3.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.88, w: 1.5, h: 0.05, fill: { color: COLORS.secondary }
});

// 左列：项目背景
slide3.addText("项目背景", {
  x: 0.5, y: 1.15, w: 4.5, h: 0.4,
  fontSize: 20, fontFace: "Arial", bold: true,
  color: COLORS.text, align: "left", margin: 0
});

slide3.addText([
  { text: "随着人口老龄化加剧，慢性病患者需要长期规律用药", options: { bullet: true, breakLine: true } },
  { text: "传统手动记录方式存在数据易丢失、提醒不及时等问题", options: { bullet: true, breakLine: true } },
  { text: "亟需一款便捷、可视化的个人健康管理工具", options: { bullet: true } }
], {
  x: 0.5, y: 1.55, w: 4.5, h: 1.5,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.text, align: "left", lineSpacing: 22, margin: 0
});

// 左列：项目目标（与背景间距加大）
slide3.addText("项目目标", {
  x: 0.5, y: 3.2, w: 4.5, h: 0.4,
  fontSize: 20, fontFace: "Arial", bold: true,
  color: COLORS.text, align: "left", margin: 0
});

slide3.addText([
  { text: "用药管理与智能提醒", options: { bullet: true, breakLine: true } },
  { text: "健康指标监测与可视化", options: { bullet: true, breakLine: true } },
  { text: "个人资料管理与数据持久化", options: { bullet: true } }
], {
  x: 0.5, y: 3.6, w: 4.5, h: 1.2,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.text, align: "left", lineSpacing: 22, margin: 0
});

// 右侧截图占位（高度加大到 3.8，底部到 5.0）
addCard(slide3, 5.2, 1.15, 4.3, 3.8, COLORS.white);
slide3.addText("[此处插入应用首页截图]", {
  x: 5.2, y: 2.8, w: 4.3, h: 0.5,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.muted, align: "center", valign: "middle", margin: 0
});

// ========== 第4页：技术架构（截图为主，文字精简） ==========
let slide4 = pres.addSlide();
slide4.background = { color: COLORS.light };

slide4.addText("02 技术架构", {
  x: 0.5, y: 0.25, w: 9, h: 0.7,
  fontSize: 36, fontFace: "Arial Black", bold: true,
  color: COLORS.primary, align: "left", margin: 0
});
slide4.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.88, w: 1.5, h: 0.05, fill: { color: COLORS.secondary }
});

// 技术栈卡片（5个横向排列）
const techStack = [
  { name: "Vue 3", desc: "Composition API", color: COLORS.secondary },
  { name: "Vite 5", desc: "构建工具", color: "3B82F6" },
  { name: "Pinia", desc: "状态管理", color: "F59E0B" },
  { name: "Vue Router", desc: "路由管理", color: "8B5CF6" },
  { name: "Ant Design Vue", desc: "UI 组件库", color: "EF4444" }
];

const techX = [0.5, 2.3, 4.1, 5.9, 7.7];
techStack.forEach((tech, i) => {
  addCard(slide4, techX[i], 1.1, 1.6, 1.5, COLORS.white);

  slide4.addShape(pres.shapes.RECTANGLE, {
    x: techX[i], y: 1.1, w: 1.6, h: 0.42, fill: { color: tech.color }
  });

  slide4.addText(tech.name, {
    x: techX[i], y: 1.14, w: 1.6, h: 0.36,
    fontSize: 15, fontFace: "Arial", bold: true,
    color: COLORS.white, align: "center", valign: "middle", margin: 0
  });

  slide4.addText(tech.desc, {
    x: techX[i], y: 1.6, w: 1.6, h: 0.8,
    fontSize: 12, fontFace: "Arial",
    color: COLORS.muted, align: "center", valign: "middle", margin: 0
  });
});

// 左下：项目结构截图占位
addCard(slide4, 0.5, 2.9, 4.5, 2.5, COLORS.white);
slide4.addText("[项目结构截图]", {
  x: 0.5, y: 3.9, w: 4.5, h: 0.5,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.muted, align: "center", valign: "middle", margin: 0
});

// 右下：核心代码截图占位
addCard(slide4, 5.2, 2.9, 4.3, 2.5, COLORS.white);
slide4.addText("[核心代码截图]", {
  x: 5.2, y: 3.9, w: 4.3, h: 0.5,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.muted, align: "center", valign: "middle", margin: 0
});

// ========== 第5页：核心功能 - 用药管理 ==========
let slide5 = pres.addSlide();
slide5.background = { color: COLORS.light };

slide5.addText("03 核心功能 — 用药管理", {
  x: 0.5, y: 0.25, w: 9, h: 0.7,
  fontSize: 36, fontFace: "Arial Black", bold: true,
  color: COLORS.primary, align: "left", margin: 0
});
slide5.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.88, w: 2.5, h: 0.05, fill: { color: COLORS.secondary }
});

// 左侧功能列表
slide5.addText("功能特性", {
  x: 0.5, y: 1.15, w: 4.5, h: 0.4,
  fontSize: 20, fontFace: "Arial", bold: true,
  color: COLORS.text, align: "left", margin: 0
});

slide5.addText([
  { text: "常见药品库选择（含儿童/成人剂量智能提示）", options: { bullet: true, breakLine: true } },
  { text: "手动输入药品，支持多种剂型（片剂/胶囊等）", options: { bullet: true, breakLine: true } },
  { text: "多时间点提醒配置，重复周期（周一至周日）", options: { bullet: true, breakLine: true } },
  { text: "语音提醒开关，Web Audio API 合成提示音", options: { bullet: true, breakLine: true } },
  { text: "CRUD 完整支持，localStorage 持久化", options: { bullet: true } }
], {
  x: 0.5, y: 1.55, w: 4.5, h: 2.2,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.text, align: "left", lineSpacing: 22, margin: 0
});

// 右侧截图占位（高度 3.8）
addCard(slide5, 5.2, 1.15, 4.3, 3.8, COLORS.white);
slide5.addText("[此处插入药品管理页截图]", {
  x: 5.2, y: 2.8, w: 4.3, h: 0.5,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.muted, align: "center", valign: "middle", margin: 0
});

// ========== 第6页：核心功能 - 数据可视化 ==========
let slide6 = pres.addSlide();
slide6.background = { color: COLORS.light };

slide6.addText("03 核心功能 — 数据可视化", {
  x: 0.5, y: 0.25, w: 9, h: 0.7,
  fontSize: 36, fontFace: "Arial Black", bold: true,
  color: COLORS.primary, align: "left", margin: 0
});
slide6.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.88, w: 2.5, h: 0.05, fill: { color: COLORS.secondary }
});

slide6.addText("功能特性", {
  x: 0.5, y: 1.15, w: 4.5, h: 0.4,
  fontSize: 20, fontFace: "Arial", bold: true,
  color: COLORS.text, align: "left", margin: 0
});

slide6.addText([
  { text: "实时心率 Canvas 圆环动画展示", options: { bullet: true, breakLine: true } },
  { text: "ECharts 绘制心率趋势折线图（过去7天）", options: { bullet: true, breakLine: true } },
  { text: "睡眠时长柱状图，横纵坐标合理安排", options: { bullet: true, breakLine: true } },
  { text: "BMI 动态计算（依据身高体重）+ 分类说明", options: { bullet: true, breakLine: true } },
  { text: "健康评分、用药完成率综合报告", options: { bullet: true } }
], {
  x: 0.5, y: 1.55, w: 4.5, h: 2.2,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.text, align: "left", lineSpacing: 22, margin: 0
});

addCard(slide6, 5.2, 1.15, 4.3, 3.8, COLORS.white);
slide6.addText("[此处插入数据图表页截图]", {
  x: 5.2, y: 2.8, w: 4.3, h: 0.5,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.muted, align: "center", valign: "middle", margin: 0
});

// ========== 第7页：界面展示 - 登录与个人中心 ==========
let slide7 = pres.addSlide();
slide7.background = { color: COLORS.light };

slide7.addText("04 界面展示 — 登录与个人中心", {
  x: 0.5, y: 0.25, w: 9, h: 0.7,
  fontSize: 36, fontFace: "Arial Black", bold: true,
  color: COLORS.primary, align: "left", margin: 0
});
slide7.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.88, w: 3.5, h: 0.05, fill: { color: COLORS.secondary }
});

// 左图
addCard(slide7, 0.5, 1.15, 4.3, 3.8, COLORS.white);
slide7.addText("[登录页截图]", {
  x: 0.5, y: 2.8, w: 4.3, h: 0.5,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.muted, align: "center", valign: "middle", margin: 0
});

// 右图
addCard(slide7, 5.2, 1.15, 4.3, 3.8, COLORS.white);
slide7.addText("[个人中心页截图]", {
  x: 5.2, y: 2.8, w: 4.3, h: 0.5,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.muted, align: "center", valign: "middle", margin: 0
});

// 底部说明（简洁，不重叠）
slide7.addText("豆绿色渐变登录页 · 3分钟有效期 · 动态倒计时\n头像上传 · Canvas 圆形裁剪 · 姓名编辑 · BMI 动态计算", {
  x: 0.5, y: 5.05, w: 9, h: 0.45,
  fontSize: 13, fontFace: "Arial",
  color: COLORS.muted, align: "center", valign: "middle", margin: 0
});

// ========== 第8页：技术亮点（2x2卡片，间距加大） ==========
let slide8 = pres.addSlide();
slide8.background = { color: COLORS.light };

slide8.addText("05 技术亮点", {
  x: 0.5, y: 0.25, w: 9, h: 0.7,
  fontSize: 36, fontFace: "Arial Black", bold: true,
  color: COLORS.primary, align: "left", margin: 0
});
slide8.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.88, w: 1.5, h: 0.05, fill: { color: COLORS.secondary }
});

const highlights = [
  {
    title: "路由守卫",
    points: ["直接从 localStorage 读取 token", "不依赖 Pinia 内存状态", "刷新后守卫依然可靠", "未登录强制跳转登录页"]
  },
  {
    title: "数据持久化",
    points: ["所有数据写入 localStorage", "刷新/关闭浏览器不丢失", "多 Store 独立管理", "异常时自动回退默认值"]
  },
  {
    title: "实时倒计时",
    points: ["ref + setInterval 每秒更新", "避免 computed 缓存问题", "到期弹出提示不突兀退出", "登录态自动清理"]
  },
  {
    title: "语音播报",
    points: ["Web Audio API 合成提示音", "SpeechSynthesis 语音播报", "无需外部音频文件", "用药闹钟准时触发"]
  }
];

const hlPositions = [[0.5, 1.15], [5.2, 1.15], [0.5, 3.05], [5.2, 3.05]];

highlights.forEach((hl, i) => {
  const [x, y] = hlPositions[i];
  addCard(slide8, x, y, 4.3, 1.7, COLORS.white);

  slide8.addShape(pres.shapes.RECTANGLE, {
    x: x, y: y, w: 4.3, h: 0.3, fill: { color: COLORS.secondary }
  });

  slide8.addText(hl.title, {
    x: x + 0.15, y: y + 0.02, w: 4, h: 0.26,
    fontSize: 15, fontFace: "Arial", bold: true,
    color: COLORS.white, align: "left", valign: "middle", margin: 0
  });

  slide8.addText(hl.points.map(p => ({ text: p, options: { bullet: true, breakLine: true } })), {
    x: x + 0.15, y: y + 0.4, w: 4, h: 1.2,
    fontSize: 12, fontFace: "Arial",
    color: COLORS.text, align: "left", lineSpacing: 20, margin: 0
  });
});

// ========== 第9页：总结与展望 ==========
let slide9 = pres.addSlide();
slide9.background = { color: COLORS.dark };

slide9.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.12, fill: { color: COLORS.secondary }
});

slide9.addText("06 总结与展望", {
  x: 0.5, y: 0.45, w: 9, h: 0.7,
  fontSize: 36, fontFace: "Arial Black", bold: true,
  color: COLORS.white, align: "left", margin: 0
});

// 成果总结
slide9.addText("项目成果", {
  x: 0.5, y: 1.35, w: 4.5, h: 0.4,
  fontSize: 20, fontFace: "Arial", bold: true,
  color: COLORS.accent, align: "left", margin: 0
});

slide9.addText([
  { text: "完成移动端健康管理应用全部功能", options: { bullet: true, breakLine: true } },
  { text: "实现用药 CRUD + 智能提醒 + 语音播报", options: { bullet: true, breakLine: true } },
  { text: "数据可视化：心率/睡眠/血糖图表", options: { bullet: true, breakLine: true } },
  { text: "完整的前端技术栈实践（Vue 3 全家桶）", options: { bullet: true } }
], {
  x: 0.5, y: 1.75, w: 4.5, h: 1.6,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.white, align: "left", lineSpacing: 22, margin: 0
});

// 未来方向
slide9.addText("未来方向", {
  x: 5.2, y: 1.35, w: 4.5, h: 0.4,
  fontSize: 20, fontFace: "Arial", bold: true,
  color: COLORS.accent, align: "left", margin: 0
});

slide9.addText([
  { text: "接入后端 API，实现云端数据同步", options: { bullet: true, breakLine: true } },
  { text: "增加更多健康指标（血压、血氧等）", options: { bullet: true, breakLine: true } },
  { text: "AI 智能用药建议与异常预警", options: { bullet: true, breakLine: true } },
  { text: "多端适配（小程序 / App）", options: { bullet: true } }
], {
  x: 5.2, y: 1.75, w: 4.5, h: 1.6,
  fontSize: 14, fontFace: "Arial",
  color: COLORS.white, align: "left", lineSpacing: 22, margin: 0
});

// 底部感谢
slide9.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 4.0, w: 10, h: 1.625,
  fill: { color: "0F3460", transparency: 50 }
});

slide9.addText("感谢聆听", {
  x: 0.5, y: 4.15, w: 9, h: 0.6,
  fontSize: 32, fontFace: "Arial Black", bold: true,
  color: COLORS.white, align: "center", margin: 0
});

slide9.addText("欢迎提问", {
  x: 0.5, y: 4.75, w: 9, h: 0.4,
  fontSize: 18, fontFace: "Arial",
  color: COLORS.accent, align: "center", margin: 0
});

// ========== 保存 ==========
pres.writeFile({ fileName: "健康管家-答辩演示.pptx" })
  .then(() => console.log("PPT 已生成: 健康管家-答辩演示.pptx"))
  .catch(err => console.error("生成失败:", err.message));
