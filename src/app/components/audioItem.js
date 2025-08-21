"use client";

import { useRef, useState, useEffect, memo } from "react";
import Image from "next/image";
import styles from "./audioItem.module.css";
import { useAudio } from "../context/AudioContext";
import audioPreloader from "../utils/audioPreloader";

const AudioItemComponent = ({ title, src, icon, showTitle = false, group = "audio" }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const { globalVolume, isGlobalMuted, isAlarmPlaying, registerPlayer, unregisterPlayer } = useAudio();
  
  // 保存最新状态，供 getState 使用，避免因依赖变更导致重新注册
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(1);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  /**
   * @description 监听闹钟状态变化，当闹钟开始播放时停止当前音频
   */
  useEffect(() => {
    if (isAlarmPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isAlarmPlaying]);

  // 监听音量变化
  useEffect(() => {
    if (audioRef.current) {
      const newVolume = isGlobalMuted ? 0 : volume * globalVolume;
      audioRef.current.volume = newVolume;
    }
  }, [globalVolume, isGlobalMuted, volume]);

  // 组件挂载时预加载音频
  useEffect(() => {
    if (audioPreloader.isPreloaded(src)) {
      setIsPreloaded(true);
      return;
    }
    
    // 移动端延迟预加载，桌面端立即预加载
    const delay = audioPreloader.isMobile ? 1000 : 0;
    const timer = setTimeout(() => {
      audioPreloader.preloadAudio(src, title, 'normal').then(() => {
        setIsPreloaded(true);
      }).catch(() => {
        // 预加载失败不影响正常使用
      });
    }, delay);
    
    return () => clearTimeout(timer);
  }, [src, title]);

  const loadAndPlayAudio = async () => {
    // 防止重复触发创建/播放
    if (isLoading) return;
    if (audioRef.current && !audioRef.current.paused) {
      setIsPlaying(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let audio;
      
      // 优先使用预加载的音频
      if (audioPreloader.isPreloaded(src)) {
        audio = audioPreloader.getCachedAudio(src);
        console.log("使用预加载的音频:", title);
      } else {
        // 创建新的audio元素
        audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.preload = "auto"; // 移动端使用自动预加载
        audio.src = src;
        console.log("创建新的音频元素:", title);
      }
      
      audio.loop = true;
      audio.volume = isGlobalMuted ? 0 : volume * globalVolume;
      
      // 监听音频事件
      audio.addEventListener('loadstart', () => console.log("音频开始加载:", title));
      audio.addEventListener('canplay', () => console.log("音频可以播放:", title));
      audio.addEventListener('canplaythrough', () => console.log("音频可以完整播放:", title));
      audio.addEventListener('error', (e) => console.error("音频加载错误:", title, e));
      
      audioRef.current = audio;
      setIsLoading(false);
      
      // 移动端优化：等待 canplay 事件后再播放
      if (audioPreloader.isMobile && audio.readyState < 2) {
        await new Promise((resolve) => {
          audio.addEventListener('canplay', resolve, { once: true });
        });
      }
      
      // 直接尝试播放
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("音频播放成功:", title);
          })
          .catch((error) => {
            console.error("音频播放失败:", error, "URL:", src);
            setIsPlaying(false);
            
            // 移动端特殊处理
            if (audioPreloader.isMobile && error.name === 'NotAllowedError') {
              console.warn("移动端需要用户交互才能播放音频");
            }
          });
      }
    } catch (error) {
      console.error("音频创建失败:", error, "URL:", src);
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    // 如果闹钟正在播放，不允许播放其他音频
    if (isAlarmPlaying) {
      return;
    }

    if (isPlaying) {
      try {
        audioRef.current?.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error("暂停音频失败:", error);
      }
    } else {
      // 确保闹钟没有在播放时才允许播放
      if (!isAlarmPlaying) {
        loadAndPlayAudio();
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isGlobalMuted ? 0 : newVolume * globalVolume;
    }
    e.target.style.setProperty("--volume-percentage", `${newVolume * 100}%`);
  };

  // 注册到全局上下文，暴露控制器
  useEffect(() => {
    const id = `${group}:${title}`;
    const controller = {
      meta: { title, group },
      play: () => {
        if (!isAlarmPlaying) {
          loadAndPlayAudio();
        }
      },
      pause: () => {
        try {
          audioRef.current?.pause();
          setIsPlaying(false);
        } catch (error) {
          console.error("暂停音频失败:", error);
        }
      },
      setVolume: (v) => {
        const newV = Math.max(0, Math.min(1, Number(v) || 0));
        setVolume(newV);
        if (audioRef.current) {
          audioRef.current.volume = isGlobalMuted ? 0 : newV * globalVolume;
        }
      },
      getState: () => ({ isPlaying: isPlayingRef.current, volume: volumeRef.current }),
    };
    const dispose = registerPlayer(id, controller);
    return () => {
      dispose && dispose();
      unregisterPlayer(id);
      // 清理音频资源
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
    // 仅在标识或注册函数变化时注册/更新，避免因状态变更反复卸载/重建
  }, [title, group, registerPlayer, unregisterPlayer]);

  return (
    <div className={styles.audioItem}>
      <button
        className={`${styles.iconButton} ${isPlaying ? styles.playing : ""} ${isPreloaded ? styles.preloaded : ""}`}
        onClick={togglePlay}
        disabled={isLoading}
        style={{ opacity: isAlarmPlaying ? 0.5 : 1 }} // 添加视觉反馈
        title={isPreloaded ? "已预加载" : "点击播放"}
      >
        {isLoading ? (
          <div className={styles.loadingSpinner} />
        ) : (
          <Image
            src={icon}
            alt={title}
            width={64}
            height={64}
            style={{ objectFit: "cover" }}
            priority
          />
        )}
        {isPreloaded && !isLoading && (
          <div className={styles.preloadIndicator} title="已预加载">⚡</div>
        )}
      </button>
      <div className={styles.volumeControl}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
          style={{
            "--volume-percentage": `${volume * 100}%`,
            opacity: isPlaying ? 1 : 0,
          }}
        />
      </div>
      {showTitle && (
        <div className={styles.title} title={title}>
          {title}
        </div>
      )}
    </div>
  );
};

const AudioItem = memo(AudioItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.src === nextProps.src &&
    prevProps.icon === nextProps.icon &&
    prevProps.showTitle === nextProps.showTitle &&
    prevProps.group === nextProps.group
  );
});

export default AudioItem;
