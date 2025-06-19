// utils.js

// Copy one pixel's RGBA values from `src[si]` to `dst[di]`
export function copyPixel(dst, di, src, si) {
    dst[di] = src[si];
    dst[di + 1] = src[si + 1];
    dst[di + 2] = src[si + 2];
    dst[di + 3] = src[si + 3];
}

/* utils.js ------------------------------------------------------------- */

/* ── create / find the nested folder containers ──────────────────────── */
export function ensureFolderDom(path) {
  const output = document.getElementById('output');
  let parent   = output;

  for (const segment of path.split('/')) {
    let div = parent.querySelector(`:scope > .folder[data-name="${segment}"]`);
    if (!div) {
      div = document.createElement('div');
      div.className = 'folder border p-3 mb-4 rounded bg-light';
      div.dataset.name = segment;
      div.innerHTML = `
        <h6 class="fw-bold mb-3">${segment}</h6>
        <div class="d-flex flex-wrap gap-2"></div>`;
      parent.appendChild(div);
    }
    parent = div.querySelector('div');       // inner flex box
  }
  return parent;                            // innermost flex container
}

export async function addPNG(canvas, path, zip, show = true) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  zip.file(path, blob);

  if (show) {
    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex align-items-center justify-content-center border rounded';
    wrapper.style.width = '64px';
    wrapper.style.height = '64px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.background = '#fff';

    const img = document.createElement('img');
    const url = URL.createObjectURL(blob);  // 🔒 unique per blob
    img.src = url;
    img.alt = path;
    img.style.imageRendering = 'pixelated';

    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const max = 48;
      if (w >= h) {
        img.style.width = `${max}px`;
        img.style.height = 'auto';
      } else {
        img.style.height = `${max}px`;
        img.style.width = 'auto';
      }

      URL.revokeObjectURL(url); // ✅ clean up after load
    };

    wrapper.appendChild(img);
    ensureFolderDom(path.substring(0, path.lastIndexOf('/'))).appendChild(wrapper);
  }
}
