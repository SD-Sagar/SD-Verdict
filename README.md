# SD Verdict — AI Decision Intelligence Engine

SD Verdict is a mobile-first AI-powered comparison and decision intelligence application. It accepts any comparison between 1 to 5 arbitrary entities, automatically classifies their relationship (same-domain, cross-domain, or sensitive/asymmetric), evaluates them across custom criteria dimensions, and presents a beautiful multi-dimensional dashboard complete with interactive SVG charts and trade-offs.

## 🚀 Key Features

*   **Adaptive Entity Classification**: Analyzes inputs using the **Groq AI API** (free tier available) to select the appropriate comparison mode:
    *   **Ranking Mode** (Same Domain): Full criteria scoring (0-100), detailed category feedback, and winner selection.
    *   **Analytical Mode** (Cross Domain): Criteria scoring, trade-offs, and breakdown without picking a winner.
    *   **Neutral Mode** (Sensitive/Asymmetric/Private Individuals): Purely descriptive contextual breakdown. Strictly disables scores, winner designations, and rankings to maintain safety and objectivity.
*   **Mobile-First UX/UI**: High-performance, thumb-friendly design, stacked cards layout, and tabbed breakdown sections designed to prevent vertical fatigue on phone viewports.
*   **Custom SVG Visualizations**: Lightweight, fully responsive, React 19-compatible Radar and Grouped Bar charts. No heavy external charting dependencies.
*   **100% Serverless Sharing**:
    *   **URL Compression**: Encodes results into a Base64-serialized URL hash. Anyone clicking the link loads the exact verdict report instantly in read-only mode, bypassing database storage requirements.
    *   **High-Res Image Export**: Renders a rich-graphics 800×600 px "SD Verdict Card" onto a canvas and downloads it as a PNG, optimized for WhatsApp, Twitter, and other sharing channels.
*   **Free AI Processing**: Uses Groq's free API tier with `llama-3.1-8b-instant` model, enabling unlimited comparisons at zero cost with fast inference speeds.

---

## 💻 Local Development Setup

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   npm (v9 or higher)
*   A Groq API Key (free tier available at [console.groq.com](https://console.groq.com/))

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SD-Verdict.git
cd SD-Verdict
```

#### 2. Get Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com/) and sign up (free account).
2. Navigate to **API Keys** section.
3. Click **Create API Key** and copy it.
4. Save it securely (you'll need it in the next step).

#### 3. Set Up Environment Variables

Navigate to the frontend folder:

```bash
cd frontend
```

Create a `.env.local` file from the example template:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and add your Groq API Key:

```env
VITE_GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

**Note**: Never commit `.env.local` to GitHub. It's already in `.gitignore` for security.

#### 4. Install Dependencies

```bash
npm install
```

This installs all required packages including React 19, Vite, Tailwind CSS, and lucide-react icons.

#### 5. Start the Development Server

```bash
npm run dev
```

Your terminal will output something like:

```
VITE v8.0.12  ready in 245 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

Open your browser and navigate to **`http://localhost:5173/`**. The app will reload automatically as you make code changes.

### Local Development Tips

*   **No API Key?**: The app will gracefully fall back to **Local Preview Mode** with simulated mock data. You can still navigate and test the UI.
*   **Settings Modal**: Click the **Settings** icon (⚙️) in the top-right to manually configure your API key at runtime. It will be saved to your browser's `localStorage`.
*   **Hard Refresh**: Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to clear the Vite cache and reload with fresh builds.
*   **Hot Reload**: Save any file in `src/` and the app auto-refreshes. No manual refresh needed.

---

## 🌐 Production Deployment Guides

SD Verdict is a **frontend-only Vite static site**, making it ideal for serverless platforms like Netlify and Vercel. Deployment is fast, free (with generous free tiers), and requires no backend infrastructure.

### 🔵 Deploying to Netlify (Recommended for Beginners)

Netlify offers the most user-friendly interface for deploying static sites with automatic HTTPS, CDN, and environment variable management.

#### Prerequisites

*   Your code on GitHub, GitLab, or Bitbucket
*   Your Groq API Key (from [console.groq.com](https://console.groq.com/))

#### Detailed Deployment Steps

**Step 1: Connect Your Repository**

1. Log in to [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Select your Git provider (GitHub, GitLab, or Bitbucket).
4. Click **Connect** and authorize Netlify to access your repositories.
5. Select the **SD-Verdict** repository.

**Step 2: Configure Build Settings**

Netlify's auto-detection usually works, but explicitly set:

1. **Base directory**: `frontend` (where package.json and src/ are located)
2. **Build command**: `npm run build`
3. **Publish directory**: `dist` (Vite's output folder)
4. **Functions directory**: (Leave empty)

**Step 3: Add Environment Variables**

1. Click **Next** or scroll down to **Advanced build settings**.
2. Under **Environment variables**, click **Add a variable**.
3. Configure the variable:
    - **Key**: `VITE_GROQ_API_KEY` (must be exact, including caps and underscores)
    - **Value**: Paste your Groq API Key (e.g., `gsk_abc123xyz...`)
4. Click **Add**.
5. (Optional) You can add more variables if needed in the future.

**Step 4: Deploy**

1. Click **Deploy site**.
2. Netlify will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Deploy the `dist/` folder to Netlify's CDN
3. Your site will be live at a URL like `https://sd-verdict-abc123.netlify.app/`.

**Step 5: Custom Domain (Optional)**

1. In the Netlify dashboard, go to **Site settings** > **Domain management**.
2. Click **Add custom domain**.
3. Enter your domain (e.g., `sdverdict.com`).
4. Follow Netlify's instructions to update your DNS records.

#### Post-Deployment Checklist

- [ ] Visit your live URL and test a comparison
- [ ] Verify the API key is working (check **Settings** modal for "SYSTEM API OK")
- [ ] Test sharing and image download functionality
- [ ] Monitor [Netlify Analytics](https://analytics.netlify.com/) for traffic and errors
- [ ] (Optional) Set up automatic deployments on Git push

---

### ⚡ Deploying to Vercel (Fastest Deployments)

Vercel (created by the Next.js team) is optimized for modern JavaScript frameworks and offers the fastest edge deployments globally.

#### Prerequisites

*   Your code on GitHub, GitLab, or Bitbucket
*   Your Groq API Key (from [console.groq.com](https://console.groq.com/))

#### Detailed Deployment Steps

**Step 1: Import Project**

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Click **Continue with Git**.
4. Select your Git provider and authorize Vercel.
5. Select the **SD-Verdict** repository.

**Step 2: Configure Project Settings**

Once you've selected the repository, Vercel will show the project configuration:

1. **Project Name**: `sd-verdict` (or your preferred name)
2. **Framework Preset**: Select **Vite** (Vercel usually auto-detects this)
3. **Root Directory**: Click **Edit** > Select `frontend`
4. **Build Command**: Should auto-populate as `npm run build`
5. **Output Directory**: Should auto-populate as `dist`
6. **Install Command**: Leave as default (`npm install`)

**Step 3: Add Environment Variables**

1. Scroll down to **Environment Variables**.
2. Enter:
    - **Name**: `VITE_GROQ_API_KEY`
    - **Value**: Paste your Groq API Key
3. Select **Environments**: Check all environments (Production, Preview, Development)
4. Click **Add**.

**Step 4: Deploy**

1. Click **Deploy**.
2. Vercel will:
   - Build the project automatically
   - Run tests (if configured)
   - Deploy to edge nodes globally
3. Your site will be live at `https://sd-verdict.vercel.app/`.

**Step 5: Custom Domain & DNS (Optional)**

1. In Vercel dashboard, go to **Settings** > **Domains**.
2. Click **Add** and enter your custom domain.
3. Vercel will provide DNS records (CNAME or A records).
4. Update your domain registrar's DNS settings.
5. Vercel will verify and activate the domain automatically.

#### Vercel-Specific Features

- **Automatic Preview Deployments**: Every Git push creates a unique preview URL for testing.
- **Rollback**: Revert to previous deployments with one click.
- **Analytics**: Built-in [Web Analytics](https://vercel.com/analytics) tracks performance and user metrics.
- **Automatic HTTPS**: All deployments get free SSL/TLS certificates.

#### Post-Deployment Checklist

- [ ] Verify deployment at your Vercel URL
- [ ] Test API key functionality (check **Settings** for "SYSTEM API OK")
- [ ] Create a test comparison and verify all features work
- [ ] Monitor [Vercel Analytics](https://vercel.com/analytics) for performance metrics
- [ ] Set up custom domain if desired

---

### 📊 Comparison: Netlify vs Vercel

| Feature | Netlify | Vercel |
|---------|---------|--------|
| **Setup Time** | 5-10 minutes | 5-10 minutes |
| **Free Tier** | 300 min/month builds | 100 deployments/month |
| **Auto-Deploys** | Yes (Git push) | Yes (Git push) |
| **Custom Domain** | Free | Free |
| **CDN Speed** | Very Fast | Ultra-Fast (Edge) |
| **Analytics** | Paid add-on | Free (Pro) |
| **Learning Curve** | Beginner-friendly | Developer-friendly |

**Recommendation**: Use **Netlify** if you're new to deployments; use **Vercel** if you want maximum performance and developer features.

---

### 🔒 Environment Variable Best Practices

**For Both Platforms:**

1. **Never expose your API key in code**. Always use environment variables.
2. **Use separate keys for development and production** (optional, but recommended for large teams).
3. **Rotate keys regularly** in your Groq console if you suspect compromise.
4. **Use Preview Deployments** to test changes before pushing to production.

**In Your Code:**

```javascript
// ✅ CORRECT: Read from environment
const apiKey = import.meta.env.VITE_GROQ_API_KEY;

// ❌ WRONG: Hard-coded key
const apiKey = "gsk_abc123..."; // Never do this!
```

---

### 🆘 Troubleshooting Deployment Issues

#### Deployment builds successfully but site shows blank page

**Solution**: Check for JavaScript errors in the browser console. Ensure the API key environment variable is set correctly.

#### "Cannot find module" errors during build

**Solution**: 
1. Ensure you're in the `frontend/` directory
2. Run `npm install` again
3. Clear the build cache: `rm -rf dist/ node_modules/.cache`

#### API key not working in production

**Solution**:
1. Verify the environment variable name is exactly `VITE_GROQ_API_KEY` (case-sensitive)
2. Check that your key doesn't have extra whitespace
3. Rebuild the site after adding the variable (Netlify/Vercel usually do this automatically)
4. Hard refresh your browser: `Ctrl+Shift+R`

#### "Quota reached" errors

**Solution**: Your Groq free API key may have hit rate limits. Options:
1. Use a different API key
2. Wait for the quota to reset (usually 24 hours)
3. Consider Groq's paid tier for higher limits

#### Site is slow or timing out

**Solution**:
1. Check your internet connection
2. Verify Groq's status at [status.groq.com](https://status.groq.com/)
3. Try a different model or increase request timeout in `GroqService.js`

---

## 🔒 Security & Git Best Practices

*   **API Key Safety**: The project includes `.gitignore` rules targeting environment files (`.env`, `.env.local`, `.env.*`). **Never commit your secret keys to GitHub**.
*   **Local Preview Fallback**: If the application is built or run without a pre-configured API key, it gracefully triggers **Local Preview Mode** using simulated reasoning outputs. This keeps the application fully navigable and reviewable without throwing errors.
*   **User Overrides**: Users can configure their own Groq API key through the **Settings Modal** (⚙️ icon). This key is stored securely in their browser's `localStorage` and is never transmitted to any third-party servers except direct API queries to Groq's endpoints (`https://api.groq.com/openai/v1/chat/completions`).
*   **Environment Variable Injection**: Both Netlify and Vercel inject environment variables **at build time**, not at runtime. This means your API key never exists in the deployed HTML/JavaScript bundles—it's only available during the build process for Vite to reference.

### Rotating Your Groq API Key

If you suspect your key has been compromised:

1. Log in to [console.groq.com](https://console.groq.com/)
2. Go to **API Keys** and delete the compromised key
3. Generate a new key
4. Update the environment variable in your deployment platform (Netlify/Vercel)
5. Trigger a rebuild/redeploy

---

## 📱 Features & Usage Guide

### Adding a Comparison

1. Open the app and enter up to 5 items in the input field
2. Click the **+** button to add each item
3. Use **Quick Suggestion Presets** (📱 Phones, 💻 Setup, etc.) for instant suggestions
4. Click **Analyze Comparison** to start the AI analysis

### Customizing Categories

After classification, you can:

*   **Toggle Categories**: Click the checkbox next to each category to include/exclude it
*   **Edit Category Names**: Click the **Edit** icon to rename a category
*   **Remove Categories**: Click the **×** icon to delete a category
*   **Add New Categories**: Type a custom category name and click **+** to add custom dimensions

### Viewing Results

The **Dashboard** tab shows:

*   **Verdict Summary**: The mode (Ranking/Analytical/Neutral) and overall reasoning
*   **Category Breakdown**: Detailed scores or descriptive analysis per item and category
*   **Interactive Charts**: Radar charts (3+ categories) or bar charts (1-2 categories)
*   **Trade-offs**: Key insights and structural differences

### Sharing & Exporting

*   **Copy Link**: Shares a compressed URL that loads your exact comparison (no server storage)
*   **Download Card**: Exports a high-res 800×600 PNG "SD Verdict Card" for social media
*   **Share Image**: Download the PNG and share on WhatsApp, Twitter, Instagram, etc.

---

## 🛠 Project Structure

```
SD-Verdict/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   ├── App.css                 # Global styles
│   │   ├── index.css               # Tailwind CSS imports
│   │   ├── services/
│   │   │   ├── GroqService.js      # Groq API integration (NEW)
│   │   │   └── GeminiService.js    # Legacy (deprecated)
│   │   └── components/
│   │       ├── SettingsModal.jsx   # API key configuration
│   │       ├── ShareCard.jsx       # Sharing & export UI
│   │       └── SvgCharts.jsx       # Radar & bar charts
│   ├── public/                     # Static assets
│   ├── .env.example                # Environment template
│   ├── .env.local                  # Local API key (gitignored)
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
└── README.md                       # This file
```

---

## 🚀 Technology Stack

*   **Frontend Framework**: React 19.2.6
*   **Build Tool**: Vite 8.0.12
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **AI Provider**: Groq API (free tier)
*   **Model**: llama-3.1-8b-instant
*   **Hosting**: Netlify / Vercel (static site hosting)

---

## ⚖️ Copyright & License

Copyright © Sagar Dey 2026. All rights reserved.

Licensed under the proprietary terms. Unauthorized copy, modification, or distribution of this code is strictly prohibited.
