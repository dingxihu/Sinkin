"use client";

import { useEffect } from 'react';
import { getAudioFilesClient } from '../utils/getAudioFilesClient';
import audioPreloader from '../utils/audioPreloader';

export default function AudioPreloader() {
  useEffect(() => {
    const initializePreloading = async () => {
      try {
        const { audioData, musicData } = getAudioFilesClient();
        
        // 优先预加载白噪音类音频（用户最常用的）
        const priorityAudios = audioData.filter(item => 
          item.title.toLowerCase().includes('white') || 
          item.title.toLowerCase().includes('pink') ||
          item.title.toLowerCase().includes('brown') ||
          item.title.toLowerCase().includes('rain') ||
          item.title.toLowerCase().includes('water')
        );
        
        // 预加载优先级音频
        if (priorityAudios.length > 0) {
          console.log("开始预加载优先级音频...");
          await audioPreloader.preloadBatch(priorityAudios, 'high');
        }
        
        // 延迟预加载其他音频
        setTimeout(async () => {
          const otherAudios = audioData.filter(item => 
            !priorityAudios.find(priority => priority.src === item.src)
          );
          
          if (otherAudios.length > 0) {
            console.log("开始预加载其他音频...");
            await audioPreloader.preloadBatch(otherAudios, 'low');
          }
          
          // 最后预加载音乐（通常使用频率较低）
          if (musicData.length > 0) {
            console.log("开始预加载音乐...");
            await audioPreloader.preloadBatch(musicData.slice(0, 10), 'low'); // 只预加载前10首
          }
        }, 3000);
        
        console.log("音频预加载初始化完成");
      } catch (error) {
        console.warn("音频预加载初始化失败:", error);
      }
    };
    
    // 延迟初始化，避免阻塞页面加载
    const timer = setTimeout(initializePreloading, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 这个组件不渲染任何内容
  return null;
}
