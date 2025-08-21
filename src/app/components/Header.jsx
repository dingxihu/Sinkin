"use client";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import GlobalVolumeControl from "./GlobalVolumeControl";
import { useI18n } from "../context/I18nContext";

const Header = () => {
  const { locale, setLocale, messages } = useI18n();
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "4rem",
        backgroundColor: "var(--primary)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0 1.5rem",
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
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
      </div>

      {/* 中间倒计时控制器 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gridColumn: 2,
          justifySelf: "center",
        }}
      >
        <CountdownTimer />
      </div>

      {/* 右侧：语言 + 音量 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          gridColumn: 3,
          justifySelf: "end",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: "0.5rem",
            alignItems: "center",
            height: "28px",
            padding: "0 6px",
          }}
        >
          <select
            aria-label="language"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            style={{
              height: "28px",
              width: "50px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "transparent",
              color: "white",
              padding: "0 6px",
              outline: "none",
            }}
          >
            {Object.keys(messages).map((code) => (
              <option key={code} value={code} style={{ color: "black" }}>
                {code}
              </option>
            ))}
          </select>
          <div
            style={{
              width: "1px",
              height: "16px",
              background: "rgba(255,255,255,0.2)",
            }}
          />
          <GlobalVolumeControl variant="inline" />
        </div>
      </div>
    </header>
  );
};

export default Header;
