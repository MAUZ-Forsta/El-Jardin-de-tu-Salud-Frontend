import { useRef, useState } from 'react';
import { ImageIcon, Link2, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalImage } from '../hooks';

interface Props {
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  aspect?: 'square' | 'wide';
  label?: string;
}

/**
 * Dual-mode image input: local file pick or URL paste.
 * Returns a data-URL for local files, a plain URL for typed input.
 */
export default function ImageUploader({ value, onChange, aspect = 'wide', label = 'Imagen' }: Props) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState(value.startsWith('http') ? value : '');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewH = aspect === 'square' ? 'aspect-square' : 'h-36';

  const { read: handleFile } = useLocalImage(onChange);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUrlCommit = () => {
    const url = urlInput.trim();
    if (url) onChange(url);
  };

  const clear = () => {
    onChange('');
    setUrlInput('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
        {/* Mode toggle */}
        <div className="flex gap-0.5 p-0.5 bg-gray-100 rounded-lg">
          {(['file', 'url'] as const).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all"
              style={mode === m
                ? { background: 'var(--card)', color: 'var(--brand-green)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: 'var(--brand-inactive)' }}>
              {m === 'file' ? <Upload className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
              {m === 'file' ? 'Archivo' : 'URL'}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {value && (
        <div className={`relative w-full ${previewH} mb-2 rounded-xl overflow-hidden bg-gray-100`}>
          <img src={value} alt="preview"
            className="w-full h-full object-cover"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <button type="button" onClick={clear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'file' ? (
          <motion.div key="file"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}>
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className="w-full flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all"
              style={{
                borderColor: dragging ? 'var(--brand-green)' : '#e5e7eb',
                background: dragging ? '#f0f7f0' : '#fafafa',
              }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: dragging ? '#f0f7f0' : '#f3f4f6' }}>
                {value
                  ? <Upload className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
                  : <ImageIcon className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600">
                  {dragging ? 'Suelta aquí' : 'Toca para seleccionar'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">o arrastra una imagen · JPG, PNG, WebP</p>
              </div>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </motion.div>
        ) : (
          <motion.div key="url"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="flex gap-2">
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onBlur={handleUrlCommit}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleUrlCommit(); } }}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none min-w-0"
            />
            <button type="button" onClick={handleUrlCommit}
              className="px-3 py-2.5 rounded-xl text-white text-xs font-semibold shrink-0"
              style={{ background: 'var(--brand-green)' }}>
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
