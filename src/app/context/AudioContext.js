"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";

const AudioContext = createContext();

// 安全的音量计算函数
const calculateSafeVolume = (volume, globalVolume, isMuted) => {
  try {
    if (isMuted) return 0;

    // 确保输入是数字
    const vol = Number(volume);
    const gVol = Number(globalVolume);

    // 检查是否是有效数字
    if (!Number.isFinite(vol) || !Number.isFinite(gVol)) {
      return 0.5; // 默认值
    }

    // 确保在 0-1 范围内
    const safeVol = Math.max(0, Math.min(1, vol));
    const safeGVol = Math.max(0, Math.min(1, gVol));

    // 计算最终音量
    return safeVol * safeGVol;
  } catch (error) {
    console.error("音量计算错误:", error);
    return 0.5; // 出错时返回默认值
  }
};

export function AudioProvider({ children }) {
  const [globalVolume, setGlobalVolume] = useState(0.5);
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioRef = useRef(null);

  // 初始化音频设置
  useEffect(() => {
    const audio = new Audio("/alarm.ogg");

    const handleCanPlay = () => {
      const safeVolume = calculateSafeVolume(0.5, globalVolume, isGlobalMuted);
      if (audio.readyState >= 2) {
        audio.volume = safeVolume;
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.loop = true;
    audioRef.current = audio;

    // 监听音频结束事件
    const handleEnded = () => {
      setIsAlarmPlaying(false);
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [globalVolume, isGlobalMuted]);

  // 播放闹钟， 如果闹钟正在播放，则不播放其他音频
  const playAlarm = () => {
    if (!audioRef.current) return;

    if (isAlarmPlaying) return;

    try {
      audioRef.current.currentTime = 0;

      // 先更新状态
      setIsAlarmPlaying(true);
      setIsPlaying(true);

      // 然后播放音频
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("播放失败:", error);
          setIsAlarmPlaying(false);
          setIsPlaying(false);
        });
      }
    } catch (error) {
      console.error("播放出错:", error);
      setIsAlarmPlaying(false);
      setIsPlaying(false);
    }
  };

  const stopAlarm = () => {
    if (!audioRef.current) return;

    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAlarmPlaying(false);
      setIsPlaying(false);
    } catch (error) {
      console.error("停止播放出错:", error);
    }
  };

  // 强制重新渲染的辅助函数
  const forceUpdate = useState({})[1];

  // 监听 isAlarmPlaying 的变化并强制更新
  useEffect(() => {
    forceUpdate({});
  }, [isAlarmPlaying, forceUpdate]);

  const contextValue = {
    globalVolume,
    isGlobalMuted,
    isAlarmPlaying,
    isPlaying,
    playAlarm,
    stopAlarm,
    toggleGlobalMute: () => setIsGlobalMuted((prev) => !prev),
    updateGlobalVolume: (volume) => {
      const safeVolume = Math.max(0, Math.min(1, Number(volume) || 0));
      setGlobalVolume(safeVolume);
    },
    calculateSafeVolume,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
