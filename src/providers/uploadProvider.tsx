'use client';

import { useParams, useRouter } from 'next/navigation';
import React, {
  ChangeEvent,
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

export interface LectureUploadData {
  lectureName: string;
  file: File | null;
  setLectureName: (name: string) => void;
  setFile: (file: File | null) => void;
  clear: () => void;
}

const LectureUploadContext = createContext<LectureUploadData | undefined>(
  undefined,
);

export function LectureUploadProvider({ children }: { children: ReactNode }) {
  const [lectureName, setLectureName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const clear = () => {
    setLectureName('');
    setFile(null);
  };

  return (
    <LectureUploadContext.Provider
      value={{ lectureName, file, setLectureName, setFile, clear }}
    >
      {children}
    </LectureUploadContext.Provider>
  );
}

export function useLectureUpload() {
  const context = useContext(LectureUploadContext);
  if (!context)
    throw new Error(
      'useLectureUpload must be used within LectureUploadProvider',
    );
  return context;
}
