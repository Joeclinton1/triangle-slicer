const testImages = [
  '/test-images/minecraft grass.png',
  '/test-images/grass.png',
  '/test-images/mud.png',
  '/test-images/chrome_cat.png',
  '/test-images/test texture.png'
];

export function setupImageLoader(onValidImage) {
  const input = document.getElementById('texture');
  const gallery = document.getElementById('gallery');

  const load = src => new Promise(res => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.src = src;
  });

  testImages.forEach(src => {
    const t = new Image();
    t.src = src;
    t.className = 'thumb rounded';
    t.style.imageRendering = 'pixelated';
    t.onclick = () => {
      input.value = '';
      load(src).then(img => {
        if (img.width !== img.height) return;
        onValidImage(img);
      });
    };
    gallery.appendChild(t);
  });

  input.onchange = () => {
    if (!input.files[0]) return;
    const url = URL.createObjectURL(input.files[0]);
    load(url).then(img => {
      if (img.width !== img.height) return;
      onValidImage(img);
      URL.revokeObjectURL(url);
    });
  };
}
