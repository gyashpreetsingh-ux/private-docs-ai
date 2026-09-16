import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface DropzoneProps {
  onUploadSuccess: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['.pdf', '.docx', '.txt', '.md'];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setIsUploading(true);

    const totalFiles = files.length;
    let completed = 0;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        setError(`"${file.name}" has an unsupported format. Allowed: PDF, DOCX, TXT, MD.`);
        setIsUploading(false);
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 25MB file limit.`);
        setIsUploading(false);
        return;
      }

      setUploadProgress(`Uploading ${i + 1} of ${totalFiles}: ${file.name}...`);
      try {
        await api.uploadDocument(file);
        completed++;
      } catch (err: any) {
        setError(err.message || `Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
    if (completed > 0) {
      onUploadSuccess();
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-slate-200">
              {isUploading
                ? uploadProgress
                : 'Click to browse or drag & drop private documents'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Supports PDF, DOCX, TXT, Markdown (up to 25MB each)
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            <span>Local & Private Document Ingestion Pipeline</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
