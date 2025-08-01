const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Project = require('../models/Project');
const Developer = require('../models/Developer');
const Manager = require('../models/Manager');

// Email transporter (reuse credentials from projectController.js)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'khanbasha7777777@gmail.com',
        pass: 'hpdi qrqk plrn blzz'
    }
});

// HTML email template generator
function generateProjectReminderEmail({ project, daysLeft, isOverdue }) {
    const relatedDocsLinks = project.relatedDocs && project.relatedDocs.length
        ? project.relatedDocs.map((doc, i) => `<li style='margin-bottom:4px;'><a href="${doc}" style='color:#007bff;text-decoration:none;'>Document ${i + 1}</a></li>`).join('')
        : '<li>No related documents.</li>';
    const statusColor = isOverdue ? '#dc3545' : '#ffc107';
    const statusText = isOverdue ? `Overdue by ${-daysLeft} day(s)` : `${daysLeft} day(s) left`;
    return `
    <div style="background:#f4f6fb;padding:40px 0;min-height:100vh;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
        <div style="background:#007bff;padding:0;text-align:center;">
          <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80" alt="Project Reminder" style="width:100%;max-height:140px;object-fit:cover;">
        </div>
        <div style="padding:32px 28px 24px 28px;">
          <h2 style="color:#222;margin-top:0;margin-bottom:8px;font-size:1.6rem;">Project Reminder</h2>
          <div style="margin-bottom:18px;">
            <span style="display:inline-block;padding:6px 16px;border-radius:16px;background:${statusColor};color:#fff;font-weight:600;font-size:1rem;">${statusText}</span>
          </div>
          <p style="margin:0 0 18px 0;font-size:1.1rem;">Hi Team Member,</p>
          <div style="background:#f8fafc;padding:18px 18px 10px 18px;border-radius:8px;margin-bottom:18px;">
            <table style="width:100%;font-size:1rem;">
              <tr><td style="font-weight:600;padding:4px 0;width:120px;">Title:</td><td>${project.title}</td></tr>
              <tr><td style="font-weight:600;padding:4px 0;">Description:</td><td>${project.description}</td></tr>
              <tr><td style="font-weight:600;padding:4px 0;">Deadline:</td><td>${new Date(project.deadline).toLocaleDateString()}</td></tr>
              <tr><td style="font-weight:600;padding:4px 0;">Status:</td><td>${project.status}</td></tr>
            </table>
          </div>
          <div style="margin-bottom:18px;">
            <b style="font-size:1.08rem;">Related Documents:</b>
            <ul style="margin:8px 0 0 18px;padding:0;list-style:square;">${relatedDocsLinks}</ul>
          </div>
          <p style="margin:0 0 18px 0;">Please take the necessary actions to ensure timely completion.</p>
        </div>
        <div style="background:#f1f3f7;padding:16px 28px;text-align:center;">
          <p style="margin:0;font-size:0.98rem;color:#888;">Best regards,<br><b>Project Management System</b></p>
        </div>
      </div>
    </div>
    `;
}

// Exportable function for manual/test triggering
async function sendProjectRemindersNow() {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        // Find projects with deadline within next 7 days or overdue
        const projects = await Project.find({
            $or: [
                { deadline: { $gte: today, $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) } },
                { deadline: { $lt: today } }
            ]
        });
        for (const project of projects) {
            const deadline = new Date(project.deadline);
            deadline.setHours(0,0,0,0);
            const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            // Get developer emails
            const developers = await Developer.find({ _id: { $in: project.assignedTo } });
            const developerEmails = developers.map(dev => dev.email);
            // Get manager emails for these developers
            const managers = await Manager.find({ 'developers.developerId': { $in: project.assignedTo } });
            const managerEmails = managers.map(mgr => mgr.email);
            // Combine and deduplicate
            const allEmails = Array.from(new Set([...developerEmails, ...managerEmails]));
            if (allEmails.length === 0) continue;
            // Send email
            const mailOptions = {
                from: 'khanbasha7777777@gmail.com',
                to: allEmails.join(', '),
                subject: isOverdue
                    ? `Overdue Project: ${project.title} (Deadline was ${deadline.toLocaleDateString()})`
                    : `Project Deadline Approaching: ${project.title} (${daysLeft} day(s) left)` ,
                html: generateProjectReminderEmail({ project, daysLeft, isOverdue })
            };
            await transporter.sendMail(mailOptions);
            console.log(`[Manual Trigger] Reminder sent for project '${project.title}' to: ${allEmails.join(', ')}`);
        }
        return { success: true, message: 'Reminders sent (if any projects matched criteria).' };
    } catch (error) {
        console.error('Error in manual project reminder trigger:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendProjectRemindersNow };

// Keep the cron job as well
cron.schedule('0 8 * * *', async () => {
    await sendProjectRemindersNow();
}); 