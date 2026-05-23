import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, ImagePlus, RefreshCw, ShieldCheck, Sparkles, UploadCloud, Wand2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { createMockIdPhoto } from './photoMock';
import { defaultPhotoSpecId, getPhotoSpec, photoSpecs, type PhotoSpecId } from './photoSpecs';

type Step = 'welcome' | 'upload' | 'processing' | 'result';
type PhotoBackground = 'white' | 'blue' | 'red';

const backgroundOptions: Array<{ id: PhotoBackground; label: string; value: string; accent: string }> = [
  { id: 'white', label: '白底', value: '#f8fafc', accent: '#e2e8f0' },
  { id: 'blue', label: '蓝底', value: '#2f80ed', accent: '#9dccff' },
  { id: 'red', label: '红底', value: '#e53935', accent: '#ffb3ad' },
];

const stepLabels = ['上传照片', '智能处理', '下载成片'];

function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [background, setBackground] = useState<PhotoBackground>('blue');
  const [selectedSpecId, setSelectedSpecId] = useState<PhotoSpecId>(defaultPhotoSpecId);
  const [error, setError] = useState('');

  const selectedBackground = useMemo(
    () => backgroundOptions.find((item) => item.id === background) ?? backgroundOptions[1],
    [background],
  );
  const selectedSpec = useMemo(() => getPhotoSpec(selectedSpecId), [selectedSpecId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) {
      setError('请上传 JPG、PNG 或 WebP 格式的照片');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('文件格式不正确，请选择图片文件');
      return;
    }

    setSelectedFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    noClick: true,
  });

  const generatePhoto = async () => {
    if (!originalUrl) {
      setError('请先上传一张照片');
      return;
    }

    setStep('processing');
    await new Promise((resolve) => window.setTimeout(resolve, 1800));
    const transformedUrl = await createMockIdPhoto(originalUrl, selectedBackground.value, selectedSpec);
    setResultUrl(transformedUrl);
    setStep('result');
  };

  const resetFlow = () => {
    setStep('upload');
    setSelectedFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setError('');
  };

  const downloadPhoto = () => {
    if (!resultUrl) return;

    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `qingzhengzhao-${selectedSpec.fileSlug}-${background}.png`;
    link.click();
  };

  return (
    <main className="app-shell">
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      <nav className="topbar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={20} /></div>
          <span>轻证照</span>
        </div>
        <div className="trust-pill"><ShieldCheck size={16} /> 本地预览 · Mock 生成</div>
      </nav>

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <Screen key="welcome">
            <section className="hero-grid">
              <div className="hero-copy">
                <motion.div className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  标准规格 · 前端预览
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  选择规格，生成一张清爽的证件照
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  先选择 1寸、2寸或小二寸规格，再上传照片并选择常用底色。当前版本使用前端 mock 跑通制作体验，后续可接入真实处理接口。
                </motion.p>
                <motion.div className="hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <button className="primary-button" onClick={() => setStep('upload')}>
                    开始制作证件照 <Wand2 size={18} />
                  </button>
                  <span className="microcopy">支持 1寸 / 2寸 / 小二寸 · JPG / PNG / WebP</span>
                </motion.div>
              </div>

              <motion.div className="preview-card" initial={{ opacity: 0, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}>
                <div className="sample-photo">
                  <div className="sample-head" />
                  <div className="sample-body" />
                </div>
                <div className="spec-preview-stack">
                  {photoSpecs.map((spec) => (
                    <div className="spec-preview-row" key={spec.id}>
                      <span>{spec.label}</span>
                      <strong>{spec.pixelSize}</strong>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>
          </Screen>
        )}

        {step === 'upload' && (
          <Screen key="upload">
            <section className="workspace">
              <StepHeader active={0} />
              <div className="panel-grid">
                <div className="glass-panel upload-panel">
                  <div {...getRootProps()} className={`dropzone ${isDragActive ? 'is-active' : ''} ${originalUrl ? 'has-image' : ''}`}>
                    <input {...getInputProps()} />
                    {originalUrl ? (
                      <img src={originalUrl} alt="上传的原始照片" />
                    ) : (
                      <div className="dropzone-empty">
                        <UploadCloud size={44} />
                        <h2>{isDragActive ? '松开即可上传' : '拖拽照片到这里'}</h2>
                        <p>建议上传正面半身照，光线均匀、脸部无遮挡</p>
                      </div>
                    )}
                  </div>
                  <button className="secondary-button" onClick={open}>
                    <ImagePlus size={18} /> {selectedFile ? '重新选择照片' : '选择照片'}
                  </button>
                  {selectedFile && (
                    <p className="file-name">已准备好生成：{selectedFile.name}</p>
                  )}
                  {error && <p className="error-text">{error}</p>}
                </div>

                <div className="glass-panel settings-panel">
                  <span className="section-kicker">制作参数</span>
                  <h2>选择证件照规格</h2>
                  <p>规格决定导出的画布尺寸；底色用于模拟常见证件照背景。</p>
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
                  <div className="option-group-title">选择背景色</div>
                  <div className="color-options">
                    {backgroundOptions.map((item) => (
                      <button
                        key={item.id}
                        className={`color-option ${background === item.id ? 'selected' : ''}`}
                        onClick={() => setBackground(item.id)}
                        type="button"
                      >
                        <span style={{ background: item.value, borderColor: item.accent }} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <button className="primary-button wide" onClick={generatePhoto} disabled={!originalUrl}>
                    生成证件照 <Sparkles size={18} />
                  </button>
                </div>
              </div>
            </section>
          </Screen>
        )}

        {step === 'processing' && (
          <Screen key="processing">
            <section className="processing-card glass-panel">
              <StepHeader active={1} />
              <div className="scanner">
                <div className="scanner-line" />
                {originalUrl && <img src={originalUrl} alt="正在处理" />}
              </div>
              <h2>正在生成你的证件照</h2>
              <p>正在校准人像位置、应用 {selectedSpec.label} 规格，并替换为{selectedBackground.label}。</p>
              <div className="processing-steps">
                {['校准人像位置', `应用 ${selectedSpec.label} 规格`, `替换${selectedBackground.label}`, '生成可下载照片'].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="progress-bar"><span /></div>
            </section>
          </Screen>
        )}

        {step === 'result' && resultUrl && originalUrl && (
          <Screen key="result">
            <section className="workspace">
              <StepHeader active={2} />
              <div className="result-grid">
                <PhotoCompare title="原图" src={originalUrl} />
                <PhotoCompare title="证件照效果" src={resultUrl} highlight />
              </div>
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
              <div className="result-actions">
                <button className="secondary-button" onClick={resetFlow}><RefreshCw size={18} /> 重新制作</button>
                <button className="primary-button" onClick={downloadPhoto}><Download size={18} /> 下载 {selectedSpec.label}证件照</button>
              </div>
            </section>
          </Screen>
        )}
      </AnimatePresence>
    </main>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function StepHeader({ active }: { active: number }) {
  return (
    <div className="step-header">
      {stepLabels.map((label, index) => (
        <div className={`step-item ${index <= active ? 'active' : ''}`} key={label}>
          <span>{index + 1}</span>
          {label}
        </div>
      ))}
    </div>
  );
}

function PhotoCompare({ title, src, highlight = false }: { title: string; src: string; highlight?: boolean }) {
  return (
    <div className={`glass-panel photo-compare ${highlight ? 'highlight' : ''}`}>
      <div className="compare-title">{title}</div>
      <img src={src} alt={title} />
    </div>
  );
}

export default App;
