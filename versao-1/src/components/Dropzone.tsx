import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { motion } from 'motion/react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
  isLoading: boolean;
}

export function Dropzone({ onFilesSelected, files, onRemoveFile, isLoading }: DropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    disabled: isLoading
  } as any);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-sky-500 bg-sky-50/50' : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-sky-100 rounded-full text-sky-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-slate-700">
              Arraste e solte os relatórios em PDF aqui
            </p>
            <p className="text-sm text-slate-500 mt-1">
              ou clique para selecionar os arquivos (apenas .pdf)
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Arquivos selecionados ({files.length})</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file, index) => (
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600 truncate">{file.name}</span>
                </div>
                {!isLoading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(index);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
