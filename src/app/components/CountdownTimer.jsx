"use client";
import { useEffect, useState, useCallback } from "react";
import { useAudio } from "../context/AudioContext";
import { TOTAL_TIME } from "@/constant";
import { useI18n } from "../context/I18nContext";
import { useConfig } from "../context/ConfigContext";

// 基础按钮样式对象
const buttonBaseStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 200ms",
  position: "relative",
  outline: "none",
  border: "none",
  backgroundColor: "var(--primary-secondary)",
  color: "white",
  cursor: "pointer",
  // hover效果
  ":hover": {
    backgroundColor: "var(--primary-light)",
  },
};

const CountdownTimer = () => {
  const { t } = useI18n();
  const { totalTime } = useConfig();
  const { isPlaying, playAlarm, stopAlarm } = useAudio();
  const [timeLeft, setTimeLeft] = useState(totalTime ?? TOTAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // 格式化时间显示
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // 重置计时器
  const resetTimer = useCallback(() => {
    setTimeLeft(totalTime ?? TOTAL_TIME);
    setIsComplete(false);
    setIsRunning(false);
    stopAlarm();
  }, [stopAlarm, totalTime]);

  // 当 totalTime 配置变更时同步当前 timer
  useEffect(() => {
    setTimeLeft(totalTime ?? TOTAL_TIME);
    setIsComplete(false);
    setIsRunning(false);
  }, [totalTime]);

  // 处理倒计时完成， 播放闹钟，停止播放音乐
  const handleComplete = useCallback(() => {
    setIsComplete(true);
    setIsRunning(false);
    playAlarm();
  }, [playAlarm]);

  // 倒计时效果
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimeout(() => {
              handleComplete();
            }, 10);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRunning, timeLeft, handleComplete]);

  // 处理开始/暂停
  const handleStartPause = useCallback(() => {
    if (isComplete) {
      return;
    }

    setIsRunning(!isRunning);
  }, [isComplete, isRunning]);

  // 播放/暂停按钮的 SVG 组件
  const PlayIcon = () => (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );

  const PauseIcon = () => (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        color: "white",
      }}
    >
      <button
        onClick={resetTimer}
        title={t("reset")}
        style={{
          ...buttonBaseStyle,
          display: "flex",
          height: "2rem",
          width: "2rem",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0.75rem",
          fontSize: "1rem",
          transition: "background-color 0.3s",
          animation: isComplete ? "pulse 2s infinite" : "none",
        }}
      >
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          title={t("timer_title")}
          style={{
            width: "5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            textAlign: "center",
            padding: "0.5rem",
            fontSize: "1.25rem",
            lineHeight: "none",
            color: "white",
            backgroundColor: "var(--primary)",
            borderRadius: "0.75rem",
            transition: "background-color 0.3s",
            border: "2px solid var(--primary)",
          }}
        >
          <span style={{ fontWeight: "bold" }}>
            {formatTime(timeLeft).split(":")[0]}
          </span>
          <span>:</span>
          <span style={{ fontWeight: "bold" }}>
            {formatTime(timeLeft).split(":")[1]}
          </span>
        </div>
      </div>
      <button
        onClick={handleStartPause}
        title={isRunning ? t("pause") : t("start")}
        style={{
          ...buttonBaseStyle,
          display: "flex",
          height: "2rem",
          width: "2rem",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0.75rem",
          fontSize: "1rem",
          transition: "background-color 0.3s",
          opacity: isComplete ? 0.5 : 1,
          cursor: isComplete ? "not-allowed" : "pointer",
        }}
        disabled={isComplete}
        data-umami-event="Play/pause pomodoro timer"
      >
        {isRunning ? <PauseIcon /> : <PlayIcon />}
      </button>
    </div>
  );
};

export default CountdownTimer;
