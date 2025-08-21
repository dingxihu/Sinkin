"use client";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import GlobalVolumeControl from "./GlobalVolumeControl";
import { useI18n } from "../context/I18nContext";
import PresetManager from "./PresetManager";
import { useState, useEffect } from "react";

const Header = () => {
  const { locale, setLocale, messages } = useI18n();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: isMobile ? "3.5rem" : "4rem",
        backgroundColor: "var(--primary)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        display: "grid",
        gridTemplateColumns: isMobile ? "auto 1fr auto" : "1fr auto 1fr",
        alignItems: "center",
        padding: isMobile ? "0 1rem" : "0 1.5rem",
        zIndex: 50,
      }}
    >
      {/* 左侧 Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gridColumn: 1,
          justifySelf: "start",
        }}
      >
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={isMobile ? 32 : 40} 
          height={isMobile ? 32 : 40} 
        />
      </div>

      {/* 中间倒计时控制器 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gridColumn: isMobile ? 2 : 2,
          justifySelf: "center",
        }}
      >
        <CountdownTimer />
      </div>

      {/* 右侧：预设管理 + 音量控制 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "0.5rem" : "0.75rem",
          gridColumn: isMobile ? 3 : 3,
          justifySelf: "end",
          minWidth: 0, // 允许容器收缩
          flexWrap: "nowrap", // 防止换行
        }}
      >
        {!isMobile && (
          <div style={{ flexShrink: 0 }}>
            <PresetManager />
          </div>
        )}
        <div
          style={{
            display: "inline-flex",
            gap: "0.5rem",
            alignItems: "center",
            height: isMobile ? "24px" : "28px",
            padding: "0 6px",
            flexShrink: 0, // 防止音量控制被压缩
          }}
        >
          <GlobalVolumeControl variant="inline" />
        </div>
      </div>

      {/* 移动端预设管理器 - 浮动按钮 */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            zIndex: 1000,
          }}
        >
          <PresetManager variant="mobile" />
        </div>
      )}
    </header>
  );
};

export default Header;
