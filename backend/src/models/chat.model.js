import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New chat",
      trim: true
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Chat", chatSchema);
