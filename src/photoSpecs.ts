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
