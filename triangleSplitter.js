/* eslint-env browser */
import { addPNG } from './utils.js';

/* -- Helpers ------------------------------------------------------------ */
const mkCanvas = (w, h = w) => Object.assign(document.createElement('canvas'), { width: w, height: h });

const makeMasks = (N, band) => {
    const diagMask = (dir, size = N) => {
        const c = mkCanvas(size), ctx = c.getContext('2d');
        const d = ctx.createImageData(size, size), buf = d.data;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const t = dir > 0 ? y - x : x + y - (size - 1);
                if (t >= 0 && t < band) buf.set([255, 255, 255, 255], (y * size + x) << 2);
            }
        }
        ctx.putImageData(d, 0, 0);
        return c;
    };

    const row = mkCanvas(N); row.getContext('2d').fillRect(0, 0, N, band);
    const col = mkCanvas(N); col.getContext('2d').fillRect(0, 0, band, N);
    const dSize = Math.ceil(N * Math.SQRT2);
    return { row, col, dA: diagMask(+1), dB: diagMask(-1, N*2) };
};

const normTriangle = (img, diag) => {
    const N = img.width;
    const make = () => {
        const c = mkCanvas(N), ctx = c.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(0, N); ctx.lineTo(N, N); ctx.lineTo(0, 0);
        ctx.closePath(); ctx.clip();
        return [c, ctx];
    };

    const [top, ttx] = make(), [bot, btx] = make();
    if (diag === 'main') {
        ttx.drawImage(img, 0, 0);
        btx.translate(N, N); btx.rotate(Math.PI); btx.drawImage(img, 0, 0);
    } else {
        btx.translate(N, 0); btx.rotate(Math.PI / 2); btx.drawImage(img, 0, 0);
        ttx.translate(0, N); ttx.rotate(-Math.PI / 2); ttx.drawImage(img, 0, 0);
    }
    return { bot, top };
};

/* -- Reusable series exporter ------------------------------------------- */
const exportMaskSeries = async (tri, whichCode, mask, dx, dy, endStep, name, step, zip, flat, ox = 0, oy = 0) => {
    const N = tri.width;
    const tmp = mkCanvas(N), ctx = tmp.getContext('2d');

    for (let o = 0, i = 0; o < endStep; o += step, i++) {
        ctx.clearRect(0, 0, N, N);
        ctx.drawImage(tri, 0, 0);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(mask, ox + dx(o), oy + dy(o));

        const path = flat
            ? `${whichCode}_${name}_${i}.png`
            : `Triangle ${whichCode}/${name}/${i}.png`;
        await addPNG(tmp, path, zip, true);
        ctx.globalCompositeOperation = 'source-over';
    }
};

/* -- Main exporter ------------------------------------------------------ */
export async function exportAllStrips(img) {
    output.innerHTML = '';
    const N = +resizeInput.value || img.width;
    const step = +stripSize.value;
    const diag = document.querySelector('[name="diag"]:checked').value;
    const flat = singleFolder?.checked;

    const src = mkCanvas(N); src.getContext('2d').drawImage(img, 0, 0, N, N);
    const { bot, top } = normTriangle(src, diag);
    const { row, col, dA, dB } = makeMasks(N, step);
    const zip = new JSZip();
    const offset = Math.floor(-1 * N);
    const tasks = [
        ['A', bot],
        ['B', top]
    ].flatMap(([whichCode, tri]) => [

        exportMaskSeries(tri, whichCode, row, _ => 0, i => i, tri.width, flat ? 'h' : 'horizontal', step, zip, flat),
        exportMaskSeries(tri, whichCode, col, i => i, _ => 0, tri.height, flat ? 'v' : 'vertical', step, zip, flat),
        exportMaskSeries(tri, whichCode, dA, _ => 0, i => i, tri.width, flat ? 'da' : 'diag_A', step, zip, flat),
        exportMaskSeries(tri, whichCode, dB, _ => 0, i => i, tri.width*2, flat ? 'db' : 'diag_B', step, zip, flat, offset, offset),
    ]);

    await Promise.all(tasks);

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: 'sprites.zip',
        textContent: '⬇️ Download ZIP',
        className: 'btn btn-outline-primary my-4'
    });
    const target = document.querySelector('body > div.container.py-5 > div');
    target.querySelector('a[download="sprites.zip"]')?.remove();
    target.appendChild(a);
}