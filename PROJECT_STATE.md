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
  👉 **GitHub Pages 免梯子秒开网址**：[https://chichimon14.github.io/EXAM/](https://chichimon14.github.io/EXAM/)

---

## 👤 系统账号与默认会话配置

在 [SubjectPortal.jsx](file:///Users/julian/antigravity/exam/src/components/SubjectPortal.jsx) 与 [syncService.js](file:///Users/julian/antigravity/exam/src/utils/syncService.js) 中控制登录：
1. **默认登录**：系统在首次进入或本地登录凭证为空时，会**直接并自动将默认登录用户设为 `doudou`（豆豆）**并执行自动云同步。消除了首次加载应用时需选择用户或手动登录的操作。
2. **账号定义**：
   * **学生账号**：用户名 `doudou`，密码 `doudou`（用于复习答题、背词、收集错题、获得金币）。
   * **管理员账号**：用户名 `admin`，密码 `admin`（登录后展现「⚙️ 豆豆的学习 Dashboard」监控大盘，无法做题，只能进行教学监督）。
3. **初始金币底分**：豆豆的账户初始拥有 **120 分的保底赠送金币**（计算公式为 `120 + 四科积分累计`）。孩子后续在答题或测验中每获得分数，金币数会在 120 基础上快乐地持续累加（如 121, 122...），既符合初始化要求，又保留了得分的即时反馈乐趣。

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
6. **🎨 学过标记与防刷分**：在大厅中，已经通过（得过金币）的课程 Day 目录会**标注高亮背景色**。且重复点击学习这些课时，**不会重复加分**（锁分控制，防刷金币机制）。

---

## 📚 四大学科核心交互与体验优化

1. **小测答题体验大幅升级 (四科通用)**：
   * **选项点击自动推进**：在 20 题关卡小测中，点击选项会触发 **180ms 极短延时并自动跳转到下一题**，答题流转无比丝滑。
   * **提卷未做完警告**：在点击“交卷并结算小测”时，系统会自动过滤未答题，若存在则会弹出 confirm 警告：`“您还有 X 道题未做，确定要交卷并结算吗？”`。若用户确认，未做题目自动判错降级并正常结算得分。
2. **数学 (`MathModule.jsx`) & 物理 (`PhysicsModule.jsx`)**：
   * 支持重点考点公式指导、手绘原理图解画廊、大型交互式虚拟实验室。
   * 支持 20 题测试基础闯关与 100 题每日狂练，自动计分结算。
3. **化学 (`ChemistryModule.jsx`)**：
   * 支持中考高频化合价“消消乐”卡片配对游戏。
   * 支持 10 题课后小测与 100 题每日狂练。
4. **英语 (`EnglishModule.jsx`)**：
   * **词汇小测**：15 题 `match` 连线消除配错轻微抖动红闪动效 + 5 题 `choice` 核心语法单选。
   * **三遍英文跟读**：彻底去除了原先的中文发音跟读，更改为**纯英文发音循环 3 遍自动跟读**，每次发音后留有 **700ms 间隔时间** 供孩子开口。

---

## 🛠️ 历史已解决的核心 Bug 与架构优化 (新助手必读)

若后续开发中页面出现闪退或显示异常，请遵循以下已验证的成熟方案：

1. **错误边界诊断系统 ErrorBoundary 护航 (全科适用)**：
   * *起因*：一旦任何模块因为时序或脏缓存发生运行时崩溃，整个 React 节点会崩塌导致全屏一片空白，无法正常交互且极难排查。
   * *解决*：在 `App.jsx` 中使用通用 `<ErrorBoundary>` 错误边界容器包裹了四大科目。渲染崩溃时会直观渲染红色诊断控制面板，给出具体堆栈并提供一键**“🧹 清除缓存并修复”**重置 localStorage 冲突的纽带，保障页面永远不会发生死锁性白屏。
2. **Vite 混淆与 Effect 时序导致的暂时性死区 (TDZ) 崩溃**：
   * *起因*：化学的 `ALL_PERIODIC_ELEMENTS` 静态常量被写在组件函数内部，在被重排打包后，在尚未初始化前就被 `useEffect` 读取，抛出 `ReferenceError: Cannot access 'P' before initialization`。同理，物理与化学模块里的 `exerciseQuestions` 等 state 声明若被写在依赖它的 `useEffect` 钩子下方，会在组件函数注册时提前解构抛出 initialization 崩溃。在物理模块的交卷逻辑中，若在顶部未声明 `todayGoldCoin` 也会在结算切换视图时抛出 ReferenceError 崩溃。
   * *解决*：必须将静态常量（如化学元素库）移至文件外部的顶层全局作用域；必须将所有组件状态（`useState`）声明重新排序，**整体放置在任何副作用监听（`useEffect`）代码之上**；物理顶部必须正确声明并同步 `todayGoldCoin` 变量值。
3. **错题本加载 JSON.parse 脏缓存崩溃防线**：
   * *起因*：如果本地缓存 `localStorage.getItem('*-wrongs')` 中存入了脏值或 `'null'`，`JSON.parse` 之后 `wrongList` 会被赋值为 `null` 或非数组对象，在后续对其调用 `.some()` 或 `.push()` 会抛出 TypeError 白屏。
   * *解决*：所有科目的本地加载模块全部升级为 `Array.isArray(parsed) ? parsed : []` 强类型校验防御；在添加和匹配错题时全部加上 `w && w.id` 的安全性判定。
4. **底部控制栏按钮（交卷/下一题）在低高度屏幕被挤压隐藏 Bug**：
   * *起因*：答题区左面板的 CSS Flexbox 容器使用了 `justifyContent: 'space-between'`。在高度受限或者高阶 Flex 容器里极易引发高度崩塌，将底部控制行挤出可视区域被外层的 `overflow: hidden` 裁剪截断。
   * *解决*：去掉了 `justifyContent: 'space-between'` 限制，改为普通的 `gap: '20px'` 页面流式排版。按钮成为了紧跟在选项/解析下方的普通子元素，百分之百保证在任何屏幕尺寸和设备下均可完美显示和点击。
5. **iPad 窄屏/竖屏胶囊按钮重叠 Bug**：
   * *解决*：顶部导航栏胶囊组移除绝对定位，重构为 **Flex 弹性响应式顶栏**（`flex-wrap: wrap` 自动折行）。
6. **英语词汇题卡死崩溃 Bug**：
   * *解决*：在 `questionGenerator.js` 头部追加 `import { englishVocabList } from '../data/englishData.js';`。
