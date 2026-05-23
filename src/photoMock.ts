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
  ctx.roundRect(
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
