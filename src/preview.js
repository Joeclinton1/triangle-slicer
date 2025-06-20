/**
 * Draws a split-preview of the currently loaded image.
 * The image is divided into two triangles (main or anti-diagonal),
 * and the top triangle is flipped 180° to base-align with the bottom.
 */
export function renderPreview(imgLoaded) {
  if (!imgLoaded) return;

  const N = parseInt(document.getElementById('resizeInput').value) || imgLoaded.width;

  // Set up source canvas (with optional resize)
  const srcCan = document.createElement('canvas');
  srcCan.width = srcCan.height = N;
  const sctx = srcCan.getContext('2d', { willReadFrequently: true });
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(imgLoaded, 0, 0, N, N);

  // Full image data
  const full = sctx.getImageData(0, 0, N, N);
  const bot = new ImageData(new Uint8ClampedArray(full.data.length), N, N);
  const top = new ImageData(new Uint8ClampedArray(full.data.length), N, N);

  // Choose diagonal split
  const diag = document.querySelector('[name="diag"]:checked').value;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      const isBottom = diag === 'main' ? y >= x : y >= N - 1 - x;
      const dest = isBottom ? bot.data : top.data;
      dest[i] = full.data[i];
      dest[i + 1] = full.data[i + 1];
      dest[i + 2] = full.data[i + 2];
      dest[i + 3] = full.data[i + 3];
    }
  }

  // Bottom half canvas
  const bcan = document.createElement('canvas');
  bcan.width = bcan.height = N;
  bcan.getContext('2d').putImageData(bot, 0, 0);

  // Top half canvas (flipped 180°)
  const tcan = document.createElement('canvas');
  tcan.width = tcan.height = N;
  tcan.getContext('2d').putImageData(top, 0, 0);

  const flipCan = document.createElement('canvas');
  flipCan.width = flipCan.height = N;
  const fctx = flipCan.getContext('2d');
  fctx.translate(N, N);
  fctx.rotate(Math.PI);
  fctx.drawImage(tcan, 0, 0);

  // Final preview canvas
  const preview = document.getElementById('preview');
  preview.width = 2 * N;
  preview.height = N;
  const pctx = preview.getContext('2d');
  pctx.imageSmoothingEnabled = false;
  pctx.clearRect(0, 0, 2 * N, N);
  pctx.drawImage(bcan, 0, 0);
  pctx.drawImage(flipCan, N, 0);
}