/**
 * Resume AI Parser Page
 * ======================
 * Client-side PDF parsing powered by PDF.js.
 * Automatically extracts name, contact info, skills, education, and experience
 * from uploaded resumes and allows review before saving to the candidate database.
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FileText, Sparkles, User, Mail, Phone, Briefcase,
  GraduationCap, CheckCircle, X, Download, AlertTriangle, Plus, Edit3,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from '@/components/providers/LocaleProvider';

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}

// ---------------------------------------------------------------------------
// Client-side PDF.js — loaded from CDN for maximum compatibility
// ---------------------------------------------------------------------------
const PDFJS_VER = '3.11.174';
const CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VER}`;

async function loadPDFJS(): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `${CDN}/pdf.min.js`;
    s.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.worker.min.js`;
      resolve(lib);
    };
    s.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(s);
  });
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await loadPDFJS();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: `${CDN}/cmaps/`,
    cMapPacked: true,
  }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item: any) => typeof item.str === 'string')
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
}

// ---------------------------------------------------------------------------
// Quality helpers
// ---------------------------------------------------------------------------
function isCleanString(str: string): boolean {
  if (!str || str.length < 2) return false;
  const printable = str.replace(/[^\x20-\x7E]/g, '');
  return printable.length > str.length * 0.7;
}

function getConfidence(text: string): 'high' | 'medium' | 'low' {
  if (!text || text.length < 30) return 'low';
  const words = text.split(/\s+/).filter(w => w.length >= 2);
  if (words.length < 5) return 'low';
  const readable = words.filter(w => /^[a-zA-Z0-9'.@,\-+()/]+$/.test(w));
  const ratio = readable.length / words.length;
  if (ratio > 0.55) return 'high';
  if (ratio > 0.3) return 'medium';
  return 'low';
}

function isValidName(n: string): boolean {
  if (!n || n.length < 3 || n.length > 55) return false;
  if (!isCleanString(n)) return false;
  if (!/[aeiouAEIOU]/.test(n)) return false;
  const alpha = n.replace(/[^a-zA-Z]/g, '');
  return alpha.length >= n.replace(/\s/g, '').length * 0.75;
}

// ---------------------------------------------------------------------------
// Skills list
// ---------------------------------------------------------------------------
const SKILL_KEYWORDS = [
  'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','Ruby','PHP','Swift','Kotlin',
  'React','Angular','Vue','Next.js','Node.js','Express','NestJS','Django','Flask','Spring Boot','Laravel','.NET',
  'AWS','Azure','GCP','Docker','Kubernetes','Terraform','CI/CD','Jenkins','GitHub Actions',
  'PostgreSQL','MySQL','MongoDB','Redis','Elasticsearch','GraphQL','REST','gRPC',
  'Tailwind','SASS','CSS','HTML','Git','Linux','Agile','Scrum','Kanban',
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','NLP',
  'Figma','Sketch','Adobe XD','Photoshop','Illustrator',
  'SQL','NoSQL','Firebase','Supabase','Prisma','Webpack','Vite',
  'Redux','Zustand','RxJS','Socket.io',
  'Microservices','System Design','Data Structures','Algorithms',
  'SEO','Google Analytics','Jira','Confluence',
  'Excel','Tableau','Power BI',
  'Leadership','Team Management','Project Management','Communication',
];

// ---------------------------------------------------------------------------
// Parse structured data from extracted text
// ---------------------------------------------------------------------------
function parseResumeText(text: string, fileName: string): { data: ParsedResume; confidence: 'high' | 'medium' | 'low' } {
  const confidence = getConfidence(text);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();

  // ---- Name ----
  let name = '';
  if (confidence !== 'low') {
    for (const line of lines.slice(0, 10)) {
      const clean = line.replace(/[^a-zA-Z\s.'-]/g, '').trim();
      const words = clean.split(/\s+/);
      if (
        words.length >= 2 && words.length <= 5 &&
        clean.length > 3 && clean.length < 50 &&
        !line.includes('@') && !/\d{3}/.test(line) &&
        !/^(summary|experience|education|skills|objective|profile|contact|phone|email|address|resume|cv|curriculum)/i.test(clean) &&
        isValidName(clean)
      ) {
        name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        break;
      }
    }
  }
  if (!name || !isValidName(name)) {
    name = fileName
      .replace(/\.pdf$/i, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/resume|cv|curriculum\s*vitae/gi, '')
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'Candidate';
  }

  // ---- Email ----
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  // ---- Phone (contextual extraction) ----
  let phone = '';
  const phoneCtx = text.match(/(?:phone|tel|mobile|cell|contact)[:\s|]*([+\d\s.()\-]{10,20})/i);
  if (phoneCtx) {
    phone = phoneCtx[1].trim();
  } else {
    const phoneFmt = text.match(/(\+\d{1,3}[\s.\-])?\(?\d{3}\)[\s.\-]\d{3}[\s.\-]\d{4}/);
    if (phoneFmt) phone = phoneFmt[0];
    else {
      const phoneAlt = text.match(/(\+\d{1,3}[\s.\-])\d{4,5}[\s.\-]\d{4,6}/);
      if (phoneAlt) phone = phoneAlt[0];
    }
  }
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || /^20[12]\d{7}$/.test(phoneDigits)) phone = '';

  // ---- Skills ----
  const skills: string[] = [];
  for (const skill of SKILL_KEYWORDS) {
    if (lower.includes(skill.toLowerCase())) skills.push(skill);
  }

  // ---- Section extractor ----
  const extractSection = (headers: RegExp, stops: RegExp, maxLines = 10): string => {
    const idx = lines.findIndex(l => headers.test(l));
    if (idx < 0) return '';
    const out: string[] = [];
    for (let i = idx + 1; i < Math.min(idx + maxLines + 1, lines.length); i++) {
      if (stops.test(lines[i])) break;
      if (lines[i].length > 2 && isCleanString(lines[i])) out.push(lines[i]);
    }
    return out.join('\n').slice(0, 500).trim();
  };

  let experience = extractSection(
    /^(experience|employment|work\s*history|professional\s*experience)/i,
    /^(education|skills|certif|project|summary|objective|reference|awards)/i, 12,
  );
  if (!experience) {
    const ym = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|in\s)/i);
    if (ym) experience = `${ym[1]}+ years of professional experience`;
  }

  let education = extractSection(
    /^(education|academic|qualifications)/i,
    /^(experience|skills|certif|project|summary|objective|reference|awards)/i, 8,
  );
  if (!education) {
    const dm = text.match(/(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Tech|M\.?Tech|MBA|Associate)[^.\n]{5,80}/i);
    if (dm && isCleanString(dm[0])) education = dm[0].trim();
  }

  let summary = extractSection(
    /^(summary|profile|objective|about\s*me|professional\s*summary)/i,
    /^(experience|education|skills|certif|project)/i, 5,
  );
  if (!summary && skills.length > 0) {
    summary = `Professional with expertise in ${skills.slice(0, 4).join(', ')}.`;
  }

  return {
    confidence,
    data: {
      name,
      email,
      phone,
      skills: skills.slice(0, 15),
      experience: isCleanString(experience) ? experience : '',
      education: isCleanString(education) ? education : '',
      summary: isCleanString(summary) ? summary : '',
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function ResumeParserPage() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [editData, setEditData] = useState<ParsedResume | null>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('high');
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // ---- File select ----
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    setFile(selected);
    await parseResume(selected);
  };

  // ---- Parse ----
  const parseResume = async (pdfFile: File) => {
    setParsing(true);
    try {
      const text = await extractTextFromPDF(pdfFile);
      const { data, confidence: conf } = parseResumeText(text, pdfFile.name);
      setEditData(data);
      setConfidence(conf);
      if (conf === 'low') {
        toast.warning('Limited text extraction', 'This PDF may use custom fonts. Please edit the fields manually.');
      } else if (conf === 'medium') {
        toast.info('Resume parsed', 'Some fields may need corrections — please review.');
      } else {
        toast.success('Resume parsed successfully', 'Review and edit the data below before saving.');
      }
    } catch {
      // Fallback to server-side
      try {
        const fd = new FormData();
        fd.append('file', pdfFile);
        const res = await fetch('/api/resume-parse', { method: 'POST', body: fd });
        if (res.ok) {
          const d = await res.json();
          setEditData(d);
          setConfidence('medium');
          toast.info('Parsed with server fallback', 'Please review the fields.');
        } else throw new Error();
      } catch {
        toast.error('Failed to parse resume', 'Please try a different PDF file.');
      }
    } finally {
      setParsing(false);
    }
  };

  // ---- Helpers ----
  const update = (field: keyof ParsedResume, value: string | string[]) => {
    if (editData) setEditData({ ...editData, [field]: value });
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || !editData || editData.skills.includes(s)) return;
    update('skills', [...editData.skills, s]);
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    if (editData) update('skills', editData.skills.filter(x => x !== skill));
  };

  const clearFile = () => { setFile(null); setEditData(null); };

  const saveToDatabase = async () => {
    if (!editData) return;
    if (!editData.name.trim() || !editData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
          source: 'Resume Parser',
          experience: parseInt(editData.experience) || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }
      toast.success('Candidate added to database');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save candidate');
    } finally {
      setSaving(false);
    }
  };

  const exportJSON = () => {
    if (!editData) return;
    const blob = new Blob([JSON.stringify(editData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editData.name.replace(/\s+/g, '_')}_resume.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON exported');
  };

  const confBadge = {
    high: { text: 'High confidence', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle },
    medium: { text: 'Please verify fields', cls: 'text-amber-700 bg-amber-50 border-amber-200', icon: Edit3 },
    low: { text: 'Manual editing needed', cls: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle },
  };
  const Badge = confBadge[confidence];

  const inputCls = 'w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all bg-white';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
          <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Resume AI Parser</h1>
          <p className="text-stone-500">Extract candidate data automatically from PDF resumes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Left — Upload / Edit */}
        <div className="space-y-4">
          {!editData ? (
            <div className="p-8 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                {parsing ? (
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="w-8 h-8 text-brand-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                {parsing ? 'AI is analyzing your resume...' : 'Upload Resume'}
              </h3>
              <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
                {parsing
                  ? 'Extracting skills, experience, education, and contact info'
                  : 'Drop a PDF resume here or click to browse. Our AI will automatically extract key information.'}
              </p>
              {!parsing && (
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-brand-700 transition-colors">
                  <Upload className="w-5 h-5" />
                  Choose PDF File
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                </label>
              )}
              <p className="text-xs text-stone-400 mt-4">Supports PDF files up to 10 MB</p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
              {/* Header + confidence */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">AI Parsed Data</h3>
                    <p className="text-xs text-stone-500">From {file?.name}</p>
                  </div>
                </div>
                <button onClick={clearFile} className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium mb-5 ${Badge.cls}`}>
                <Badge.icon className="w-3.5 h-3.5" />
                {Badge.text}
              </div>

              {/* Editable fields */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase mb-1.5">
                    <User className="w-3.5 h-3.5 text-brand-500" /> Full Name
                  </label>
                  <input value={editData.name} onChange={e => update('name', e.target.value)} className={inputCls} placeholder="Candidate name" />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase mb-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-500" /> Email
                    </label>
                    <input type="email" value={editData.email} onChange={e => update('email', e.target.value)} className={inputCls} placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase mb-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-500" /> Phone
                    </label>
                    <input type="tel" value={editData.phone} onChange={e => update('phone', e.target.value)} className={inputCls} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-brand-500" /> Skills Detected
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px]">
                    {editData.skills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-medium border border-brand-200">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    {editData.skills.length === 0 && <span className="text-xs text-stone-400 italic">No skills detected — add manually</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className={inputCls + ' flex-1'}
                      placeholder="Type a skill and press Enter..."
                    />
                    <button type="button" onClick={addSkill} className="px-3 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase mb-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-500" /> Experience
                  </label>
                  <textarea value={editData.experience} onChange={e => update('experience', e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="Work experience details..." />
                </div>

                {/* Education */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase mb-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-brand-500" /> Education
                  </label>
                  <textarea value={editData.education} onChange={e => update('education', e.target.value)} rows={2} className={inputCls + ' resize-none'} placeholder="Education details..." />
                </div>

                {/* Summary */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-500" /> Summary
                  </label>
                  <textarea value={editData.summary} onChange={e => update('summary', e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="Professional summary..." />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveToDatabase} disabled={saving}
                  className="flex-1 p-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save to Database'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportJSON}
                  className="flex-1 p-3 border border-stone-200 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export JSON
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              How It Works
            </h3>
            <div className="space-y-4">
              {[
                { n: '1', title: 'Upload PDF', desc: 'Select any candidate resume in PDF format' },
                { n: '2', title: 'AI Analysis', desc: 'Our AI extracts contact info, skills, experience, education' },
                { n: '3', title: 'Review & Edit', desc: 'Verify extracted data and make corrections if needed' },
                { n: '4', title: 'Save Profile', desc: 'Save the candidate to your database or export as JSON' },
              ].map(step => (
                <div key={step.n} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">{step.n}</div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{step.title}</p>
                    <p className="text-xs text-stone-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-4">Supported Data Fields</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Full Name','Email Address','Phone Number','Skills & Technologies','Work Experience','Education History','Certifications','Professional Summary'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-stone-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Parsing Tips</p>
                <ul className="text-xs text-amber-700 mt-1 space-y-1">
                  <li>• Text-based PDFs give the best results</li>
                  <li>• Scanned/image PDFs may require manual entry</li>
                  <li>• All extracted fields are fully editable</li>
                  <li>• Standard resume formats parse most accurately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
