"use client";

import { useEffect, useMemo, useState } from "react";
import { useAudio } from "../context/AudioContext";

const PRESETS_KEY = "sinkin.presets";

export default function PresetManager() {
  const { getCurrentCombination, applyCombination } = useAudio();
  const [presets, setPresets] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  // 读取本地存储
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(PRESETS_KEY) : null;
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
    const names = items.map((i) => i.title).filter(Boolean);
    return names.join(" + ");
  };

  const handleSave = () => {
    const items = getCurrentCombination();
    if (!items || items.length === 0) {
      alert("当前没有正在播放或设置音量的音频，无法保存。");
      return;
    }
    const defaultName = buildDefaultName(items);
    const name = prompt("为组合命名：", defaultName);
    if (!name) return;
    const newPreset = {
      id: String(Date.now()),
      name,
      items,
    };
    const next = [newPreset, ...presets];
    setPresets(next);
    persist(next);
    setSelectedId(newPreset.id);
  };

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      applyCombination(preset.items, { stopOthers: true });
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <select
        aria-label="选择组合"
        value={selectedId}
        onChange={handleSelect}
        style={{ height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white" }}
      >
        <option value="" style={{ color: "black" }}>选择组合…</option>
        {presets.map((p) => (
          <option key={p.id} value={p.id} style={{ color: "black" }}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSave}
        style={{ height: 28, padding: "0 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", cursor: "pointer" }}
        title="保存当前组合"
      >
        保存
      </button>
    </div>
  );
}


