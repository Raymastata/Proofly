import React, { useRef, useState } from 'react';
import { Maximize2, ScanLine } from 'lucide-react';

export function Dropzone({ onFile, className = '' }) {
  const inputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);

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
      <div className={`flex flex-col items-center justify-center ${dragActive ? 'animate-pulse' : ''}`}>
        <ScanLine size={64} strokeWidth={2.2} className="text-cyan-400 drop-shadow-lg mb-2" />
        <div className="mt-2 text-cyan-200 font-semibold text-lg select-none">
          Magic Scan: Drop or Click to Upload
        </div>
        <div className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, or Screenshot</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
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
