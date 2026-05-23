import Chat from "../models/chat.model.js";
import { generateAIResponse } from "../services/gemini.service.js";

const allowedTones = ["Balanced", "Creative", "Technical"];

const buildTitle = (message) => {
  const compact = message.trim().replace(/\s+/g, " ");
  return compact.length > 48 ? `${compact.slice(0, 48)}...` : compact;
};

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const sendMessage = async (req, res) => {
  try {
    const { message, chatId, tone = "Balanced" } = req.body;
    const selectedTone = allowedTones.includes(tone) ? tone : "Balanced";

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    if (message.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Message must be 3000 characters or fewer"
      });
    }

    let chat;

    if (chatId) {
      if (!isValidObjectId(chatId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid chat id"
        });
      }

      chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found"
        });
      }
    }

    if (!chat) {
      chat = await Chat.create({
        title: buildTitle(message),
        messages: []
      });
    }

    chat.messages.push({
      role: "user",
      content: message.trim()
    });

    const aiReply = await generateAIResponse(chat.messages, selectedTone);

    chat.messages.push({
      role: "assistant",
      content: aiReply
    });

    await chat.save();

    res.status(200).json({
      success: true,
      chatId: chat._id,
      title: chat.title,
      reply: aiReply,
      messages: chat.messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const listChats = async (_req, res) => {
  try {
    const chats = await Chat.find()
      .select("title messages createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      chats: chats.map((chat) => ({
        _id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        lastMessage: chat.messages.at(-1)?.content || "",
        messageCount: chat.messages.length
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getChat = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat id"
      });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteChat = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat id"
      });
    }

    const chat = await Chat.findByIdAndDelete(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
