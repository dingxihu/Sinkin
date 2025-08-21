function getRandomColorChannel() {
  return Math.floor(Math.random() * 256);
}

export function getRandomColor() {
  const red = getRandomColorChannel();
  const green = getRandomColorChannel();
  const blue = getRandomColorChannel();
  return `rgb(${red},${green},${blue},0.1)`;
}
