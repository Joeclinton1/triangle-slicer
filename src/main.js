import { setupImageLoader } from './imageLoader.js';
import { renderPreview } from './preview.js';
import { exportAllStrips } from './triangleSplitter.js';

let imgLoaded = null;

setupImageLoader(img => {
    imgLoaded = img;
    document.getElementById('resizeInput').value = img.width;
    const val = Math.max(1, Math.min(8, img.width >> 4)); // img.width / 16
    document.getElementById('stripSize').value = document.getElementById('stripSizeValue').textContent = val;
    renderPreview(img);
    document.getElementById('processBtn').disabled = false;
});

document.querySelectorAll('input[name="diag"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if (imgLoaded) renderPreview(imgLoaded);
    });
});

document.getElementById('processBtn').onclick = async () => {
    if (!imgLoaded) return;
    await exportAllStrips(imgLoaded);
};
