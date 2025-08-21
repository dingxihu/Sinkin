"use client";

import { useRef, useState, useEffect, memo } from "react";
import Image from "next/image";
import styles from "./audioItem.module.css";
import { useAudio } from "../context/AudioContext";

const AudioItemComponent = ({ title, src, icon, showTitle = false, group = "audio" }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { globalVolume, isGlobalMuted, isAlarmPlaying, registerPlayer, unregisterPlayer } = useAudio();

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

  const loadAndPlayAudio = async () => {
    if (!audioRef.current) {
      setIsLoading(true);
      try {
        // 创建新的audio元素
        const audio = new Audio();
        audio.crossOrigin = "anonymous"; // 处理CORS问题
        audio.preload = "none"; // 不预加载
        audio.src = src;
        audio.loop = true;
        audio.volume = isGlobalMuted ? 0 : volume * globalVolume;
        
        // 更简单的加载方式 - 让浏览器处理加载
        audioRef.current = audio;
        setIsLoading(false);
        
        // 直接尝试播放，让浏览器处理加载
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
              
              // 如果播放失败，尝试重新加载
              if (error.name === 'NotSupportedError' || error.name === 'NotAllowedError') {
                console.warn("尝试备用加载方式:", title);
                audio.load(); // 重新加载
              }
            });
        }
      } catch (error) {
        console.error("音频创建失败:", error, "URL:", src);
        setIsLoading(false);
      }
    } else {
      // 直接播放已缓存的音频
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("音频播放失败:", error);
            setIsPlaying(false);
          });
      }
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
      getState: () => ({ isPlaying, volume }),
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
    // 仅在首尾及依赖变化时注册/更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, group, globalVolume, isGlobalMuted, isAlarmPlaying, registerPlayer, unregisterPlayer, isPlaying]);

  return (
    <div className={styles.audioItem}>
      <button
        className={`${styles.iconButton} ${isPlaying ? styles.playing : ""}`}
        onClick={togglePlay}
        disabled={isLoading}
        style={{ opacity: isAlarmPlaying ? 0.5 : 1 }} // 添加视觉反馈
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
