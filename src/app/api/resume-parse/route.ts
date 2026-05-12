import { NextRequest, NextResponse } from 'next/server';

// -------------------------------------------------------------------
// Text quality check – detect garbled/encoded output
// -------------------------------------------------------------------
function isCleanText(text: string): boolean {
  if (!text || text.length < 30) return false;
  const words = text.split(/\s+/).filter(w => w.length >= 2);
  if (words.length < 5) return false;
  // Ratio of "readable" words (mostly alphabetic) to total words
  const readable = words.filter(w => /^[a-zA-Z'.,-]+$/.test(w));
  return readable.length / words.length > 0.35;
}

// Check if a single candidate name looks real
function isValidName(name: string): boolean {
  if (!name || name.length < 2 || name.length > 60) return false;
  // Must be mostly alphabetic
  const alpha = name.replace(/[^a-zA-Z]/g, '');
  if (alpha.length < name.replace(/\s/g, '').length * 0.7) return false;
  // Should contain vowels (real names do)
  if (!/[aeiouAEIOU]/.test(name)) return false;
  return true;
}

// -------------------------------------------------------------------
// SKILL KEYWORDS
// -------------------------------------------------------------------
const SKILL_KEYWORDS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'Spring Boot', 'Laravel', '.NET',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions', 'CircleCI',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'GraphQL', 'REST', 'gRPC',
  'Tailwind', 'SASS', 'CSS', 'HTML', 'Git', 'Linux', 'Agile', 'Scrum', 'Kanban',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch',
  'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
  'SQL', 'NoSQL', 'Firebase', 'Supabase', 'Prisma', 'Webpack', 'Vite', 'Babel',
  'Redux', 'Zustand', 'RxJS', 'Socket.io', 'WebSocket',
  'Microservices', 'System Design', 'Data Structures', 'Algorithms', 'Design Patterns',
  'SEO', 'Google Analytics', 'Salesforce', 'Jira', 'Confluence', 'Notion',
  'Excel', 'Tableau', 'Power BI', 'Looker',
  'Leadership', 'Team Management', 'Problem Solving', 'Project Management', 'Communication',
];

// -------------------------------------------------------------------
// Parse structured data from clean text
// -------------------------------------------------------------------
function parseFromText(text: string, fileName: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();

  // --- Name ---
  let name = '';
  for (const line of lines.slice(0, 8)) {
    const clean = line.replace(/[^a-zA-Z\s.'-]/g, '').trim();
    // A name line: 2–4 words, mostly alpha, not a section header
    const words = clean.split(/\s+/);
    if (
      words.length >= 2 && words.length <= 5 &&
      clean.length > 3 && clean.length < 50 &&
      !line.includes('@') && !/\d{3}/.test(line) &&
      !/^(summary|experience|education|skills|objective|profile|contact|phone|email|address)/i.test(clean) &&
      isValidName(clean)
    ) {
      name = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      break;
    }
  }

  // --- Email ---
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  // --- Phone ---
  const phonePatterns = [
    /(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
    /(\+\d{1,3}[\s.-]?)?\d{5}[\s.-]?\d{5}/,
    /(\+\d{1,2})[\s.-]\d{4,5}[\s.-]\d{4,6}/,
  ];
  let phone = '';
  for (const p of phonePatterns) {
    const m = text.match(p);
    if (m) { phone = m[0]; break; }
  }

  // --- Skills ---
  const skills: string[] = [];
  for (const skill of SKILL_KEYWORDS) {
    if (lower.includes(skill.toLowerCase())) skills.push(skill);
  }

  // --- Section extractor ---
  const extractSection = (headers: RegExp, stopHeaders: RegExp, maxLines = 10) => {
    const idx = lines.findIndex(l => headers.test(l));
    if (idx < 0) return '';
    const out: string[] = [];
    for (let i = idx + 1; i < Math.min(idx + maxLines + 1, lines.length); i++) {
      if (stopHeaders.test(lines[i])) break;
      if (lines[i].length > 2) out.push(lines[i]);
    }
    return out.join(' ').slice(0, 500).trim();
  };

  const stopRe = /^(experience|education|skills|certif|project|summary|objective|reference|contact|awards|publications|languages|interests)/i;

  // --- Experience ---
  let experience = extractSection(/^(experience|employment|work\s*history|professional\s*experience)/i, /^(education|skills|certif|project|summary|objective|reference|awards)/i, 12);
  if (!experience) {
    const yearsMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|in\s)/i);
    if (yearsMatch) experience = `${yearsMatch[1]}+ years of professional experience`;
  }

  // --- Education ---
  let education = extractSection(/^(education|academic|qualifications)/i, /^(experience|skills|certif|project|summary|objective|reference|awards)/i, 8);
  if (!education) {
    const degreeMatch = text.match(/(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Tech|M\.?Tech|MBA|Associate)[^.\n]{5,80}[.\n]/i);
    if (degreeMatch) education = degreeMatch[0].trim();
  }

  // --- Summary ---
  let summary = extractSection(/^(summary|profile|objective|about\s*me|professional\s*summary)/i, stopRe, 5);
  if (!summary && skills.length > 0) {
    summary = `Professional with expertise in ${skills.slice(0, 4).join(', ')}.`;
  }

  // --- Fallback name from filename ---
  if (!name || !isValidName(name)) {
    name = fileName
      .replace(/\.pdf$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/resume|cv|curriculum\s*vitae/gi, '')
      .trim();
    if (name) {
      name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  return {
    name: name || 'Candidate',
    email,
    phone,
    skills: skills.slice(0, 15),
    experience: experience || 'Could not extract experience section',
    education: education || 'Could not extract education section',
    summary: summary || 'Professional candidate — upload a text-based PDF for better parsing results.',
  };
}

// -------------------------------------------------------------------
// API Route
// -------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ----- Extract text with pdf-parse -----
    let text = '';
    let parseMethod = 'none';

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      text = (result.text || '').trim();
      parseMethod = 'pdf-parse';
    } catch (e) {
      console.warn('pdf-parse failed, trying fallback:', e);
    }

    // ----- Validate text quality -----
    const clean = isCleanText(text);

    if (!clean) {
      // Fallback: try to extract readable strings from binary
      const raw = buffer.toString('latin1');
      const parenthesized = raw.match(/\(([^\\)]{2,80})\)/g);
      if (parenthesized) {
        const chunks = parenthesized
          .map(b => b.slice(1, -1).replace(/\\(.)/g, '$1'))
          .filter(b => /[a-zA-Z]{2,}/.test(b) && b.length > 1);
        const fallbackText = chunks.join(' ');
        if (isCleanText(fallbackText)) {
          text = fallbackText;
          parseMethod = 'binary-fallback';
        }
      }
    }

    // ----- Always try to extract email/phone even from raw buffer -----
    let rawEmail = '';
    let rawPhone = '';
    const rawStr = buffer.toString('latin1');
    const em = rawStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (em) rawEmail = em[0].toLowerCase();
    const ph = rawStr.match(/(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    if (ph) rawPhone = ph[0];

    const parsed = parseFromText(isCleanText(text) ? text : '', file.name);

    // Merge raw-extracted email/phone if parser didn't find them
    if (!parsed.email && rawEmail) parsed.email = rawEmail;
    if (!parsed.phone && rawPhone) parsed.phone = rawPhone;

    return NextResponse.json({ ...parsed, _parseMethod: parseMethod, _textLength: text.length });
  } catch (error) {
    console.error('Resume parse error:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
