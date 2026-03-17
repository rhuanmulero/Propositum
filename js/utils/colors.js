export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

export function updateColors(bg, brand, text) {
    document.getElementById('bgColor').value = bg;
    document.getElementById('brandColor').value = brand;
    document.getElementById('textColor').value = text;
    
    document.documentElement.style.setProperty('--bg-color', bg);
    document.documentElement.style.setProperty('--bg-rgb', hexToRgb(bg));
    document.documentElement.style.setProperty('--brand-color', brand);
    document.documentElement.style.setProperty('--brand-rgb', hexToRgb(brand));
    document.documentElement.style.setProperty('--text-color', text);
    document.documentElement.style.setProperty('--text-rgb', hexToRgb(text));
}