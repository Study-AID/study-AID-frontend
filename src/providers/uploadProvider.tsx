'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface LectureUploadData {
  lectureName: string;
  file: File | null;
  error: string | null;
  setLectureName: (name: string) => void;
  setFile: (file: File | null) => void;
  clear: () => void;
}

const LectureUploadContext = createContext<LectureUploadData | undefined>(
  undefined,
);

const ALLOWED_EXTS = ['pdf']; // 허용할 확장자 목록

export function LectureUploadProvider({ children }: { children: ReactNode }) {
  const [lectureName, setLectureName] = useState<string>('');
  const [file, _setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setFile = (file: File | null) => {
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTS.includes(ext)) {
        setError(
          `지원하지 않는 파일 형식입니다. (${ALLOWED_EXTS.join(
            ', ',
          )})만 업로드 가능합니다.`,
        );
        return;
      }
      setError(null);
      _setFile(file);
    } else {
      setError(null);
      _setFile(null);
    }
  };

  const clear = () => {
    setLectureName('');
    _setFile(null);
    setError(null);
  };

  return (
    <LectureUploadContext.Provider
      value={{ lectureName, file, error, setLectureName, setFile, clear }}
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
