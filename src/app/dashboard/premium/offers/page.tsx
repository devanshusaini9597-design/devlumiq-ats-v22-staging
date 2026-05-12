/**
 * Offer Letter Generator Page
 * ============================
 * Generates professional offer letters with dynamic candidate and role details.
 * Letters can be previewed, saved to the database, and downloaded as .txt files.
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, DollarSign, Calendar, Gift, Download, Save, CheckCircle, Briefcase } from 'lucide-react';
import { CandidateSelector } from '@/components/ui/CandidateSelector';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from '@/components/providers/LocaleProvider';

interface Candidate {
  id: string;
  name: string;
  email: string;
  position?: string;
}

export default function OfferLettersPage() {
  const { t } = useLocale();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  // Offer details
  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState('');
  const [benefits, setBenefits] = useState('Health Insurance, 401(k) matching, Flexible PTO, Remote work options');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [generatedLetter, setGeneratedLetter] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/candidates', { credentials: 'include' });
      const data = await res.json();
      setCandidates(data.candidates || []);
      if (data.candidates?.length > 0) {
        setSelectedCandidate(data.candidates[0]);
        setPosition(data.candidates[0].position || '');
      }
    } catch {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const selectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setPosition(candidate.position || '');
  };

  const generateLetter = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    const letter = `
OFFER OF EMPLOYMENT

Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

${selectedCandidate.name}
${selectedCandidate.email}

Dear ${selectedCandidate.name},

We are delighted to offer you the position of ${position || '[Position]'} at [Your Company Name]!

POSITION DETAILS
----------------
Position: ${position || '[Position]'}
Department: ${department}
Employment Type: ${employmentType}
Reporting To: Hiring Manager

COMPENSATION & BENEFITS
-----------------------
Base Salary: ${salary ? `${salary} ${currency} per year` : '[To be discussed]'}
Pay Schedule: Monthly

Benefits Package:
${benefits.split(',').map(b => `• ${b.trim()}`).join('\n')}

START DATE
----------
Expected Start Date: ${startDate || '[To be confirmed]'}

YOUR ROLE
---------
In this role, you will be responsible for contributing to our team's success and helping us build amazing products. We're excited to have you join our growing team!

NEXT STEPS
----------
To accept this offer:
1. Review this letter carefully
2. Sign and return the enclosed copy by ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
3. Complete the attached onboarding documents

If you have any questions, please don't hesitate to reach out to us.

We look forward to welcoming you to the [Your Company Name] team!

Sincerely,

HR Team
[Your Company Name]

---

Please sign below to indicate your acceptance:

Employee Signature: _________________________ Date: _____________
    `.trim();

    setGeneratedLetter(letter);
    toast.success('Offer letter generated');
  };

  const saveOffer = async () => {
    if (!selectedCandidate || !generatedLetter) {
      toast.error('Generate a letter first');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/offer-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          salary: salary || '0',
          currency,
          startDate: startDate || undefined,
          benefits,
          content: generatedLetter,
          status: 'draft',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }
      toast.success('Offer letter saved to database');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save offer letter');
    } finally {
      setGenerating(false);
    }
  };

  const downloadLetter = () => {
    if (!generatedLetter) return;
    
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Offer_Letter_${selectedCandidate?.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Offer letter downloaded');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
          <FileCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Offer Letter Generator</h1>
          <p className="text-stone-500">Create professional offer letters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - Form */}
        <div className="space-y-4">
          {/* Candidate Selection */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-3 text-sm">
              Select Candidate
            </h3>
            <CandidateSelector
              candidates={candidates}
              selected={selectedCandidate}
              onSelect={(c) => selectCandidate(c as Candidate)}
              subtitle="email"
            />
          </div>

          {/* Position Details */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              Position Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Position Title</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-500 outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-500 outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-600" />
              Compensation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-stone-600 mb-1">Annual Salary</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 80000"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-500 outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-brand-600" />
              Benefits
            </h3>
            <textarea
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-500 outline-none resize-none"
            />
            <p className="text-xs text-stone-500 mt-1">Separate benefits with commas</p>
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateLetter}
            className="w-full p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-2"
          >
            <FileCheck className="w-5 h-5" />
            Generate Offer Letter
          </motion.button>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand-600" />
              Preview
            </h3>
            {generatedLetter ? (
              <>
                <pre className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                  {generatedLetter}
                </pre>
                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveOffer}
                    disabled={generating}
                    className="flex-1 p-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save to Database
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadLetter}
                    className="flex-1 p-3 border border-stone-200 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="p-12 text-center border border-dashed border-stone-200 rounded-xl">
                <FileCheck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">Fill in the details and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
