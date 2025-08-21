import fs from "fs";
import path from "path";

export function getAudioFiles() {
  const iconDir = path.join(process.cwd(), "public", "icons");
  const configPath = path.join(process.cwd(), "public", "config.json");

  let audioList = [];
  let musicList = [];
  let overrideBaseUrl =
    "http://smartmedicalstatic.oss-cn-beijing.aliyuncs.com/_/assets/audio/";

  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf8");

      const cfg = JSON.parse(raw);
      if (Array.isArray(cfg.audioFiles) && cfg.audioFiles.length > 0) {
        audioList = cfg.audioFiles;
      }
      if (typeof cfg.audioBaseUrl === "string" && cfg.audioBaseUrl) {
        overrideBaseUrl = cfg.audioBaseUrl.endsWith("/")
          ? cfg.audioBaseUrl
          : cfg.audioBaseUrl + "/";
      }
      if (Array.isArray(cfg.musicFiles) && cfg.musicFiles.length > 0) {
        musicList = cfg.musicFiles;
      }
    }
  } catch (e) {
    console.warn("读取配置失败，将使用默认音频列表与地址", e);
  }

  const audioData = audioList.map((file) => {
    const baseName = path.basename(file, path.extname(file));
    const possibleIconExts = [".png", ".svg", ".jpg", ".jpeg"];

    let iconFile = null;
    for (const ext of possibleIconExts) {
      const iconPath = path.join(iconDir, `${baseName}${ext}`);
      if (fs.existsSync(iconPath)) {
        iconFile = `${baseName}${ext}`;
        break;
      }
    }

    const icon = iconFile ? `/icons/${iconFile}` : "/icons/pure-music.png";

    return {
      title: baseName,
      src: `${overrideBaseUrl}${file}`,
      icon: icon,
    };
  });

  const musicData = musicList.map((file, index) => {
    const baseName = path.basename(file, path.extname(file));
    const possibleIconExts = [".png", ".svg", ".jpg", ".jpeg"];

    let iconFile = null;
    for (const ext of possibleIconExts) {
      const iconPath = path.join(iconDir, `${baseName}${ext}`);
      if (fs.existsSync(iconPath)) {
        iconFile = `${baseName}${ext}`;
        break;
      }
    }

    const icon = index <= 9 ? `/icons/music${index}.png` : `/icons/music.png`;

    return {
      title: baseName,
      src: `${overrideBaseUrl}${file}`,
      icon: icon,
    };
  });

  return { audioData, musicData };
}
