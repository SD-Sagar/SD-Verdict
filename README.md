# SD Verdict — AI Decision Intelligence Engine

SD Verdict is a mobile-first AI-powered comparison and decision intelligence application. It accepts any comparison between 1 to 5 arbitrary entities, automatically classifies their relationship (same-domain, cross-domain, or sensitive/asymmetric), evaluates them across custom criteria dimensions, and presents a beautiful multi-dimensional dashboard complete with interactive SVG charts and trade-offs.

## 🚀 Key Features

*   **Adaptive Entity Classification**: Analyzes inputs using Google Gemini API to select the appropriate comparison mode:
    *   **Ranking Mode** (Same Domain): Full criteria scoring (0-100), detailed category feedback, and winner selection.
    *   **Analytical Mode** (Cross Domain): Criteria scoring, trade-offs, and breakdown without picking a winner.
    *   **Neutral Mode** (Sensitive/Asymmetric/Private Individuals): Purely descriptive contextual breakdown. Strictly disables scores, winner designations, and rankings to maintain safety and objectivity.
*   **Mobile-First UX/UI**: High-performance, thumb-friendly design, stacked cards layout, and tabbed breakdown sections designed to prevent vertical fatigue on phone viewports.
*   **Custom SVG Visualizations**: Lightweight, fully responsive, React 19-compatible Radar and Grouped Bar charts. No heavy external charting dependencies.
*   **100% Serverless Sharing**:
    *   **URL Compression**: Encodes results into a Base64-serialized URL hash. Anyone clicking the link loads the exact verdict report instantly in read-only mode, bypassing database storage requirements.
    *   **High-Res Image Export**: Renders a rich-graphics $800 \times 600$ px "SD Verdict Card" onto a canvas and downloads it as a PNG, optimized for WhatsApp, Twitter, and other sharing channels.
*   **API Cost Control**: Employs optimized, token-efficient system guidelines with `gemini-1.5-flash` to minimize token overhead and latency while keeping structured JSON formatting robust.

---

## 💻 Local Development Setup

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   npm (v9 or higher)
*   A Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/))

### Installation Steps

1.  **Navigate into the frontend project**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment variables**:
    *   Copy the `.env.example` file to create `.env.local`:
        ```bash
        cp .env.example .env.local
        ```
    *   Open `.env.local` and add your Gemini API Key:
        ```env
        VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
        ```
4.  **Start the local development server**:
    ```bash
    npm run dev
    ```
    *   Open your browser and navigate to the address shown (usually `http://localhost:5173`).

---

## 🌐 Production Deployment Guides

SD Verdict is a frontend-only static site which makes it ideal for serverless web hosting platforms.

### 🔺 Deploying to Vercel

Vercel detects Vite applications automatically. Follow these instructions:

1.  Push your code to a GitHub, GitLab, or Bitbucket repository.
2.  Log in to [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
3.  Import your repository.
4.  Configure the project settings:
    *   **Framework Preset**: Select `Vite` (Vercel usually auto-detects this).
    *   **Root Directory**: Set to `frontend`.
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Add the **Environment Variable**:
    *   Key: `VITE_GEMINI_API_KEY`
    *   Value: *Your production Gemini API key* (Vercel will inject this securely during build time).
6.  Click **Deploy**.

---

### ⚡ Deploying to Netlify

To deploy the application on Netlify:

1.  Create a Netlify account and click **Add new site** > **Import an existing project**.
2.  Connect to your Git provider and select the repository.
3.  Configure the build configuration settings:
    *   **Base directory**: `frontend`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `frontend/dist`
4.  Expand the **Environment variables** section:
    *   Add a variable named `VITE_GEMINI_API_KEY` with your API key.
5.  Click **Deploy site**.

---

### 🌐 Deploying to Render

To deploy the application as a **Static Site** on Render:

1.  Log in to the [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Static Site**.
2.  Connect your Git repository.
3.  Configure the site deployment settings:
    *   **Name**: `sd-verdict`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm install && npm run build` (or just `npm run build` if dependencies are pre-cached)
    *   **Publish Directory**: `dist`
4.  Click **Advanced** to add an **Environment Variable**:
    *   Key: `VITE_GEMINI_API_KEY`
    *   Value: *Your production Gemini API key*
5.  Click **Create Static Site**.

---

## 🔒 Security & Git Best Practices

*   **API Key Safety**: The project includes git ignores targeting environment files (`.env`, `.env.local`, `.env.*`). Never commit your secret keys to GitHub.
*   **Local Preview Fallback**: If the application is built or run without a pre-configured key, it gracefully triggers a **Local Preview Mode** using simulated reasoning outputs. This keeps the application fully navigable and reviewable without throwing errors.
*   **User Overrides**: Users can configure their own key through the settings modal. This key is stored in their browser's local storage and is never transmitted to any third-party servers except direct API queries to Google's endpoints.

---

## ⚖️ Copyright & License

Copyright © Sagar Dey 2026. All rights reserved.

Licensed under the proprietary terms. Unauthorized copy, modification, or distribution of this code is strictly prohibited.
