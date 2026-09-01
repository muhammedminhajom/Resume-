import { createContext, useContext, useState } from 'react';
import { makeEmptyResume } from '../lib/resume';

const ResumeContext = createContext(null);

export function ResumeProvider({ children, initial }) {
  const [resume, setResume] = useState(() => initial || makeEmptyResume());

  const value = {
    resume,
    setResume,
    replaceResume: (next) => setResume(next ?? makeEmptyResume()),
    setSection: (key, newValue) =>
      setResume((prev) => ({ ...prev, [key]: newValue })),
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
}