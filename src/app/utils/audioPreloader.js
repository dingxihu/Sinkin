// 全局音频预加载管理器
class AudioPreloader {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = new Set();
    this.maxConcurrent = 3; // 最大并发预加载数
    this.activePreloads = 0;
    this.preloadQueue = [];
    this.isMobile = this.detectMobile();
  }

  detectMobile() {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  // 智能预加载策略
  async preloadAudio(src, title, priority = 'normal') {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    if (this.preloadQueue.has(src)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (this.cache.has(src)) {
            resolve(this.cache.get(src));
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.preloadQueue.add(src);

    // 移动端延迟预加载，节省初始加载时间
    if (this.isMobile && priority === 'low') {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      
      // 根据优先级和平台设置预加载策略
      if (priority === 'high' || !this.isMobile) {
        audio.preload = "auto";
      } else {
        audio.preload = "metadata";
      }
      
      audio.src = src;

      const timeout = setTimeout(() => {
        reject(new Error('预加载超时'));
        this.preloadQueue.delete(src);
      }, 10000); // 10秒超时

      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(timeout);
        this.cache.set(src, audio);
        this.preloadQueue.delete(src);
        console.log("音频预加载完成:", title);
        resolve(audio);
      }, { once: true });

      audio.addEventListener('error', (e) => {
        clearTimeout(timeout);
        this.preloadQueue.delete(src);
        console.warn("音频预加载失败:", title, e);
        reject(e);
      }, { once: true });
    });
  }

  // 批量预加载
  async preloadBatch(audioList, priority = 'normal') {
    const promises = [];
    const batchSize = this.isMobile ? 2 : 4; // 移动端减少并发数

    for (let i = 0; i < audioList.length; i += batchSize) {
      const batch = audioList.slice(i, i + batchSize);
      const batchPromises = batch.map(({ src, title }) => 
        this.preloadAudio(src, title, priority)
      );
      
      await Promise.allSettled(batchPromises);
      
      // 移动端批次间延迟
      if (this.isMobile && i + batchSize < audioList.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // 获取缓存的音频
  getCachedAudio(src) {
    return this.cache.get(src);
  }

  // 检查是否已预加载
  isPreloaded(src) {
    return this.cache.has(src);
  }

  // 清理缓存
  clearCache() {
    this.cache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.cache.clear();
    this.preloadQueue.clear();
  }

  // 获取缓存统计
  getCacheStats() {
    return {
      cachedCount: this.cache.size,
      queueCount: this.preloadQueue.size,
      isMobile: this.isMobile
    };
  }
}

// 创建全局实例
const audioPreloader = new AudioPreloader();

export default audioPreloader;
