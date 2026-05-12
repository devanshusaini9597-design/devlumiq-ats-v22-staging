interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

// Create reusable transporter
const createTransporter = async () => {
  // Dynamic import to avoid webpack issues
  const nodemailer = await import('nodemailer');
  
  // Use SMTP credentials from environment variables
  return nodemailer.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: options.from || `"${process.env.FROM_NAME || 'Recruitment Team'}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Template for application confirmation to candidate
export function generateApplicationConfirmationEmail(
  candidateName: string,
  jobTitle: string
): { subject: string; html: string; text: string } {
  const subject = `Application Received - ${jobTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .job-title { background: #e0f2fe; color: #0369a1; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 600; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ðŸŽ‰ Application Received!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${candidateName}</strong>,</p>
          <p>Thank you for applying for the position:</p>
          <div class="job-title">${jobTitle}</div>
          <p>We have received your application and our team is reviewing it carefully. We aim to get back to all applicants within <strong>5 business days</strong>.</p>
          <p>In the meantime, feel free to explore more about our company and culture.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://devlumiq.vercel.app'}" class="button">Visit Our Website</a>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Recruitment Team. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${candidateName},

Thank you for applying for the ${jobTitle} position.

We have received your application and our team is reviewing it carefully. We aim to get back to all applicants within 5 business days.

Best regards,
Recruitment Team
  `;

  return { subject, html, text };
}

// Template for notification to hiring team
export function generateNewApplicationNotificationEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  jobId: string
): { subject: string; html: string; text: string } {
  const subject = `New Application: ${candidateName} for ${jobTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Application</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details h3 { margin-top: 0; color: #0d9488; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ðŸ“¨ New Application Received</h1>
        </div>
        <div class="content">
          <p>A new candidate has applied for a position.</p>
          <div class="details">
            <h3>Candidate Details</h3>
            <div class="detail-row">
              <span><strong>Name:</strong></span>
              <span>${candidateName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Email:</strong></span>
              <span>${candidateEmail}</span>
            </div>
            <div class="detail-row">
              <span><strong>Position:</strong></span>
              <span>${jobTitle}</span>
            </div>
            <div class="detail-row">
              <span><strong>Applied:</strong></span>
              <span>${new Date().toLocaleString()}</span>
            </div>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://devlumiq.vercel.app'}/dashboard/candidates/${jobId}" class="button">View in Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Application Received

Candidate: ${candidateName}
Email: ${candidateEmail}
Position: ${jobTitle}
Applied: ${new Date().toLocaleString()}

View in Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://devlumiq.vercel.app'}/dashboard/candidates/${jobId}
  `;

  return { subject, html, text };
}
