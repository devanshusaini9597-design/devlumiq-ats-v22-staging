'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles, X, CheckCircle, Briefcase, GraduationCap, Mail, User } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ParsedData {
  name: string;
  email: string;
  skills: string[];
  experience: string;
  education: string;
}

interface ResumeParserProps {
  candidateId: string;
  onParsed?: (data: ParsedData) => void;
}

export function ResumeParserPanel({ candidateId, onParsed }: ResumeParserProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      parseResume(selected);
    } else if (selected) {
      toast.error('Please upload a PDF file');
    }
  };

  const parseResume = async (pdfFile: File) => {
    setParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string || '';
        const res = await fetch(`/api/candidates/${candidateId}/resume/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: pdfFile.name, rawText: text })
        });
        const data = await res.json();
        if (data.parsedData) {
          setParsed(data.parsedData);
          onParsed?.(data.parsedData);
          toast.success('Resume parsed with AI');
        } else {
          toast.error('Could not parse resume');
        }
      };
      reader.readAsText(pdfFile);
    } catch {
      toast.error('Failed to parse resume');
    } finally {
      setParsing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsed(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {!parsed ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-8 sm:p-12 text-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: parsing ? 0.95 : 1 }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
              {parsing ? (
                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-brand-600" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              {parsing ? 'AI is analyzing...' : 'Upload Resume'}
            </h3>
            <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
              {parsing 
                ? 'Extracting skills, experience, and contact info with AI' 
                : 'PDF format supported. AI will automatically extract key information.'}
            </p>
            
            {!parsing && (
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm cursor-pointer hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25">
                <FileText className="w-4 h-4" />
                Choose PDF File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header with clear button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">AI Parsed Data</h3>
                <p className="text-xs text-stone-500">Extracted from {file?.name}</p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Parsed Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-semibold text-stone-500 uppercase">Name</span>
              </div>
              <p className="font-semibold text-stone-900">{parsed.name}</p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-semibold text-stone-500 uppercase">Email</span>
              </div>
              <p className="font-semibold text-stone-900">{parsed.email}</p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-white sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-semibold text-stone-500 uppercase">Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsed.skills?.map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-gradient-to-r from-brand-100 to-teal-100 text-brand-700 rounded-lg text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-semibold text-stone-500 uppercase">Experience</span>
              </div>
              <p className="font-semibold text-stone-900">{parsed.experience}</p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-semibold text-stone-500 uppercase">Education</span>
              </div>
              <p className="font-semibold text-stone-900">{parsed.education}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
