import nodemailer from "nodemailer";
import { env } from "../../config/env";
import { logger } from "../../logger";

// Create the transporter — this is the SMTP connection config
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS
  pool: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  connectionTimeout: 10000,
});

type ReminderEmailParams = {
  to: string;
  userName: string;
  task: string;
  assignee: string | null;
  dueDate: Date | null;
  meetingTitle: string;
  meetingId: string;
  type: "upcoming" | "overdue";
};

export async function sendReminderEmail(params: ReminderEmailParams) {
  const { to, userName, task, assignee, dueDate, meetingTitle, meetingId, type } = params;

  const dueDateStr = dueDate
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(dueDate)
    : "No due date";

  const isOverdue = type === "overdue";
  const subject = isOverdue
    ? `⚠️ Overdue: ${task}`
    : `🔔 Reminder: ${task} — due ${dueDateStr}`;

  const meetingUrl = `${env.WEB_URL}/dashboard/meetings/${meetingId}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;">
      <div style="padding: 24px; background: ${isOverdue ? '#fef2f2' : '#f0fdf4'}; border-radius: 12px; border: 1px solid ${isOverdue ? '#fecaca' : '#bbf7d0'};">
        <h2 style="margin: 0 0 8px; font-size: 18px; color: ${isOverdue ? '#991b1b' : '#166534'};">
          ${isOverdue ? '⚠️ Overdue Action Item' : '🔔 Upcoming Reminder'}
        </h2>
        <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
          Hey ${userName}, this is a reminder from Yapwrap.
        </p>

        <div style="background: white; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px; font-weight: 600; font-size: 15px;">${task}</p>
          <p style="margin: 0; font-size: 13px; color: #6b7280;">
            ${assignee ? `👤 ${assignee}` : 'Unassigned'}
            &nbsp;&middot;&nbsp;
            📅 ${dueDateStr}
            &nbsp;&middot;&nbsp;
            From: ${meetingTitle}
          </p>
        </div>

        <a href="${meetingUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
          View in Yapwrap →
        </a>
      </div>
      <p style="text-align: center; margin-top: 16px; font-size: 11px; color: #9ca3af;">
        Sent by Yapwrap • You're receiving this because you created this action item
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: "Yapwrap",
      to,
      subject,
      html,
    });

    logger.info({ event: "email.sent", messageId: info.messageId, to });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error({ event: "email.failed", error, to });
    return { success: false, messageId: null };
  }
}