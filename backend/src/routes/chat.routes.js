import express from "express";
import {
  deleteChat,
  listChats,
  sendMessage,
  getChat
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", listChats);
router.post("/message", sendMessage);
router.get("/:id", getChat);
router.delete("/:id", deleteChat);

export default router;
