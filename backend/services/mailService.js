const nodemailer = require("nodemailer");

const getMailConfig = () => ({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT || 465),
    secure: String(process.env.EMAIL_SECURE || "true").toLowerCase() === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const isMailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getNotificationRecipients = () =>
    process.env.CONTACT_NOTIFY_TO || "hemanth9886609@gmail.com";

const getFromAddress = () =>
    process.env.CONTACT_NOTIFY_FROM || process.env.EMAIL_USER;

const sendContactNotification = async(contact) => {
    if (!isMailConfigured()) {
        throw new Error("Email service is not configured. Missing EMAIL_USER or EMAIL_PASS.");
    }

    const transporter = nodemailer.createTransport(getMailConfig());
    const submittedAt = new Date(contact.createdAt || Date.now()).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    const text = [
        "New portfolio contact message",
        "",
        `Name: ${contact.name}`,
        `Email: ${contact.email}`,
        `Submitted: ${submittedAt}`,
        "",
        "Message:",
        contact.message
    ].join("\n");

    const html = `
        <h2>New portfolio contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
        <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
        <p><strong>Message:</strong></p>
        <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${escapeHtml(contact.message)}</pre>
    `;

    return transporter.sendMail({
        from: getFromAddress(),
        to: getNotificationRecipients(),
        replyTo: contact.email,
        subject: `New contact form message from ${contact.name}`,
        text,
        html
    });
};

const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

module.exports = { sendContactNotification };
