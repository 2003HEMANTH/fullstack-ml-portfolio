const Contact = require("../models/Contact");

// POST - Send message (public)
const sendMessage = async(req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const contact = await Contact.create({ name, email, message });
        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET - All messages (admin only)
const getMessages = async(req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH - Mark message as read (admin only)
const markAsRead = async(req, res) => {
    try {
        const message = await Contact.findByIdAndUpdate(
            req.params.id, { read: true }, { new: true }
        );
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE - Delete message (admin only)
const deleteMessage = async(req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        res.json({ success: true, message: "Message deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getMessages, markAsRead, deleteMessage };