"use client";

import { useAudio } from "../context/AudioContext";
import styles from "./globalVolumeControl.module.css";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "../context/I18nContext";

export default function GlobalVolumeControl({ variant = "fixed" }) {
  const { t } = useI18n();
  const { globalVolume, isGlobalMuted, toggleGlobalMute, updateGlobalVolume } =
    useAudio();
  const [showSlider, setShowSlider] = useState(false);

  const getVolumeIcon = () => {
    if (isGlobalMuted || globalVolume === 0) {
      return "/svgs/mute.svg";
    }
    if (globalVolume < 0.5) {
      return "/svgs/volume-low.svg";
    }
    return "/svgs/volume.svg";
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    updateGlobalVolume(newVolume);
    e.target.style.setProperty("--volume-percentage", `${newVolume * 100}%`);
  };

  const containerClass =
    variant === "inline" ? styles.volumeControlInline : styles.volumeControl;

  return (
    <div
      className={containerClass}
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <div
        className={`${styles.sliderContainer} ${showSlider ? styles.show : ""}`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={globalVolume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
          style={{ "--volume-percentage": `${globalVolume * 100}%` }}
        />
      </div>
      <button
        onClick={toggleGlobalMute}
        className={styles.muteButton}
        type="button"
        title={isGlobalMuted ? t("unmute") : t("mute")}
      >
        <Image
          src={getVolumeIcon()}
          alt={isGlobalMuted ? "Unmute" : "Mute"}
          width={24}
          height={24}
          priority
        />
      </button>
    </div>
  );
}
