import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, ScanLine } from 'lucide-react';

export function Dropzone({ onFile, className = '' }) {
  const inputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [iconPulse, setIconPulse] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setScanning(true);
      onFile(e.dataTransfer.files[0]);
      setTimeout(() => setScanning(false), 1200);
    }
  }

  function handleClick() {
    inputRef.current.click();
  }

  function handleChange(e) {
    if (e.target.files && e.target.files[0]) {
      setScanning(true);
      setIconPulse(true);
      setTimeout(() => setIconPulse(false), 600);
      onFile(e.target.files[0]);
      setTimeout(() => setScanning(false), 1200);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  return (
    <div
      className={`relative group rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: dragActive ? '0 0 32px 0 #a78bfa99' : '0 4px 32px 0 rgba(80,0,120,0.08)',
        border: dragActive ? '2.5px solid #a78bfa' : '2.5px solid rgba(255,255,255,0.08)',
        outline: dragActive ? '2px solid #a78bfa' : 'none',
        transition: 'box-shadow 0.2s, border 0.2s, outline 0.2s',
      }}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          animate={iconPulse ? { scale: [1, 1.08, 1] } : {}}
          className="mb-3"
        >
          <ScanLine size={40} strokeWidth={1.8} className="text-cyan-400 drop-shadow-lg" />
        </motion.div>
        <div className="mt-1 text-sm font-semibold text-slate-200 select-none tracking-tight">
          Upload Document
        </div>
        <div className="text-xs text-slate-500 mt-1.5 font-medium">PNG · JPG · PDF · WebP</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,.pdf"
        className="hidden"
        onChange={handleChange}
      />
      {scanning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyan-400/10 rounded-2xl animate-pulse z-10">
          <Maximize2 size={40} className="text-cyan-300 animate-pulse mb-2" />
          <div className="text-cyan-100 font-medium text-base">Scanning...</div>
          <div className="w-32 h-2 mt-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}
