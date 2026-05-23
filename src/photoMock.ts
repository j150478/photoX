import type { PhotoSpec } from './photoSpecs';

export async function createMockIdPhoto(
  imageUrl: string,
  backgroundColor: string,
  spec: PhotoSpec,
): Promise<string> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return imageUrl;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, spec.width, spec.height);

  const safeInset = Math.max(18, Math.round(Math.min(spec.width, spec.height) * 0.07));
  const scale = Math.max(spec.width / image.width, spec.height / image.height) * 0.86;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const dx = (spec.width - drawWidth) / 2;
  const dy = spec.height - drawHeight - Math.round(safeInset * 0.45);

  ctx.save();
  ctx.beginPath();
  addRoundedRectPath(
    ctx,
    safeInset,
    safeInset,
    spec.width - safeInset * 2,
    spec.height - safeInset * 2,
    Math.round(safeInset * 0.9),
  );
  ctx.clip();
  ctx.filter = 'saturate(1.08) contrast(1.04) brightness(1.03)';
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.56)';
  ctx.lineWidth = Math.max(4, Math.round(safeInset * 0.35));
  ctx.strokeRect(4, 4, spec.width - 8, spec.height - 8);

  return canvas.toDataURL('image/png');
}

function addRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const roundRect = ctx.roundRect;
  if (typeof roundRect === 'function') {
    roundRect.call(ctx, x, y, width, height, radius);
    return;
  }

  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
