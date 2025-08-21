"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TOTAL_TIME, ALARM_TIME } from "@/constant";

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/config.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setConfig(json);
        }
      } catch (e) {
        // 静默失败，使用默认值
        if (!cancelled) setConfig(null);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const totalTime = Number(config?.totalTime);
    const alarmTime = Number(config?.alarmTime);
    return {
      isLoaded: loaded,
      totalTime: Number.isFinite(totalTime) && totalTime > 0 ? totalTime : TOTAL_TIME,
      alarmTime: Number.isFinite(alarmTime) && alarmTime > 0 ? alarmTime : ALARM_TIME,
      raw: config,
    };
  }, [config, loaded]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}


