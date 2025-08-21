"use client";

import { useEffect, useMemo, useState } from "react";
import { useAudio } from "../context/AudioContext";

const PRESETS_KEY = "sinkin.presets";

export default function PresetManager({ variant = "desktop" }) {
  const { getCurrentCombination, applyCombination } = useAudio();
  const [presets, setPresets] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 读取本地存储
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(PRESETS_KEY)
          : null;
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) setPresets(list);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const persist = (list) => {
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(list));
    } catch (e) {
      // ignore
    }
  };

  const buildDefaultName = (items) => {
    if (!items || items.length === 0) return "空组合";
    // 只包含正在播放的音频名称
    const playingNames = items
      .filter((i) => i.isPlaying)
      .map((i) => i.title)
      .filter(Boolean);
    
    if (playingNames.length === 0) {
      // 如果没有正在播放的，但有音量设置的，使用第一个
      const firstItem = items[0];
      return firstItem ? firstItem.title : "空组合";
    }
    
    return playingNames.join(" + ");
  };

  const handleSave = () => {
    const items = getCurrentCombination();
    if (!items || items.length === 0) {
      alert("当前没有正在播放或设置音量的音频，无法保存。");
      return;
    }

    const defaultName = buildDefaultName(items);
    let name = prompt("为组合命名：", defaultName);
    if (!name) return;
    
    // 检查名称是否已存在
    const trimmedName = name.trim();
    const existingPreset = presets.find(p => p.name === trimmedName);
    if (existingPreset) {
      const overwrite = confirm(`组合"${trimmedName}"已存在，是否覆盖？`);
      if (!overwrite) {
        return; // 用户选择不覆盖，重新输入名称
      }
      // 用户选择覆盖，删除旧的预设
      const next = presets.filter(p => p.id !== existingPreset.id);
      setPresets(next);
      persist(next);
    }
    
    const newPreset = {
      id: String(Date.now()),
      name: trimmedName,
      items,
    };
    const next = [newPreset, ...presets.filter(p => p.id !== existingPreset?.id)];
    setPresets(next);
    persist(next);
    setSelectedId(newPreset.id);
    if (variant === "mobile") {
      setIsExpanded(false);
    }
  };

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      applyCombination(preset.items, { stopOthers: true });
    }
    if (variant === "mobile") {
      setIsExpanded(false);
    }
  };

  const handleDelete = (id) => {
    if (confirm("确定要删除这个组合吗？")) {
      const next = presets.filter((p) => p.id !== id);
      setPresets(next);
      persist(next);
      if (selectedId === id) {
        setSelectedId("");
      }
    }
  };

  if (variant === "mobile") {
    return (
      <div style={{ position: "relative" }}>
        {/* 浮动按钮 */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--primary)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            zIndex: 1001,
          }}
          title="预设管理"
        >
          📋
        </button>

        {/* 展开面板 */}
        {isExpanded && (
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              right: "0",
              width: "280px",
              background: "var(--primary)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
            }}
          >
            <div style={{ marginBottom: "0.75rem" }}>
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "14px",
                  color: "white",
                }}
              >
                预设组合
              </h4>
              <select
                value={selectedId}
                onChange={handleSelect}
                style={{
                  width: "100%",
                  height: "32px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "white",
                  padding: "0 8px",
                  fontSize: "12px",
                }}
              >
                <option value="" style={{ color: "black" }}>
                  选择组合…
                </option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id} style={{ color: "black" }}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  flex: 1,
                  height: "32px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                保存当前
              </button>
              {selectedId && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedId)}
                  style={{
                    height: "32px",
                    width: "32px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,0,0,0.2)",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  title="删除"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 桌面端版本
  return (
    <div style={{ 
      display: "inline-flex", 
      alignItems: "center", 
      gap: isSmallScreen ? 6 : 8,
      flexWrap: "nowrap",
      minWidth: 0,
    }}>
      <select
        aria-label="选择组合"
        value={selectedId}
        onChange={handleSelect}
        style={{
          height: 28,
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "transparent",
          color: "white",
          fontSize: "12px",
          padding: "0 8px",
          minWidth: isSmallScreen ? "80px" : "100px",
          maxWidth: isSmallScreen ? "120px" : "150px",
          flexShrink: 1,
        }}
      >
        <option value="" style={{ color: "black" }}>
          选择组合…
        </option>
        {presets.map((p) => (
          <option key={p.id} value={p.id} style={{ color: "black" }}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSave}
        style={{
          height: 28,
          padding: isSmallScreen ? "0 6px" : "0 8px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "transparent",
          color: "white",
          cursor: "pointer",
          fontSize: "12px",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
        title="保存当前组合"
      >
        保存
      </button>
      {selectedId && (
        <button
          type="button"
          onClick={() => handleDelete(selectedId)}
          style={{
            height: 28,
            width: 28,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,0,0,0.2)",
            color: "white",
            cursor: "pointer",
            fontSize: "12px",
            flexShrink: 0,
          }}
          title="删除组合"
        >
          🗑️
        </button>
      )}
    </div>
  );
}
