import React, { useRef, useState } from 'react';
import { Upload, X, FileVideo, AlertCircle } from 'lucide-react';

interface VideoUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const MAX_SIZE_MB = 50; // Browser-based base64 uploads struggle with large files

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file (MP4, WebM, MOV).');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds the ${MAX_SIZE_MB}MB limit for this demo.`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      } else {
        // Reset input if invalid
        e.target.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const clearFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  if (selectedFile) {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileVideo className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="truncate">
              <p className="font-medium text-slate-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={clearFile}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="w-full bg-black rounded-lg overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
           <video 
             className="w-full h-full object-contain"
             src={URL.createObjectURL(selectedFile)} 
             controls 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out
          flex flex-col items-center justify-center text-center cursor-pointer
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 bg-white'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="video/mp4,video/webm,video/quicktime" 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        <div className="p-4 bg-indigo-50 rounded-full mb-4">
          <Upload className="w-8 h-8 text-indigo-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Upload Interview Recording</h3>
        <p className="text-slate-500 text-sm mb-4 max-w-xs">
          Drag and drop your video here, or click to browse.
          <br />
          <span className="text-xs text-slate-400 mt-2 block">(Max size: {MAX_SIZE_MB}MB)</span>
        </p>
        
        <div className="text-xs text-indigo-600 font-medium px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
          Supports MP4, WebM, MOV
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
