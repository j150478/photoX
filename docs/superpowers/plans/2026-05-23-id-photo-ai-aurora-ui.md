# ID Photo AI Aurora UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing ID photo maker into a polished AI Aurora-style frontend while making regulated ID photo specs like 1寸、2寸、小二寸 the primary configuration.

**Architecture:** Keep the app as a single Vite React page with the existing four-state flow: welcome, upload, processing, result. Move ID photo spec data and mock canvas generation into small utility modules so UI code stays focused and output dimensions can be tested without browser driving. Keep backend integration out of scope.

**Tech Stack:** React, TypeScript, Vite, Framer Motion, react-dropzone, lucide-react, Canvas API, CSS.

---

## File Structure

- Create `src/photoSpecs.ts`
  - Owns the ID photo spec data and types.
  - Exports `photoSpecs`, `defaultPhotoSpecId`, `getPhotoSpec`, and related types.
- Create `src/photoMock.ts`
  - Owns image loading and canvas-based mock ID photo generation.
  - Exports `createMockIdPhoto(imageUrl, backgroundColor, spec)`.
- Modify `src/App.tsx`
  - Imports photo specs and mock generator.
  - Adds `selectedSpecId` state.
  - Updates welcome, upload, processing, result, and download copy to use spec-first UI.
- Modify `src/styles.css`
  - Upgrades visual system to AI Aurora style.
  - Adds styles for spec cards, Aurora background, processing steps, and result summary.
- No backend files are created.
- No routing is introduced.

---

### Task 1: Extract ID Photo Spec Data

**Files:**
- Create: `src/photoSpecs.ts`
- Modify: none
- Test: manual TypeScript build in Task 5

- [ ] **Step 1: Create the spec data module**

Create `src/photoSpecs.ts` with this complete content:

```ts
export type PhotoSpecId = 'one-inch' | 'two-inch' | 'small-two-inch';

export type PhotoSpec = {
  id: PhotoSpecId;
  label: string;
  title: string;
  description: string;
  pixelSize: string;
  width: number;
  height: number;
  fileSlug: string;
};

export const photoSpecs: PhotoSpec[] = [
  {
    id: 'one-inch',
    label: '1寸',
    title: '常用报名资料',
    description: '适合报名、资料提交等常见场景',
    pixelSize: '295 × 413 px',
    width: 295,
    height: 413,
    fileSlug: '1-inch',
  },
  {
    id: 'two-inch',
    label: '2寸',
    title: '证书申请材料',
    description: '适合证书、申请表、档案材料',
    pixelSize: '413 × 579 px',
    width: 413,
    height: 579,
    fileSlug: '2-inch',
  },
  {
    id: 'small-two-inch',
    label: '小二寸',
    title: '考试签证资料',
    description: '适合部分考试、签证或资料场景',
    pixelSize: '390 × 567 px',
    width: 390,
    height: 567,
    fileSlug: 'small-2-inch',
  },
];

export const defaultPhotoSpecId: PhotoSpecId = 'one-inch';

export function getPhotoSpec(id: PhotoSpecId): PhotoSpec {
  return photoSpecs.find((spec) => spec.id === id) ?? photoSpecs[0];
}
```

- [ ] **Step 2: Sanity check file exports**

Run:

```bash
npm run build
```

Expected: build may fail because the new module is not imported yet only if there is a syntax error. If it fails, the error should point to `src/photoSpecs.ts`; fix syntax only.

- [ ] **Step 3: Commit if this is a git repository**

Run:

```bash
git status --short
```

If the project is a git repository, commit only this file:

```bash
git add src/photoSpecs.ts
git commit -m "feat: add id photo spec data"
```

If this is not a git repository, skip the commit step.

---

### Task 2: Extract Mock Photo Generation

**Files:**
- Create: `src/photoMock.ts`
- Modify: `src/App.tsx`
- Test: manual TypeScript build in Task 5

- [ ] **Step 1: Create the mock generation module**

Create `src/photoMock.ts` with this complete content:

```ts
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
```

- [ ] **Step 2: Update imports in `src/App.tsx`**

At the top of `src/App.tsx`, add imports:

```ts
import { createMockIdPhoto } from './photoMock';
import { defaultPhotoSpecId, getPhotoSpec, photoSpecs, type PhotoSpecId } from './photoSpecs';
```

Remove the local `createMockIdPhoto` and `loadImage` functions from the bottom of `src/App.tsx` after all callers have been updated in later tasks.

- [ ] **Step 3: Do not change behavior yet**

Keep `generatePhoto` compiling by temporarily passing the 2寸 spec when calling the extracted function:

```ts
const transformedUrl = await createMockIdPhoto(
  originalUrl,
  selectedBackground.value,
  getPhotoSpec('two-inch'),
);
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: PASS. The UI should behave the same as before, using the extracted generator.

- [ ] **Step 5: Commit if this is a git repository**

Run:

```bash
git status --short
```

If the project is a git repository, commit only these files:

```bash
git add src/App.tsx src/photoMock.ts
git commit -m "refactor: extract mock id photo generation"
```

If this is not a git repository, skip the commit step.

---

### Task 3: Add Spec-First UI State and Copy

**Files:**
- Modify: `src/App.tsx`
- Test: manual TypeScript build in Task 5, Playwright verification in Task 6

- [ ] **Step 1: Add selected spec state**

Inside `App`, after `background` state, add:

```ts
const [selectedSpecId, setSelectedSpecId] = useState<PhotoSpecId>(defaultPhotoSpecId);
```

After `selectedBackground`, add:

```ts
const selectedSpec = useMemo(() => getPhotoSpec(selectedSpecId), [selectedSpecId]);
```

- [ ] **Step 2: Update generation to use selected spec**

Replace the temporary generator call with:

```ts
const transformedUrl = await createMockIdPhoto(originalUrl, selectedBackground.value, selectedSpec);
```

- [ ] **Step 3: Update download filename**

Replace:

```ts
link.download = `qingzhengzhao-${background}.png`;
```

with:

```ts
link.download = `qingzhengzhao-${selectedSpec.fileSlug}-${background}.png`;
```

- [ ] **Step 4: Replace welcome copy**

In the welcome screen, change the eyebrow to:

```tsx
标准规格 · 前端预览
```

Change the heading to:

```tsx
选择规格，生成一张清爽的证件照
```

Change the paragraph to:

```tsx
先选择 1寸、2寸或小二寸规格，再上传照片并选择常用底色。当前版本使用前端 mock 跑通制作体验，后续可接入真实处理接口。
```

Change the microcopy to:

```tsx
支持 1寸 / 2寸 / 小二寸 · JPG / PNG / WebP
```

- [ ] **Step 5: Replace hero sample chips with spec preview**

Inside the `preview-card`, remove the two `floating-chip` elements and add this after `sample-photo`:

```tsx
<div className="spec-preview-stack">
  {photoSpecs.map((spec) => (
    <div className="spec-preview-row" key={spec.id}>
      <span>{spec.label}</span>
      <strong>{spec.pixelSize}</strong>
    </div>
  ))}
</div>
```

- [ ] **Step 6: Replace upload settings panel copy and add spec options**

In `settings-panel`, replace the heading with:

```tsx
选择证件照规格
```

Replace its paragraph with:

```tsx
规格决定导出的画布尺寸；底色用于模拟常见证件照背景。
```

Before `color-options`, insert:

```tsx
<div className="spec-options">
  {photoSpecs.map((spec) => (
    <button
      key={spec.id}
      className={`spec-option ${selectedSpecId === spec.id ? 'selected' : ''}`}
      onClick={() => setSelectedSpecId(spec.id)}
      type="button"
    >
      <span>{spec.label}</span>
      <strong>{spec.title}</strong>
      <small>{spec.pixelSize}</small>
      <em>{spec.description}</em>
    </button>
  ))}
</div>
```

Add a small label before the color options:

```tsx
<div className="option-group-title">选择背景色</div>
```

- [ ] **Step 7: Improve upload success feedback**

Replace:

```tsx
{selectedFile && <p className="file-name">已选择：{selectedFile.name}</p>}
```

with:

```tsx
{selectedFile && (
  <p className="file-name">已准备好生成：{selectedFile.name}</p>
)}
```

- [ ] **Step 8: Update processing content**

Replace the processing paragraph with:

```tsx
正在校准人像位置、应用 {selectedSpec.label} 规格，并替换为{selectedBackground.label}。
```

Add this after the paragraph and before `progress-bar`:

```tsx
<div className="processing-steps">
  {['校准人像位置', `应用 ${selectedSpec.label} 规格`, `替换${selectedBackground.label}`, '生成可下载照片'].map((item) => (
    <span key={item}>{item}</span>
  ))}
</div>
```

- [ ] **Step 9: Add result summary**

In result screen, after `result-grid` and before `result-actions`, add:

```tsx
<div className="result-summary glass-panel">
  <div>
    <span>当前规格</span>
    <strong>{selectedSpec.label}</strong>
    <small>{selectedSpec.pixelSize}</small>
  </div>
  <div>
    <span>背景色</span>
    <strong>{selectedBackground.label}</strong>
    <small>标准证件照底色预览</small>
  </div>
  <div>
    <span>输出格式</span>
    <strong>PNG</strong>
    <small>前端 mock 生成</small>
  </div>
</div>
```

Change the download button text from:

```tsx
下载 PNG
```

to:

```tsx
下载 {selectedSpec.label}证件照
```

- [ ] **Step 10: Run build**

Run:

```bash
npm run build
```

Expected: PASS. If it fails, fix TypeScript errors in `src/App.tsx` only.

- [ ] **Step 11: Commit if this is a git repository**

Run:

```bash
git status --short
```

If the project is a git repository, commit only changed source files:

```bash
git add src/App.tsx
git commit -m "feat: add spec-first id photo flow"
```

If this is not a git repository, skip the commit step.

---

### Task 4: Upgrade AI Aurora Visual System

**Files:**
- Modify: `src/styles.css`
- Test: browser visual check in Task 6

- [ ] **Step 1: Replace app shell background**

In `src/styles.css`, replace the `.app-shell` background block with:

```css
.app-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 28px clamp(18px, 4vw, 56px) 56px;
  background:
    linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.72)),
    linear-gradient(90deg, rgba(18,103,255,0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(18,103,255,0.05) 1px, transparent 1px),
    radial-gradient(circle at 15% 18%, rgba(56, 189, 248, 0.34), transparent 30%),
    radial-gradient(circle at 86% 5%, rgba(139, 92, 246, 0.28), transparent 35%),
    radial-gradient(circle at 60% 92%, rgba(34, 211, 238, 0.18), transparent 30%),
    linear-gradient(135deg, #f8fbff 0%, #eef5ff 50%, #f7f2ff 100%);
  background-size: auto, 42px 42px, 42px 42px, auto, auto, auto, auto;
}
```

- [ ] **Step 2: Add aurora motion**

Add after `.orb-b`:

```css
.orb-a,
.orb-b {
  animation: auroraFloat 9s ease-in-out infinite alternate;
}

.orb-b {
  animation-delay: -3s;
}
```

Add this keyframe near the other keyframes:

```css
@keyframes auroraFloat {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(18px, -14px, 0) scale(1.08); }
}
```

- [ ] **Step 3: Upgrade glass panels**

Replace the `.preview-card, .glass-panel` block with:

```css
.preview-card,
.glass-panel {
  border: 1px solid rgba(255, 255, 255, 0.78);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(245, 249, 255, 0.58));
  box-shadow: 0 30px 90px rgba(50, 75, 120, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(26px);
}
```

- [ ] **Step 4: Add spec preview styles**

Remove `.floating-chip`, `.chip-blue`, and `.chip-white` blocks.

Add:

```css
.spec-preview-stack {
  display: grid;
  gap: 10px;
  margin-top: 22px;
}

.spec-preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(18, 103, 255, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.64);
}

.spec-preview-row span {
  color: #123052;
  font-weight: 900;
}

.spec-preview-row strong {
  color: #64748b;
  font-size: 13px;
}
```

- [ ] **Step 5: Add spec option styles**

Add after `.settings-panel p`:

```css
.spec-options {
  display: grid;
  gap: 12px;
  margin-top: 22px;
}

.spec-option {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 6px 12px;
  width: 100%;
  padding: 16px;
  text-align: left;
  color: #253852;
  border: 1px solid rgba(96, 131, 173, 0.16);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.62);
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.spec-option:hover {
  transform: translateY(-2px);
}

.spec-option span {
  grid-row: span 2;
  display: grid;
  min-width: 54px;
  height: 54px;
  place-items: center;
  color: white;
  border-radius: 18px;
  background: linear-gradient(135deg, #1267ff, #7b61ff);
  font-weight: 900;
}

.spec-option strong {
  align-self: end;
  font-size: 15px;
}

.spec-option small {
  justify-self: end;
  color: #1267ff;
  font-weight: 800;
}

.spec-option em {
  grid-column: 2 / 4;
  color: #64748b;
  font-size: 13px;
  font-style: normal;
}

.spec-option.selected {
  border-color: rgba(18, 103, 255, 0.44);
  box-shadow: 0 18px 42px rgba(18, 103, 255, 0.16);
}

.option-group-title {
  margin-top: 24px;
  color: #123052;
  font-size: 14px;
  font-weight: 900;
}
```

- [ ] **Step 6: Include spec options in hover selector**

Replace:

```css
.primary-button:hover,
.secondary-button:hover,
.color-option:hover {
  transform: translateY(-2px);
}
```

with:

```css
.primary-button:hover,
.secondary-button:hover,
.color-option:hover,
.spec-option:hover {
  transform: translateY(-2px);
}
```

- [ ] **Step 7: Add processing step styles**

Add after `.processing-card p` styles or near `.progress-bar`:

```css
.processing-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 22px;
}

.processing-steps span {
  padding: 10px 8px;
  color: #315174;
  border: 1px solid rgba(18, 103, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  font-size: 13px;
  font-weight: 800;
}
```

- [ ] **Step 8: Add result summary styles**

Add before `.result-actions`:

```css
.result-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.result-summary div {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.56);
}

.result-summary span,
.result-summary small {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.result-summary strong {
  display: block;
  margin: 5px 0;
  color: #123052;
  font-size: 20px;
}
```

- [ ] **Step 9: Add responsive adjustments**

Inside `@media (max-width: 900px)`, add:

```css
.processing-steps,
.result-summary {
  grid-template-columns: 1fr 1fr;
}
```

Inside `@media (max-width: 560px)`, add:

```css
.spec-option {
  grid-template-columns: 1fr;
}

.spec-option span,
.spec-option em,
.spec-option small {
  grid-column: auto;
  justify-self: start;
}

.processing-steps,
.result-summary {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 10: Run build**

Run:

```bash
npm run build
```

Expected: PASS. If it fails, fix CSS syntax or TypeScript issues introduced by class name mismatches.

- [ ] **Step 11: Commit if this is a git repository**

Run:

```bash
git status --short
```

If the project is a git repository, commit only the stylesheet:

```bash
git add src/styles.css
git commit -m "style: upgrade id photo aurora ui"
```

If this is not a git repository, skip the commit step.

---

### Task 5: Full Build Verification

**Files:**
- Modify: none unless build fails
- Test: project build

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected output includes:

```text
✓ built
```

- [ ] **Step 2: If build creates disposable artifacts, clean them after browser verification**

Do not clean `dist`, `.playwright-mcp`, or TypeScript build info yet if Task 6 still needs browser verification. Clean them only after Task 6 is complete if the user wants the workspace clean.

---

### Task 6: Browser Verification

**Files:**
- Create temporary test image only if one is not available.
- Remove temporary test image after verification.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite serves the app at `http://localhost:5173/` or the next available port.

- [ ] **Step 2: Create a local test image if needed**

If no image is available, create `/home/yz/pj/mypj/id-photo-test.png` with:

```bash
python3 - <<'PY'
import struct, zlib
w, h = 320, 420
rows = []
for y in range(h):
    row = bytearray()
    for x in range(w):
        bg = (225, 235, 250)
        cx, cy = w//2, 135
        face = ((x-cx)**2)/(58**2) + ((y-cy)**2)/(72**2) <= 1
        body = y > 240 and abs(x-cx) < 105 - (y-240)*0.12
        hair = y < 108 and ((x-cx)**2)/(62**2) + ((y-105)**2)/(40**2) <= 1
        color = bg
        if body:
            color = (35, 48, 72)
        if face:
            color = (244, 194, 166)
        if hair:
            color = (52, 38, 30)
        row.extend(color)
    rows.append(b'\x00' + bytes(row))
raw = b''.join(rows)
def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
open('/home/yz/pj/mypj/id-photo-test.png', 'wb').write(png)
PY
```

- [ ] **Step 3: Verify happy path in browser**

Use Playwright MCP:

1. Navigate to `http://localhost:5173/`.
2. Confirm homepage shows the new spec-first copy.
3. Click “开始制作证件照”.
4. Select “2寸”.
5. Select “红底”.
6. Upload `/home/yz/pj/mypj/id-photo-test.png`.
7. Confirm the page shows `已准备好生成` and the generate button is enabled.
8. Click “生成证件照”.
9. Wait for result page.
10. Confirm result summary shows `2寸`, `红底`, and `PNG`.
11. Click download.
12. Confirm downloaded filename is `qingzhengzhao-2-inch-red.png`.

- [ ] **Step 4: Verify adjacent reset path**

1. Click “重新制作”.
2. Confirm upload page returns.
3. Confirm generate button is disabled before uploading a new image.

- [ ] **Step 5: Check console**

Use Playwright console messages.

Expected: 0 errors and 0 warnings. Vite debug logs and React DevTools info are acceptable.

- [ ] **Step 6: Capture screenshot**

Capture a full-page screenshot of the result page and note its path in the final report.

- [ ] **Step 7: Clean temporary verification artifacts**

If created, remove:

```bash
rm -rf id-photo-test.png .playwright-mcp dist tsconfig.tsbuildinfo tsconfig.node.tsbuildinfo vite.config.js vite.config.d.ts
```

Do not remove source files or docs.

---

## Self-Review

- Spec coverage:
  - Full-flow visual upgrade: Task 4.
  - Spec-first UI with 1寸、2寸、小二寸: Tasks 1 and 3.
  - Mock generation uses selected dimensions: Task 2 and Task 3.
  - Result summary and download filename: Task 3.
  - Build and browser verification: Tasks 5 and 6.
- Placeholder scan: no TBD/TODO/implement-later placeholders remain.
- Type consistency:
  - `PhotoSpecId`, `PhotoSpec`, `selectedSpecId`, `selectedSpec`, and `createMockIdPhoto(imageUrl, backgroundColor, spec)` are defined before use.
  - Download filename uses `selectedSpec.fileSlug` and `background` consistently.
- Scope check: plan modifies only frontend source, styles, and docs; no backend or route changes.
