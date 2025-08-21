"use client";
import { useEffect, useState, useCallback } from "react";
import { getRandomColor } from "../utils/randomColor";

const BackgroundColorManager = () => {
  const [backgroundColor, setBackgroundColor] = useState(() =>
    getRandomColor()
  );

  const changeBackgroundColor = useCallback(() => {
    let newColor;
    // 确保新颜色与当前颜色不同
    do {
      newColor = getRandomColor();
    } while (newColor === backgroundColor);

    setBackgroundColor(newColor);
  }, [backgroundColor]);

  // 修改初始化和定时器设置
  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    // 应用初始颜色到 main 元素
    mainElement.style.transition = "background-color 2s ease";
    mainElement.style.backgroundColor = backgroundColor;

    const interval = setInterval(changeBackgroundColor, 5000);

    return () => {
      clearInterval(interval);
      if (mainElement) {
        mainElement.style.transition = "";
        mainElement.style.backgroundColor = "";
      }
    };
  }, [changeBackgroundColor, backgroundColor]);

  // 修改颜色变化监听
  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.style.backgroundColor = backgroundColor;
    }
  }, [backgroundColor]);

  // 用于调试
  useEffect(() => {
    console.log("Background color changed to:", backgroundColor);
  }, [backgroundColor]);

  return null;
};

export default BackgroundColorManager;
