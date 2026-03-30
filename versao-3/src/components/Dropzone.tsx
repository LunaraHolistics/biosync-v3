import { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface Props {
  onUpload: (file: File) => void;
}

export default function Dropzone({ onUpload }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const options = {
    onDrop: onDrop as any,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(options as any);

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-300 hover:border-emerald-400 hover:bg-neutral-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
        <UploadCloud size={32} />
      </div>
      <h3 className="text-lg font-medium text-neutral-900 mb-2">
        {isDragActive ? 'Solte o arquivo aqui...' : 'Arraste o laudo em PDF ou clique para selecionar'}
      </h3>
      <p className="text-sm text-neutral-500">
        Apenas arquivos PDF são suportados.
      </p>
    </div>
  );
}
