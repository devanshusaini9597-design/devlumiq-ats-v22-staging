import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { candidate, job, template, subject: preSubject, body: preBody } = data;

    const jobTitle = job?.title ?? candidate?.position ?? 'Position';
    const companyName = 'Devlumiq ATS';

    let finalSubject: string;
    let finalBody: string;

    // Case 1: frontend already pre-rendered subject + body (premium email page)
    if (typeof preSubject === 'string' && typeof preBody === 'string') {
      finalSubject = preSubject;
      finalBody = preBody;
    }
    // Case 2: template object with raw subject/body containing {{variables}} (candidates page)
    else if (template && typeof template === 'object' && typeof template.subject === 'string') {
      const interpolate = (s: string) =>
        s
          .replace(/\{\{candidateName\}\}/g, candidate?.name ?? '')
          .replace(/\{\{name\}\}/g, candidate?.name ?? '')
          .replace(/\{\{position\}\}/g, jobTitle)
          .replace(/\{\{companyName\}\}/g, companyName)
          .replace(/\{\{interviewDate\}\}/g, data.interviewDate || '[Date]')
          .replace(/\{\{interviewTime\}\}/g, data.interviewTime || '[Time]')
          .replace(/\{\{interviewerName\}\}/g, data.interviewerName || '[Interviewer]')
          .replace(/\{\{salary\}\}/g, data.salary || '[Salary]')
          .replace(/\{\{startDate\}\}/g, data.startDate || '[Start Date]');
      finalSubject = interpolate(template.subject);
      finalBody = interpolate(template.body ?? '');
    }
    // Fallback: generic message
    else {
      finalSubject = `Message for ${candidate?.name ?? 'candidate'}`;
      finalBody = 'Please see the details attached.';
    }

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For demo, we just return the composed email
    return NextResponse.json({
      success: true,
      email: {
        to: candidate?.email ?? '',
        subject: finalSubject,
        body: finalBody,
        sentAt: new Date().toISOString()
      }
    });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
