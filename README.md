# Readit

An interactive text-to-audio application with AI assistance.

## Features

- Document Upload (PDF, DOCX, TXT)
- Text-to-Speech Conversion
- Interactive AI Assistant
- Session Management
- Progress Tracking

## Tech Stack

- Frontend: React
- Backend: Python Flask
- Database: SQLite
- Services: 
  - Text-to-Speech: Azure TTS
  - AI: OpenAI GPT
  
## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Azure TTS API Key
- OpenAI API Key

### Installation

1. Clone the repository
2. Install backend dependencies: `pip install -r backend/requirements.txt`
3. Install frontend dependencies: `cd frontend && npm install`

### Running the Application

1. Start backend server: `python backend/run.py`
2. Start frontend: `cd frontend && npm start`

## Project Structure

```
readit/
├── backend/         # Flask backend
├── frontend/        # React frontend
└── docs/           # Documentation
```


### PROJECT STRUCTURE

readit/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── text_processor.py
│   │   │   ├── tts_service.py
│   │   │   └── ai_assistant.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── session.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_text_processor.py
│   │   ├── test_tts_service.py
│   │   └── test_ai_assistant.py
│   ├── requirements.txt
│   └── config.py
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentUploader/
│   │   │   │   ├── index.jsx
│   │   │   │   └── styles.css
│   │   │   ├── AudioPlayer/
│   │   │   │   ├── index.jsx
│   │   │   │   └── styles.css
│   │   │   └── AIAssistant/
│   │   │       ├── index.jsx
│   │   │       └── styles.css
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── session.js
│   │   ├── contexts/
│   │   │   └── AppContext.jsx
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── .env
│
├── docs/
│   ├── api/
│   │   └── endpoints.md
│   ├── setup.md
│   └── architecture.md
│
├── .gitignore
├── README.md
└── docker-compose.yml




Test the application:
Open http://localhost:3000 in your browser
Try uploading a PDF or DOCX file
Test the text-to-speech functionality
Try the dark mode toggle
Add some bookmarks


Common issues to watch for:
Make sure your OpenAI API key is valid
Check that Azure Speech Services is properly configured
Ensure both backend and frontend servers are running
Check browser console for any frontend errors
Check backend logs for any API errors