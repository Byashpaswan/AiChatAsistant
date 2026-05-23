# AI Assistant Chatbot

Portfolio-ready full-stack chatbot with a polished Angular interface, saved MongoDB conversations, and Gemini-powered responses.

Tech Stack:
- Express.js
- Angular 19
- MongoDB
- Bootstrap 5.3
- Gemini API

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
```

Add your Gemini API key as `GEMINI_API_KEY`.

```bash
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Features

- Professional responsive chat UI
- Saved conversation history
- Tone selector for Balanced, Creative, and Technical replies
- Gemini API backend with safer validation and cleaner error responses
- MongoDB persistence for chats and messages
