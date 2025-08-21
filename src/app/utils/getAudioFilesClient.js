// 客户端版本的音频文件获取函数
export function getAudioFilesClient() {
  // 从 public/config.json 获取配置
  const defaultConfig = {
    audioBaseUrl: "http://smartmedicalstatic.oss-cn-beijing.aliyuncs.com/_/assets/audio/",
    audioFiles: [
      "brownnoise.ogg",
      "coffee.ogg",
      "fan.ogg",
      "fire.ogg",
      "forest.ogg",
      "leaves.ogg",
      "pinknoise.ogg",
      "rain.ogg",
      "seaside.ogg",
      "summernight.ogg",
      "thunderstorm.ogg",
      "train.ogg",
      "water.ogg",
      "waterstream.ogg",
      "whitenoise.ogg",
      "wind.ogg"
    ],
    musicFiles: [
      "呕心沥血.ogg",
      "Autumn.mp3",
      "江上清风游.mp3",
      "心の草原.mp3",
      "印象国乐·大曲.mp3",
      "RighteousPath.mp3",
      "FollowYourHeart.mp3",
      "织女心丝.mp3",
      "峨眉金顶.mp3",
      "望月之城.mp3",
      "情咒.mp3",
      "无尽的路.mp3",
      "逆伦.mp3",
      "千年风雅.mp3",
      "ひとひらの雪.mp3",
      "闫月.mp3",
      "黄沾.mp3",
      "林青霞.mp3",
      "枫林.mp3",
      "倾心.mp3",
      "青城.mp3",
      "十指流玉.mp3",
      "琵琶语古筝版.mp3",
      "MysticZone.mp3",
      "群星.mp3",
      "独坐幽篁里.mp3",
      "暗夜浮香.mp3",
      "梅花下舞.mp3",
      "楚国八百年主题曲.mp3",
      "孤独.mp3",
      "铸剑山庄.mp3",
      "麦振鸿.mp3",
      "旅行.mp3",
      "雨夜诀别.mp3",
      "江南印象.mp3",
      "琵琶吟.mp3",
      "刘星.mp3",
      "陈军心中的阿尔金.mp3",
      "BornUnderaTotalEclipse.mp3",
      "LoveTheme.mp3",
      "天地孤影任我行.mp3",
      "尘归尘土归土.mp3",
      "幻影交叠.mp3",
      "序曲：天地孤影任我行.mp3",
      "昔情难追.mp3",
      "纠结难解.mp3",
      "乱红.mp3",
      "千军万马.mp3",
      "一生只爱你一人.mp3",
      "疤痕.mp3",
      "许愿.mp3",
      "逍遥游.mp3",
      "郁.mp3",
      "赵子龙.mp3"
    ]
  };

  let config = defaultConfig;
  
  // 尝试从 localStorage 获取用户自定义配置
  if (typeof window !== 'undefined') {
    try {
      const savedConfig = localStorage.getItem('sinkin.audioConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        config = { ...defaultConfig, ...parsed };
      }
    } catch (e) {
      console.warn('读取本地配置失败，使用默认配置');
    }
  }

  const audioList = config.audioFiles || defaultConfig.audioFiles;
  const musicList = config.musicFiles || defaultConfig.musicFiles;
  const baseUrl = config.audioBaseUrl || defaultConfig.audioBaseUrl;

  const audioData = audioList.map((file) => {
    const baseName = file.replace(/\.[^/.]+$/, ""); // 移除文件扩展名
    const encoded = encodeURIComponent(file);
    
    return {
      title: baseName,
      src: `/api/audio/${encoded}`,
      icon: `/icons/${baseName}.png`,
    };
  });

  const musicData = musicList.map((file, index) => {
    const baseName = file.replace(/\.[^/.]+$/, ""); // 移除文件扩展名
    const encoded = encodeURIComponent(file);
    
    return {
      title: baseName,
      src: `/api/audio/${encoded}`,
      icon: index <= 9 ? `/icons/music${index}.png` : `/icons/music.png`,
    };
  });

  return { audioData, musicData };
}
