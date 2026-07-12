# 🎓 中考数理化英全科智能特训复习平台 (EXAM) 项目核心备忘录

本文件放置在项目根目录下。**当您重新开启一个新的 AI 助手对话时，请直接将本文件（`PROJECT_STATE.md`）导入或发给 AI 助手**，AI 即可在 1 秒内完全掌握项目当前的架构、技术细节、核心账户以及所有已解决的 Bug，避免重复开发与信息丢失。

---

## 📅 项目最新基本信息与配置

* **技术栈**：React 18 + Vite 8 + JavaScript (ES6) + Vanilla CSS。
* **本地开发**：`npm run dev` 启动本地调试服务器。
* **生产编译**：`npm run build` 输出 `dist` 静态资源目录。
* **部署配置 (`vite.config.js`)**：
  * `base: './'`（相对路径基准）。支持 Vercel 根目录部署，同时支持 **GitHub Pages** 的二级子路径 `/EXAM/` 部署，防止 css/js 发生 404 资源丢失。
* **国内直连 Pages 部署脚本**：
  编译并强制推送 `dist` 目录至远程 GitHub Pages 分支：
  ```bash
  npm run build && git add -f dist && git commit -m "deploy: release" && git push origin `git subtree split --prefix dist main`:refs/heads/gh-pages --force && git reset HEAD~1
  ```
  👉 **GitHub Pages 国内直连免梯子秒开网址**：[https://chichimon14.github.io/EXAM/](https://chichimon14.github.io/EXAM/)

---

## 👤 系统账号与权限配置

在 [SubjectPortal.jsx](file:///Users/julian/antigravity/exam/src/components/SubjectPortal.jsx) 中控制登录：
1. **学生账号**：用户名 `doudou`，密码 `doudou`（用于复习答题、背词、收集错题、获得金币）。
2. **管理员账号**：用户名 `admin`，密码 `admin`（登录后展现「⚙️ 豆豆的学习 Dashboard」监控大盘，无法做题，只能进行教学监督）。

---

## ☁️ 多端云同步系统与日志追踪机制

* **底层云数据库 (syncService.js)**：
  * 接管了原生 `window.localStorage.setItem` 与 `removeItem` 代理层，在本地数据写入变动时，通过 800ms 防抖静默触发 `POST` 网络请求异步备份至 `https://kvdb.io/...` 远程公共 KV 数据库。
  * **云同步白名单键**：
    * 积分及学习日志：`exam-study-logs` (日志)、`total-gold-coins` (金币)。
    * 物理：`physics-answers`、`physics-submissions`、`physics-wrongs`、`physics-score-*`。
    * 化学：`chemistry-score`、`chemistry-progress`、`chemistry-wrong-questions`。
    * 数学：`math-score`、`math-answers`、`math-wrongs`。
    * 英语：`english-score-*`、`english-unfamiliar-words`、`english-mastered-words`、`english-wrongs`。
* **日志写入 API**：
  ```javascript
  import { addStudyLog } from '../utils/syncService';
  addStudyLog(subject, action, detail, score, total, weaknesses);
  ```
  在数理化答题交卷、英语开启跟读和测验交卷时自动打点，记录孩子的学习时间轴。

---

## 📈 家长监控 Dashboard 功能模块

管理员登录 `admin` 后，可随时调用宽屏毛玻璃 Dashboard：
1. **✨ 学习概览看板**：显示金币数、错题总量、答题活跃度，以及四科当前积分/进度。
2. **🕒 学习时间线**：按天/小时展现孩子的答题、背词时间段、正确率及考点漏洞。
3. **🔍 知识点漏洞库**：按出错频次统计错题考点，对 $\ge 2$ 次的出错点发出 `⚠️ 高危漏洞` 警报。
4. **💡 名师温习建议**：针对高危漏洞（如化合价、折射等）智能匹配专属名师复习口诀。
5. **📝 错题细节穿透**：分科目直接调取错题的题干、孩子的写错答案、正确答案与官方深度解析。

---

## 📚 四大学科核心交互与题库算法

1. **数学 (`MathModule.jsx`) & 物理 (`PhysicsModule.jsx`)**：
   * 支持重点考点公式指导、手绘原理图解画廊、大型交互式虚拟实验室。
   * 支持 20 题测试基础闯关，自动计分结算。
2. **化学 (`ChemistryModule.jsx`)**：
   * 支持中考高频化合价“消消乐”卡片配对游戏。
   * 支持 10 题课后小测与 100 题每日狂练。
3. **英语 (`EnglishModule.jsx`)**：
   * **英语 20 题小测重构**：
     * **前 15 题**：`type: 'match'` 4组中英文单词/短语连线配对消除题。支持两两点击配对、正确淡化绿色 ✅ 锁定、配错触发容器**轻微抖动红闪动效**（累计连错记入错题本）。
     * **后 5 题**：`type: 'choice'` 核心中考语法单选题。
   * **名师美音真人发音**：有道公开 TTS API 与原生 Web Speech 完美自动兜底，支持中英“三遍跟读”自动流转及视口自动平滑居中。

---

## 🛠️ 历史已解决的核心 Bug 与架构优化 (非常重要)

若后续开发中页面出现重叠或无法滑动，请遵循以下已验证的成熟方案：

1. **iPad 窄屏/竖屏胶囊按钮重叠 Bug**：
   * *起因*：顶部导航栏胶囊组之前使用 `position: absolute`，导致页面宽度收缩时直接覆盖在居中标题上。
   * *解决*：移除绝对定位，重构为 **Flex 弹性响应式顶栏**（左侧徽章，右侧胶囊组，`flex-wrap: wrap` 自动折行），完美消除重叠。
2. **测试卡片做到一半“下一题按钮消失” Bug**：
   * *起因*：`.glass-card` 的全局 CSS 样式设置了 `overflow: hidden`。当题目很长或出现长段“名师点拨”解析时，下一题按钮被挤出卡片下方直接被裁剪隐藏，且页面无法滚动。
   * *解决*：在 **物理、数学、化学、英语** 四大学科 20 题测试卡片（`glass-card`）上，均添加了行内样式 `overflowY: 'auto'`。现在超出高度会自动产生内部滚动条，划拉即可滑出底部按钮。
3. **英语词汇题卡死崩溃 Bug**：
   * *起因*：`questionGenerator.js` 中没有导入 `englishVocabList`，导致读取 `undefined` 的 `slice` 发生 JS 崩溃。
   * *解决*：在 `questionGenerator.js` 头部正确追加了 `import { englishVocabList } from '../data/englishData.js';`。
