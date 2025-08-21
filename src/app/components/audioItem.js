"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import styles from "./audioItem.module.css";
import { useAudio } from "../context/AudioContext";

const AudioItem = ({ title, src, icon, showTitle = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const { globalVolume, isGlobalMuted, isAlarmPlaying } = useAudio();

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

  const togglePlay = () => {
    // 如果闹钟正在播放，不允许播放其他音频
    if (isAlarmPlaying) {
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      // 确保闹钟没有在播放时才允许播放
      if (!isAlarmPlaying) {
        audioRef.current?.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isGlobalMuted ? 0 : newVolume * globalVolume;
    }
    e.target.style.setProperty("--volume-percentage", `${newVolume * 100}%`);
  };

  return (
    <div className={styles.audioItem}>
      <button
        className={`${styles.iconButton} ${isPlaying ? styles.playing : ""}`}
        onClick={togglePlay}
        style={{ opacity: isAlarmPlaying ? 0.5 : 1 }} // 添加视觉反馈
      >
        <Image
          src={icon}
          alt={title}
          width={64}
          height={64}
          style={{ objectFit: "cover" }}
          priority
        />
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
      <audio ref={audioRef} src={src} loop />
    </div>
  );
};

export default AudioItem;
