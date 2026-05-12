import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { sendEmail, generateApplicationConfirmationEmail, generateNewApplicationNotificationEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const jobId = formData.get('jobId') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const linkedin = formData.get('linkedin') as string;
    const portfolio = formData.get('portfolio') as string;
    const resume = formData.get('resume') as File | null;

    // Validation
    if (!name || !email || !jobId) {
      return NextResponse.json(
        { error: 'Name, email, and job selection are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await prisma.job.findFirst({
      where: { id: jobId, status: 'Active' },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or no longer accepting applications' },
        { status: 404 }
      );
    }

    // Handle resume upload
    let resumeUrl = null;
    let resumeText = null;

    if (resume && resume.size > 0) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resume.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Please upload PDF or Word document.' },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      if (resume.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size too large. Maximum 5MB allowed.' },
          { status: 400 }
        );
      }

      // Save file
      const bytes = await resume.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = join(process.cwd(), 'uploads', 'resumes');
      await mkdir(uploadDir, { recursive: true });
      
      const fileName = `${Date.now()}-${resume.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      resumeUrl = `/uploads/resumes/${fileName}`;
      
      // For now, store filename as resumeText (can be enhanced with PDF parsing later)
      resumeText = resume.name;
    }

    // Check if candidate already exists
    let candidate = await prisma.candidate.findUnique({
      where: { email },
    });

    if (candidate) {
      // Update existing candidate
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          name,
          phone: phone || candidate.phone,
          resumeUrl: resumeUrl || candidate.resumeUrl,
          resumeText: resumeText || candidate.resumeText,
          source: 'Career Portal',
        },
      });
    } else {
      // Create new candidate
      candidate = await prisma.candidate.create({
        data: {
          name,
          email,
          phone,
          resumeUrl,
          resumeText,
          source: 'Career Portal',
        },
      });
    }

    // Check if already applied to this job
    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: candidate.id,
        jobId: jobId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: jobId,
        stage: 'Applied',
      },
    });

    // Update job applicant count
    await prisma.job.update({
      where: { id: jobId },
      data: { applicants: { increment: 1 } },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        type: 'candidate_added',
        payload: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
          jobId: jobId,
          jobTitle: job.title,
          source: 'Career Portal',
        }),
      },
    });

    // Send confirmation email to candidate
    const confirmationEmail = generateApplicationConfirmationEmail(name, job.title);
    await sendEmail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
      text: confirmationEmail.text,
    });

    // Send notification email to hiring team
    const notificationEmail = generateNewApplicationNotificationEmail(
      name,
      email,
      job.title,
      candidate.id
    );
    await sendEmail({
      to: process.env.HIRING_TEAM_EMAIL || process.env.SMTP_USER || 'hiring@company.com',
      subject: notificationEmail.subject,
      html: notificationEmail.html,
      text: notificationEmail.text,
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id,
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
