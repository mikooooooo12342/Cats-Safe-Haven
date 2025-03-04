
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileInputProps {
  onChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxVideos?: number;
  existingFileCount?: number;
}

export const FileInput: React.FC<FileInputProps> = ({ 
  onChange, 
  multiple = false,
  accept = "image/*,video/*",
  maxVideos = 0,
  existingFileCount = 0
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const validateFiles = (filesArray: File[]) => {
    if (maxVideos > 0) {
      // Count how many videos we have
      const videoFiles = filesArray.filter(file => file.type.startsWith('video/'));
      
      if (videoFiles.length > maxVideos) {
        alert(`You can only upload a maximum of ${maxVideos} video${maxVideos > 1 ? 's' : ''}.`);
        return false;
      }
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      if (validateFiles(filesArray)) {
        onChange(filesArray);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      if (validateFiles(filesArray)) {
        onChange(filesArray);
      }
    }
  };

  return (
    <div 
      className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center ${
        dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Drag & drop files here, or click to select
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {multiple ? `Already selected: ${existingFileCount} files` : 'Upload one file'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2"
          type="button"
        >
          Select Files
        </Button>
      </div>
    </div>
  );
};
