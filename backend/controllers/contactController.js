const Contact = require("../models/Contact");
const { sendContactNotification } = require("../services/mailService");
const { NotFoundError } = require("../utils/errors");

// POST - Send message (public)
const sendMessage = async (req, res) => {
    const contact = await Contact.create(req.body);

    // Fire-and-forget — don't fail the request if mail is down
    try {
        await sendContactNotification(contact);
    } catch (mailError) {
        console.error("Contact notification email failed:", {
            contactId: contact._id,
            senderEmail: contact.email,
            error: mailError.message,
        });
    }

    res.status(201).json({ success: true, message: "Message sent successfully" });
};

// GET - All messages (admin only)
const getMessages = async (req, res) => {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
};

// PATCH - Mark message as read (admin only)
const markAsRead = async (req, res) => {
    const message = await Contact.findByIdAndUpdate(
        req.params.id,
        { read: true },
        { new: true },
    );
    if (!message) {
        throw new NotFoundError("Message not found");
    }
    res.json({ success: true, message });
};

// DELETE - Delete message (admin only)
const deleteMessage = async (req, res) => {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) {
        throw new NotFoundError("Message not found");
    }
    res.status(204).end();
};

module.exports = { sendMessage, getMessages, markAsRead, deleteMessage };

