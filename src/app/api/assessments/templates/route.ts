import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sample assessment templates for demo
const sampleTemplates = [
  {
    id: 'sample-1',
    name: 'Technical Skills Assessment - React',
    description: 'Evaluate candidate proficiency in React, TypeScript, and modern frontend development.',
    category: 'technical',
    type: 'QUIZ',
    duration: 45,
    difficulty: 'INTERMEDIATE',
    passingScore: 70,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    questions: [
      { id: 'q1', question: 'What is the purpose of useEffect hook?', type: 'MULTIPLE_CHOICE', options: ['State management', 'Side effects', 'Event handling', 'Style manipulation'], correctAnswer: 'Side effects', points: 10, sortOrder: 0 },
      { id: 'q2', question: 'Explain React Virtual DOM', type: 'TEXT', points: 15, sortOrder: 1 },
      { id: 'q3', question: 'What is TypeScript?', type: 'MULTIPLE_CHOICE', options: ['Database', 'Superset of JavaScript', 'CSS framework', 'Testing tool'], correctAnswer: 'Superset of JavaScript', points: 10, sortOrder: 2 },
    ],
    _count: { assignments: 12, questions: 3 }
  },
  {
    id: 'sample-2',
    name: 'Coding Challenge - Algorithms',
    description: 'Test problem-solving skills with algorithmic challenges.',
    category: 'coding',
    type: 'CODING',
    duration: 60,
    difficulty: 'ADVANCED',
    passingScore: 60,
    isActive: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    questions: [
      { id: 'q4', question: 'Implement binary search algorithm', type: 'CODE', language: 'javascript', points: 25, sortOrder: 0 },
      { id: 'q5', question: 'Solve the two-sum problem', type: 'CODE', language: 'javascript', points: 25, sortOrder: 1 },
    ],
    _count: { assignments: 8, questions: 2 }
  },
  {
    id: 'sample-3',
    name: 'Personality & Culture Fit',
    description: 'Assess cultural alignment and soft skills.',
    category: 'personality',
    type: 'PERSONALITY',
    duration: 30,
    difficulty: 'BEGINNER',
    passingScore: 50,
    isActive: true,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    questions: [
      { id: 'q6', question: 'How do you handle conflicts in a team?', type: 'TEXT', points: 20, sortOrder: 0 },
      { id: 'q7', question: 'Describe your ideal work environment', type: 'TEXT', points: 20, sortOrder: 1 },
    ],
    _count: { assignments: 15, questions: 2 }
  },
];

// GET /api/assessments/templates - Get assessment templates
export async function GET() {
  try {
    const templates = await prisma.assessmentTemplate.findMany({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { assignments: true, questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Return proper format with templates key
    if (!templates || templates.length === 0) {
      return NextResponse.json({ templates: sampleTemplates });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching assessment templates:', error);
    // Return sample data on error
    return NextResponse.json({ templates: sampleTemplates });
  }
}

// POST /api/assessments/templates - Create assessment template
export async function POST(request: Request) {
  try {
    const { name, description, category, type, duration, difficulty, passingScore, questions } = await request.json();

    const template = await prisma.assessmentTemplate.create({
      data: {
        name,
        description,
        category,
        type,
        duration,
        difficulty,
        passingScore,
        questions: {
          create: questions.map((q: any, index: number) => ({
            type: q.type,
            question: q.question,
            description: q.description,
            codeSnippet: q.codeSnippet,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            sortOrder: index,
            testCases: q.testCases,
            language: q.language,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating assessment template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
