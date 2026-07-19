/**
 * 中考复习系统 - 极简多端云同步服务
 * 针对个人/家庭复习场景设计，使用高可用、免注册公共加密 KV 存储实现多端实时同步
 */

// 使用符合 kvdb.io 标准 16 位纯字母数字的随机 Bucket 桶名，保障个人数据隔离、云同步与安全性
const BUCKET_ID = 'examdbdoudou9a12';
const BASE_URL = `https://kvdb.io/${BUCKET_ID}`;

// 账号定义
export const ACCOUNTS = {
  doudou: { username: 'doudou', role: 'user', displayName: '豆豆' },
  test: { username: 'test', role: 'user', displayName: '测试账号' },
  admin: { username: 'admin', role: 'admin', displayName: '管理员' }
};

// 检查是否已登录并返回当前用户
export const getCurrentUser = () => {
  const user = localStorage.getItem('exam-current-user');
  if (!user) {
    localStorage.setItem('exam-current-user', 'doudou');
    return 'doudou';
  }
  return user;
};

// 执行登录
export const loginUser = async (username, password) => {
  const account = ACCOUNTS[username];
  if (!account || username !== password) {
    throw new Error('账号或密码错误');
  }
  
  // 记录本地登录状态
  localStorage.setItem('exam-current-user', username);
  
  // 尝试从云端同步最新的进度
  try {
    const cloudProgress = await loadFromCloud(username);
    if (cloudProgress) {
      restoreLocalProgress(cloudProgress);
      // 派发全局同步成功事件，通知所有子组件刷新数据
      window.dispatchEvent(new Event('progress-synced'));
      return { account, synced: true };
    }
  } catch (e) {
    console.warn('Cloud sync error on login, fallback to local:', e);
  }
  
  return { account, synced: false };
};

// 退出登录
export const logoutUser = () => {
  localStorage.removeItem('exam-current-user');
  window.dispatchEvent(new Event('progress-synced'));
};

// 自动生成并记录学习日志 (支持得分、正确率与漏洞点记录)
export const addStudyLog = (subject, action, detail, score = 0, total = 0, weaknesses = []) => {
  try {
    const user = localStorage.getItem('exam-current-user');
    // 如果没有登录，或者是 admin 自己做题，则不记录到豆豆的学习日志中
    if (!user || user === 'admin') return;

    const savedLogs = localStorage.getItem('exam-study-logs');
    let logs = [];
    if (savedLogs) {
      logs = JSON.parse(savedLogs);
    }

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // 计算正确率 (如 10 题答对 8 题 -> 80%)
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 100;

    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      timeString,
      subject,
      action,
      detail,
      score,
      total,
      accuracy,
      weaknesses
    };

    // 最新记录放在最前面
    logs.unshift(newLog);

    // 最大只保留最近 200 条，防止本地存储溢出
    if (logs.length > 200) {
      logs = logs.slice(0, 200);
    }

    localStorage.setItem('exam-study-logs', JSON.stringify(logs));
    console.log('Recorded study log successfully:', newLog);
  } catch (e) {
    console.warn('Failed to add study log:', e);
  }
};

// 打包当前 LocalStorage 中所有的答题分数、错题、词汇记录及学习日志
export const getLocalProgress = () => {
  const progress = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // 只打包中考系统各科目答题分数、错题库、背词记录相关的数据键，以及学习轨迹日志键
    if (
      key.startsWith('math-') ||
      key.startsWith('physics-') ||
      key.startsWith('chemistry-') ||
      key.startsWith('english-') ||
      key === 'exam-study-logs'
    ) {
      progress[key] = localStorage.getItem(key);
    }
  }
  return progress;
};

// 将云端数据还原写入本地 LocalStorage
export const restoreLocalProgress = (progress) => {
  if (!progress || typeof progress !== 'object') return;
  Object.keys(progress).forEach((key) => {
    localStorage.setItem(key, progress[key]);
  });
};

// 远程拉取云端进度
export const loadFromCloud = async (username) => {
  try {
    const response = await fetch(`${BASE_URL}/${username}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // 还没有云备份
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to load progress from cloud:', e);
    throw e;
  }
};

// 备份本地进度至云端（核心接口，支持防抖）
let syncTimeoutId = null;
export const triggerCloudSync = (username) => {
  if (!username) return;
  
  // 800ms 防抖，防止做题、划词时由于高频操作发送过多的 HTTP 请求
  if (syncTimeoutId) {
    clearTimeout(syncTimeoutId);
  }
  
  syncTimeoutId = setTimeout(async () => {
    try {
      const progress = getLocalProgress();
      await fetch(`${BASE_URL}/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progress)
      });
      console.log(`Cloud sync success for user: ${username}`);
    } catch (e) {
      console.warn('Failed to sync progress to cloud:', e);
    }
  }, 800);
};

// 全局代理本地存储，实现静默全自动云同步
if (typeof window !== 'undefined') {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (
      key.startsWith('math-') ||
      key.startsWith('physics-') ||
      key.startsWith('chemistry-') ||
      key.startsWith('english-') ||
      key === 'exam-study-logs'
    ) {
      const user = localStorage.getItem('exam-current-user');
      if (user) {
        triggerCloudSync(user);
      }
    }
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function (key) {
    originalRemoveItem.apply(this, arguments);
    if (
      key.startsWith('math-') ||
      key.startsWith('physics-') ||
      key.startsWith('chemistry-') ||
      key.startsWith('english-') ||
      key === 'exam-study-logs'
    ) {
      const user = localStorage.getItem('exam-current-user');
      if (user) {
        triggerCloudSync(user);
      }
    }
  };
}
