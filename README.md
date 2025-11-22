
# 🔤 Smart Text Corrector

AI-powered text correction and rewriting tool built with React, Node.js, Express, and Python NLP. Instantly detect and fix grammar, spelling, and punctuation errors, or rewrite text in fluent, formal, and casual styles using advanced language processing.

![License](https://img.shields.io/badge/License-Apache%202.0-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## ✨ Key Features

- 📝 **Grammar & Spelling Correction:** Automatically detect and fix errors using LanguageTool API
- ✍️ **Text Rewriting:** Transform text into fluent, formal, or casual styles with AI
- 🌍 **Multi-language Support:** English, Spanish, French, and German
- ⚡ **Real-time Processing:** Fast correction with loading indicators and smooth animations
- 📋 **One-Click Copy:** Instantly copy corrected text to clipboard
- 📊 **Character Counter:** Track text length up to 50,000 characters
- 🎨 **Modern UI:** Beautiful gradient design with responsive layout
- 🔒 **Secure Backend:** Environment-based configuration with no exposed credentials

---

## 📚 Tech Stack

### Frontend
- **React** with Vite
- **JavaScript (JSX)**
- Inline CSS styling
- Modern animations

### Backend
- **Node.js** + **Express.js**
- **Python** (NLP processing)
- **LanguageTool API** (grammar checking)
- **Ollama/LLM** (AI text rewriting)

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### 1. Clone the Repository

```
git clone https://github.com/avradeephalder/Smart-Text-Corrector.git
cd Smart-Text-Corrector
```

### 2. Backend Setup

```
cd autocorrect-backend
npm install

# Install Python dependencies
cd nlp
pip install -r requirements.txt
cd ..
```

Create a `.env` file in the `autocorrect-backend` folder:

```
PORT=3000
OLLAMA_HOST=http://localhost:11434
```

**Note:** Make sure your NLP data files are properly configured in `nlp/data/`.

Start the backend server:

```
node server.js
```

### 3. Frontend Setup

```
cd ../autocorrect-frontend
npm install
```

Start the frontend development server:

```
npm run dev
```

The app will run on **http://localhost:5173**.

---

## 🖥️ Usage

1. **Select Language:** Choose your input language (English, Spanish, French, or German)
2. **Choose Mode:**
   - **Correct:** Fix grammar, spelling, and punctuation errors
   - **Rewrite:** Transform text into fluent, formal, or casual style
3. **Enter Text:** Type or paste your text (up to 50,000 characters)
4. **Process:** Click "Correct Text" or "Rewrite Text"
5. **View Results:** See your corrected/rewritten text in the highlighted section below
6. **Copy:** Click the copy button to save results to clipboard

---

## 🏗️ Project Structure

```
Smart-Text-Corrector/
│
├── autocorrect-backend/
│   ├── api/
│   ├── nlp/
│   │   ├── data/
│   │   │   └── frequency_en.txt
│   │   ├── corrector.py
│   │   └── main.py
│   ├── config.js
│   ├── routes.js
│   ├── server.js
│   ├── services.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
└── autocorrect-frontend/
    ├── src/
    │   ├── assets/
    │   ├── App.css
    │   ├── App.jsx
    │   ├── Home.jsx              # Main correction interface
    │   ├── index.css
    │   └── main.jsx
    ├── public/
    ├── .gitignore
    ├── package.json
    └── vite.config.js
```

---

## 🔑 Environment Variables

The backend requires the following environment variables in `.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | No (default: 3000) |
| `OLLAMA_HOST` | Ollama API endpoint for text rewriting | Yes (for rewrite mode) |

---

## 🌟 Key Features Explained

### Grammar Correction
Uses LanguageTool API for comprehensive grammar, spelling, and punctuation checking with context-aware suggestions.

### AI Rewriting
Powered by Ollama/LLM to intelligently rewrite text in different styles while preserving meaning and context.

### Multi-language Support
Seamlessly process text in English, Spanish, French, and German with language-specific correction rules.

### Responsive Design
Modern gradient UI with smooth animations, optimized for all screen sizes and devices.

---

## 🛠️ Development

### Running the Application

**Backend:**
```
cd autocorrect-backend
node server.js
```
Runs on **http://localhost:3000**

**Frontend:**
```
cd autocorrect-frontend
npm run dev
```
Runs on **http://localhost:5173**

### Building for Production

**Frontend:**
```
cd autocorrect-frontend
npm run build
```

---

## 📝 API Documentation

### POST `/api/correct`
Correct grammar and spelling errors in text.

**Request Body:**
```
{
  "text": "The smal hous stood at the end of the road",
  "language": "en"
}
```

**Response:**
```
{
  "corrected": "The small house stood at the end of the road",
  "suggestions": [
    {
      "original": "smal",
      "replacement": "small",
      "message": "Spelling mistake"
    }
  ]
}
```

### POST `/api/rewrite`
Rewrite text in a specified style.

**Request Body:**
```
{
  "text": "I want to go to the store",
  "style": "formal"
}
```

**Response:**
```
{
  "rewritten": "I would like to visit the establishment"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Avradeep Halder**

- LinkedIn: [linkedin.com/in/avradeephalder](https://www.linkedin.com/in/avradeephalder/)
- GitHub: [@avradeephalder](https://github.com/avradeephalder)

---

## 🙏 Acknowledgments

- [LanguageTool](https://languagetool.org/) for grammar checking API
- [Ollama](https://ollama.ai/) for AI-powered text rewriting
- React and Vite communities for excellent development tools

---

## 📧 Contact

For questions or support, please [open an issue](https://github.com/avradeephalder/Smart-Text-Corrector/issues) or contact me via LinkedIn.

---

**⭐ If you find this project helpful, please give it a star!**
```

***

**Save this as `README.md` in your project root**, then push it:

```bash
git add README.md
git commit -m "Add comprehensive README with Apache 2.0 license"
git push
```

Your GitHub repository now has a professional, detailed README that matches the style of your Translator App! 🚀✨
