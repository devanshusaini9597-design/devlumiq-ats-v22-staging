/**
 * WhatsApp Templates Page
 * ========================
 * Pre-built WhatsApp message templates for candidate communications.
 * Templates use {{variableName}} syntax for dynamic substitution.
 * Messages can be previewed in a simulated chat UI before sending.
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Smartphone, CheckCircle, Clock, AlertCircle, CheckCheck, Zap, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { CandidateSelector } from '@/components/ui/CandidateSelector';
import { useLocale } from '@/components/providers/LocaleProvider';

const WHATSAPP_TEMPLATES = [
  {
    id: 'interview-reminder',
    name: 'Interview Reminder',
    emoji: '📅',
    message: `Hi {{candidateName}}, this is a reminder about your interview for {{position}} at {{companyName}} tomorrow at {{time}}. Please confirm your attendance by replying "YES". Good luck! 🚀`,
    category: 'Scheduling',
  },
  {
    id: 'offer-notification',
    name: 'Offer Notification',
    emoji: '🎉',
    message: `Congratulations {{candidateName}}! 🎊 We're delighted to offer you the {{position}} position at {{companyName}}. Salary: {{salary}}. Please check your email for the official offer letter. Reply to accept!`,
    category: 'Offers',
  },
  {
    id: 'screening-invite',
    name: 'Screening Invite',
    emoji: '📞',
    message: `Hello {{candidateName}}, we'd like to schedule a quick phone screening for the {{position}} role. Are you available this week? Please reply with your preferred time slots. Thanks!`,
    category: 'Screening',
  },
  {
    id: 'rejection-kind',
    name: 'Application Update',
    emoji: '🙏',
    message: `Hi {{candidateName}}, thank you for your interest in {{position}}. After careful consideration, we've decided to proceed with other candidates. We wish you the very best in your job search! 🌟`,
    category: 'Updates',
  },
  {
    id: 'document-request',
    name: 'Document Request',
    emoji: '📄',
    message: `Hi {{candidateName}}, for your {{position}} application, could you please share: 1) Updated resume, 2) Portfolio links, 3) Any certifications. Thank you! 📎`,
    category: 'Documents',
  },
  {
    id: 'welcome-onboard',
    name: 'Welcome Message',
    emoji: '🎊',
    message: `Welcome to {{companyName}}, {{candidateName}}! 🎉 We're thrilled to have you join us as {{position}}. Your first day is {{startDate}}. Check your email for onboarding details. See you soon! 🚀`,
    category: 'Onboarding',
  },
];

interface Candidate {
  id: string;
  name: string;
  phone?: string;
  position?: string;
  status?: string;
}

export default function WhatsAppTemplatesPage() {
  const { t } = useLocale();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(WHATSAPP_TEMPLATES[0]);
  const [message, setMessage] = useState(WHATSAPP_TEMPLATES[0].message);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const toast = useToast();

  // Template variables
  const [time, setTime] = useState('10:00 AM');
  const [salary, setSalary] = useState('$80,000/year');
  const [startDate, setStartDate] = useState('');

  const categories = ['All', ...Array.from(new Set(WHATSAPP_TEMPLATES.map(t => t.category)))];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/candidates', { credentials: 'include' });
      const data = await res.json();
      // Use real phone numbers from DB; candidates without a phone will show a placeholder
      const withPhone = (data.candidates || []).map((c: any) => ({
        ...c,
        phone: c.phone ?? null,
      }));
      setCandidates(withPhone);
      if (withPhone.length > 0) {
        setSelectedCandidate(withPhone[0]);
      }
    } catch {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template: typeof WHATSAPP_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setMessage(template.message);
  };

  const getProcessedMessage = () => {
    let processed = message;
    if (selectedCandidate) {
      processed = processed.replace(/\{\{candidateName\}\}/g, selectedCandidate.name);
      processed = processed.replace(/\{\{position\}\}/g, selectedCandidate.position || '[Position]');
      processed = processed.replace(/\{\{time\}\}/g, time);
      processed = processed.replace(/\{\{salary\}\}/g, salary);
      processed = processed.replace(/\{\{startDate\}\}/g, startDate || '[Date]');
      processed = processed.replace(/\{\{companyName\}\}/g, '[Your Company Name]');
    }
    return processed;
  };

  const sendWhatsApp = async () => {
    if (!selectedCandidate?.phone) {
      toast.error('This candidate has no phone number on file');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: selectedCandidate.phone,
          message: getProcessedMessage(),
          candidateId: selectedCandidate.id,
        }),
      });

      if (res.ok) {
        toast.success(`WhatsApp sent to ${selectedCandidate.name}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to send WhatsApp');
      }
    } catch {
      toast.error('Failed to send WhatsApp');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getProcessedMessage());
    toast.success('Message copied to clipboard');
  };

  const filteredTemplates = activeCategory === 'All' 
    ? WHATSAPP_TEMPLATES 
    : WHATSAPP_TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t('premium.whatsappTemplates.title')}</h1>
          <p className="text-stone-500">{t('premium.whatsappTemplates.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Left - Templates */}
        <div className="space-y-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-green-100 text-green-700'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-stone-200 hover:border-green-300 hover:bg-stone-50'
                }`}
              >
                <span className="text-2xl mb-2 block">{template.emoji}</span>
                <p className="font-semibold text-sm text-stone-900">{template.name}</p>
                <p className="text-xs text-stone-500 mt-1">{template.category}</p>
              </button>
            ))}
          </div>

          {/* Candidate Selection */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2 text-sm">
              Select Candidate
            </h3>
            <CandidateSelector
              candidates={candidates}
              selected={selectedCandidate}
              onSelect={(c) => {
                setSelectedCandidate(c as typeof selectedCandidate);
              }}
              subtitle="phone"
              placeholder={t('premium.emailTemplates.selectPlaceholder')}
            />
          </div>

          {/* Template Variables */}
          {selectedTemplate.id === 'interview-reminder' && (
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Interview Time
              </h3>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-green-500 outline-none"
              />
            </div>
          )}

          {(selectedTemplate.id === 'offer-notification' || selectedTemplate.id === 'welcome-onboard') && (
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Offer Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Salary</label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. $80,000/year"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-green-500 outline-none"
                  />
                </div>
                {selectedTemplate.id === 'welcome-onboard' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-green-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right - Preview */}
        <div className="space-y-4">
          {/* Phone Preview */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">WhatsApp Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-blue-400" />
                <span className="text-stone-400 text-xs">Read receipts on</span>
              </div>
            </div>

            {/* Chat bubbles */}
            <div className="bg-stone-100 rounded-2xl p-4 min-h-[300px] max-h-[400px] overflow-auto">
              {/* Time */}
              <div className="text-center text-xs text-stone-500 mb-4">
                Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Message bubble */}
              <div className="flex justify-end mb-4">
                <div className="bg-green-100 rounded-2xl rounded-tr-sm p-3 max-w-[80%] relative">
                  <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {getProcessedMessage()}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-stone-400">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Typing indicator */}
              {sending && (
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200" />
                  </div>
                  Sending...
                </div>
              )}
            </div>
          </div>

          {/* Message Editor */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Edit Message
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:border-green-500 outline-none resize-none"
            />
            <p className="text-xs text-stone-500 mt-2">
              Use {'{{'}variableName{'}}'} for dynamic content
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={sendWhatsApp}
              disabled={sending || !selectedCandidate?.phone}
              className="flex-1 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send WhatsApp
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyToClipboard}
              className="p-4 border border-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-colors flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Status */}
          {selectedCandidate && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                Ready to send to <strong>{selectedCandidate.name}</strong>
              </p>
            </div>
          )}

          {/* WhatsApp Business Info */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">WhatsApp Business API</h4>
                <p className="text-xs text-stone-600 mt-1">
                  Messages are sent through the official WhatsApp Business API. 
                  Templates must be pre-approved by Meta for business-initiated conversations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
