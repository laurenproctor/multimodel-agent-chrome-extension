# multimodel-agent-chrome-extension
A Chrome extension that takes a typed query, performs a Google search, and returns results from Google, ChatGPT, and Claude displayed side-by-side in a unified interface.

# Multi-AI Search Chrome Extension

A Chrome extension that takes a typed query, performs a Google search, and returns results from **Google**, **ChatGPT**, and **Claude** displayed **side-by-side** in a unified interface.

---

## Overview

This project includes:

- **Chrome Extension**  
  A popup UI where users can type a query and see:
  - Google search results
  - ChatGPT generated response
  - Claude generated response

- **Backend Server**  
  A lightweight Node.js server that securely proxies requests to OpenAI and Anthropic APIs to protect API keys.

---

## Features

- Single input for all query types
- Side-by-side results from Google, ChatGPT, and Claude
- Clean, simple UI in a Chrome popup
- Backend handles AI API calls securely

---

## Requirements

Before running this project you will need:

### API Keys

| Service | Requirement |
|---------|-------------|
| **Google** | API key + Custom Search Engine ID |
| **OpenAI** | ChatGPT API key |
| **Anthropic** | Claude API key |

---

## Project Structure

```
multi-ai-search/
├── extension/
│   ├── icons/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── styles.css
├── backend/
│   ├── .env
│   ├── package.json
│   └── server.js
└── build.sh
```

---

## Setup Instructions

### 1. Clone this Repo

```bash
git clone (https://github.com/laurenproctor/multimodel-agent-chrome-extension/)
cd multi-ai-search
```

---

### 2. Configure the Backend

#### A. Install Dependencies

```bash
cd backend
npm install
```

#### B. Create Environment File

Create a file called `.env` in the `backend` folder:

```
OPENAI_API_KEY=your_openai_api_key
CLAUDE_API_KEY=your_claude_api_key
PORT=5000
```

*(Do not commit this file — it contains sensitive API keys.)*

---

## 3. Prepare the Chrome Extension

### A. Update Placeholder Values in `popup.js`

Open:

```
extension/popup.js
```

Replace:

```js
REPLACE_GOOGLE_KEY
REPLACE_SEARCH_ENGINE_ID
YOUR_BACKEND_URL
```

with your own keys and deployed backend URL.

---

## 4. Run the Backend Locally

From the `backend/` folder:

```bash
node server.js
```

You should see:

```
Listening on port 5000
```

This means the backend is running and ready to receive requests.

---

## 5. Load the Extension in Chrome

1. Open Chrome and go to: `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension` folder

The extension icon should now appear in your toolbar.

---

## 🚀 Deploying the Backend

To use the extension outside of local development, deploy the backend to a host that provides HTTPS, such as:

- **Vercel**
- **Render**
- **Heroku**
- **Fly.io**

1. Push the `backend/` folder to a GitHub repository.
2. Connect it to your deployment platform.
3. Set environment variables (`OPENAI_API_KEY`, `CLAUDE_API_KEY`, and `PORT`).
4. Deploy.
5. Update the `YOUR_BACKEND_URL` in `popup.js` with your deployed URL.

---

## 📌 Using the Extension

1. Click the extension icon in Chrome.
2. Enter a query.
3. Press **Search**.
4. View results:
   - Google search results
   - ChatGPT response
   - Claude response

---

## Notes & Tips

- Google Search requires a **Custom Search Engine (CSE)** configured to search the entire web.
- Ensure your backend uses **HTTPS** when deployed so that the extension can access it.
- Never expose API keys in client-side code.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No AI response | Check backend logs and environment variables |
| CORS errors | Confirm that your backend is running on HTTPS |
| Google results not showing | Verify your Google CSE configuration |

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Lauren Proctor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

## 🏁 Final Notes

With this setup you now have a Chrome extension that unifies search results from Google, ChatGPT, and Claude in one interface — ideal for comparative queries and enhanced research workflows.

