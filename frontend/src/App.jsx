import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Check, Settings, Sparkles, 
  ArrowRight, RotateCcw, ShieldAlert, Info, ChartBar, 
  FileText, PlusCircle, AlertCircle, X 
} from 'lucide-react';
import { 
  classifyAndGenerateCategories, 
  generateDetailedVerdict, 
  hasApiKey, 
  getApiKey 
} from './services/GeminiService';
import SettingsModal from './components/SettingsModal';
import { RadarChart, BarChart } from './components/SvgCharts';
import ShareCard from './components/ShareCard';

// Sleek vector logo for SD Verdict
function Logo({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="8" y="8" width="84" height="84" rx="20" fill="rgba(14, 11, 25, 0.8)" stroke="url(#logoGrad)" strokeWidth="3" filter="url(#logoGlow)" />
      {/* S & D merged initials - Clean and perfectly visible */}
      <path d="M 42 36 L 32 36 Q 26 36 26 43 Q 26 50 32 50 L 36 50 Q 42 50 42 57 Q 42 64 36 64 L 26 64" stroke="url(#logoGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 52 36 L 62 36 Q 74 36 74 50 Q 74 64 62 64 L 52 64 Z" stroke="url(#logoGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 48 28 L 48 72" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Small Judgment Stamp Tick */}
      <path d="M 64 48 L 70 55 L 82 40" stroke="#00f2fe" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#logoGlow)" />
    </svg>
  );
}

// Preset suggestions for instant engagement
const PRESETS = [
  { label: "📱 Phones", items: ["iPhone 16 Pro", "S25 Ultra", "Pixel 9 Pro"] },
  { label: "💻 Setup", items: ["Laptop", "Desktop Gaming PC"] },
  { label: "🌿 Nature vs Tech", items: ["Tree", "Laptop"] },
  { label: "☕ Warm Drinks", items: ["Espresso Coffee", "Matcha Green Tea"] },
  { label: "⚖️ Sagar vs Elon", items: ["Sagar Dey", "Elon Musk"] }
];

export default function App() {
  // Navigation & API states
  const [step, setStep] = useState('INPUT'); // INPUT, CATEGORIES, LOADING, DASHBOARD
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keyState, setKeyState] = useState(0); // Trigger re-checks
  
  // App logic states
  const [items, setItems] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editingItemText, setEditingItemText] = useState('');

  // Classification & Category Setup states
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [classificationMode, setClassificationMode] = useState('RANKING'); // RANKING, ANALYTICAL, NEUTRAL
  const [classificationReason, setClassificationReason] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatText, setEditingCatText] = useState('');

  // Verdict dashboard states
  const [loadingPhase, setLoadingPhase] = useState('Initializing analysis...');
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  const [verdictData, setVerdictData] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('verdict'); // verdict, criteria
  const [isSharedMode, setIsSharedMode] = useState(false);

  // Check for serialized shared URL hashes on mount
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#shared=')) {
        try {
          const encoded = hash.split('#shared=')[1];
          const decodedStr = decodeURIComponent(escape(atob(encoded)));
          const parsed = JSON.parse(decodedStr);
          
          if (parsed.items && parsed.categories && parsed.result) {
            setItems(parsed.items);
            setCategories(parsed.categories);
            setVerdictData(parsed.result);
            setClassificationMode(parsed.mode || 'RANKING');
            setStep('DASHBOARD');
            setIsSharedMode(true);
          }
        } catch (err) {
          console.error("Failed to parse shared state from URL hash:", err);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check API Key
  const activeKeyExists = hasApiKey();

  const handleKeyUpdated = () => {
    setKeyState(prev => prev + 1);
  };

  // Add Item to chips list
  const handleAddItem = (e) => {
    e?.preventDefault();
    const val = inputVal.trim();
    if (!val) return;
    if (items.length >= 5) {
      alert("Maximum of 5 items allowed.");
      return;
    }
    if (items.some(item => item.toLowerCase() === val.toLowerCase())) {
      alert("This item is already added.");
      return;
    }
    setItems([...items, val]);
    setInputVal('');
  };

  // Remove item from chips
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Edit item inline
  const startEditItem = (index) => {
    setEditingItemIndex(index);
    setEditingItemText(items[index]);
  };

  const saveEditItem = () => {
    if (!editingItemText.trim()) return;
    const updated = [...items];
    updated[editingItemIndex] = editingItemText.trim();
    setItems(updated);
    setEditingItemIndex(null);
  };

  // Apply suggestions presets
  const handleApplyPreset = (presetItems) => {
    setItems(presetItems);
  };

  // Step 1 -> Step 2: Classify input and generate categories
  const triggerClassification = async () => {
    if (items.length < 1) {
      alert("Please add at least 1 item to evaluate.");
      return;
    }
    setStep('LOADING');
    setLoadingPhase('Classifying comparison entities...');

    try {
      const data = await classifyAndGenerateCategories(items);
      setClassificationMode(data.mode || 'RANKING');
      setClassificationReason(data.reason || '');
      
      // Seed default active property
      const mappedCats = (data.categories || []).map(cat => ({
        ...cat,
        active: true
      }));
      
      setCategories(mappedCats);
      setStep('CATEGORIES');
      if (data.isApiFallback) setShowQuotaWarning(true);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze inputs. Please verify API configuration.");
      setStep('INPUT');
    }
  };

  // Categories customizations
  const handleToggleCat = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleRemoveCat = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const startEditCat = (id, currentName) => {
    setEditingCatId(id);
    setEditingCatText(currentName);
  };

  const saveEditCat = (id) => {
    if (!editingCatText.trim()) return;
    setCategories(categories.map(c => c.id === id ? { ...c, name: editingCatText.trim() } : c));
    setEditingCatId(null);
  };

  const handleAddCustomCat = (e) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    setCategories([...categories, { id, name, active: true }]);
    setNewCatName('');
  };

  // Step 2 -> Step 3/4: Detailed evaluation Dashboard
  const triggerVerdictGeneration = async () => {
    const activeCats = categories.filter(c => c.active);
    if (activeCats.length === 0) {
      alert("Please enable at least 1 category dimension.");
      return;
    }

    setStep('LOADING');
    setLoadingPhase('Evaluating criteria matrices...');

    try {
      const verdict = await generateDetailedVerdict(items, activeCats, classificationMode);
      setVerdictData(verdict);
      setStep('DASHBOARD');
      setDashboardTab('verdict');
      if (verdict.isApiFallback) setShowQuotaWarning(true);
    } catch (err) {
      console.error(err);
      alert("Verdict generation failed. Reverting to category setup.");
      setStep('CATEGORIES');
    }
  };

  const resetComparison = () => {
    window.location.hash = '';
    setIsSharedMode(false);
    setVerdictData(null);
    setCategories([]);
    setStep('INPUT');
    setShowQuotaWarning(false);
  };

  return (
    <div className={`flex flex-col min-h-screen relative pb-16 theme-${classificationMode?.toLowerCase() || 'ranking'}`}>
      {/* Sleek App Header */}
      <header className={`w-full mx-auto px-4 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 ${step === 'DASHBOARD' ? 'max-w-6xl' : 'max-w-lg'}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetComparison}>
          <Logo className="w-9 h-9" />
          <div>
            <h1 className="text-md font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent m-0 leading-none">
              SD Verdict
            </h1>
            <span className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase block mt-0.5">
              AI Decision Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* API Key Status Indicator */}
          <button 
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center gap-1 text-[10px] md:text-xs font-bold py-1.5 px-3 rounded-full border transition ${
              activeKeyExists 
                ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                : 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeKeyExists ? 'bg-emerald-400' : 'bg-yellow-400'} animate-pulse`} />
            {activeKeyExists ? 'SYSTEM API OK' : 'LOCAL PREVIEW'}
          </button>
          
          <button 
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-gray-400 hover:text-white transition"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className={`flex-grow w-full mx-auto px-4 py-6 flex flex-col justify-start transition-all duration-300 ${step === 'DASHBOARD' ? 'max-w-6xl' : 'max-w-lg'}`}>
        
        {/* API Quota Warning Banner */}
        {showQuotaWarning && (
          <div className="w-full max-w-lg mx-auto mb-6 p-4 rounded-xl border border-orange-500/30 bg-orange-500/10 flex gap-3 animate-slide-up shadow-lg shadow-orange-500/5 relative z-10">
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <h4 className="text-sm font-bold text-orange-400 tracking-tight">System Quota Reached</h4>
              <p className="text-xs md:text-sm text-orange-200/80 leading-relaxed">
                Our primary AI engine has reached its maximum bandwidth limits. You are viewing generic fallback results. To generate deep, live AI analysis immediately, you can <button type="button" onClick={() => setSettingsOpen(true)} className="underline font-semibold text-orange-300 hover:text-white transition">use your own API Key</button>, or please wait 24 hours for the quota to reset.
              </p>
            </div>
            <button type="button" onClick={() => setShowQuotaWarning(false)} className="self-start text-orange-400 hover:text-white transition p-1 bg-orange-500/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= SCREEN 1: INPUT ================= */}
        {step === 'INPUT' && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2 mt-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Compare Anything.
              </h2>
              <p className="text-xs md:text-sm text-gray-400 max-w-xs md:max-w-md mx-auto leading-relaxed">
                Enter up to 5 items to generate structured comparison categories, AI trade-off analysis, and a final verdict.
              </p>
            </div>

            {/* Input card */}
            <form onSubmit={handleAddItem} className="space-y-4 p-5 rounded-2xl glass-card border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Apple iPad Pro"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition"
                />
                <button
                  type="submit"
                  className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition flex items-center justify-center shadow-lg shadow-cyan-500/10"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Suggestions Presets Scroller */}
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest block">
                  Quick suggestion presets
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none snap-x">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset.items)}
                      className="shrink-0 snap-start text-xs md:text-sm py-1.5 px-3 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 text-gray-300 font-medium transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Items list chips */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Compared items ({items.length}/5)
                </span>
                {items.length > 0 && (
                  <button 
                    onClick={() => setItems([])}
                    className="text-[10px] md:text-xs font-bold text-red-400/75 hover:text-red-400 uppercase transition"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-xs md:text-sm text-gray-500">
                  No items added yet. Add items above or tap a preset to begin.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition group"
                    >
                      {editingItemIndex === idx ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text" 
                            value={editingItemText}
                            onChange={(e) => setEditingItemText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditItem()}
                            className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-500"
                            autoFocus
                          />
                          <button 
                            type="button"
                            onClick={saveEditItem}
                            className="p-1.5 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded-lg"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs md:text-sm text-gray-600 font-bold w-4">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {item}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditItem(idx)}
                              className="p-1.5 text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-lg transition"
                              title="Edit item name"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Run comparison button */}
            {items.length > 0 && (
              <button
                type="button"
                onClick={triggerClassification}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                Initialize Evaluation Setup
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ================= SCREEN 2: CATEGORY SETUP ================= */}
        {step === 'CATEGORIES' && (
          <div className="space-y-6 animate-slide-up">
            <div className="space-y-2 mt-2">
              <span className="text-[10px] md:text-xs font-bold text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Entity Mode: {classificationMode}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                Customize Comparison Criteria
              </h2>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                {classificationReason || "Review the automatically generated comparison categories below. You can toggle, delete, edit, or append custom metrics."}
              </p>
            </div>

            {/* Warning for Neutral Mode */}
            {classificationMode === 'NEUTRAL' && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex gap-3 text-xs md:text-sm text-purple-200 leading-relaxed">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-purple-400 mt-0.5" />
                <div>
                  <strong>Neutral Mode Enabled:</strong> The comparison targets sensitive topics, public personalities, or private individuals. Scoring, ranking, and final winner designations will be disabled to ensure objectivity.
                </div>
              </div>
            )}

            {/* Categories stack */}
            <div className="space-y-2">
              <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Active Categories
              </div>

              {categories.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-xs md:text-sm text-gray-500">
                  No criteria defined. Add custom categories below.
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                        cat.active 
                          ? 'bg-purple-950/5 border-purple-500/20 text-white' 
                          : 'bg-white/[0.01] border-white/5 text-gray-500'
                      }`}
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={cat.active}
                          onChange={() => handleToggleCat(cat.id)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        
                        {editingCatId === cat.id ? (
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="text" 
                              value={editingCatText}
                              onChange={(e) => setEditingCatText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEditCat(cat.id)}
                              className="bg-black/50 border border-white/20 rounded-lg px-2.5 py-0.5 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500"
                              autoFocus
                            />
                            <button 
                              type="button"
                              onClick={() => saveEditCat(cat.id)}
                              className="p-1 bg-purple-950 text-purple-400 border border-purple-500/30 rounded-lg"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-sm font-semibold ${cat.active ? 'text-white' : 'text-gray-500'}`}>
                            {cat.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEditCat(cat.id, cat.name)}
                          className="p-1 text-gray-500 hover:text-gray-300 transition"
                          title="Rename Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCat(cat.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Category Input */}
            <form onSubmit={handleAddCustomCat} className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom category..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-xs md:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="submit"
                className="px-3.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/30 text-purple-400 text-xs md:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            {/* Setup Controls */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('INPUT')}
                className="py-3.5 px-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] text-gray-300 font-semibold text-xs md:text-sm transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={triggerVerdictGeneration}
                className="col-span-2 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs md:text-sm tracking-wider rounded-xl transition shadow-lg shadow-purple-500/15 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                Generate Verdict Report
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 3: LOADING STAGE ================= */}
        {step === 'LOADING' && (
          <div className="flex-grow flex flex-col items-center justify-center min-h-[300px] space-y-6">
            {/* Spinning Radar Scan Animation */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-purple-500/10" />
              <div className="absolute inset-2 rounded-full border border-cyan-500/15" />
              <div className="absolute inset-4 rounded-full border border-purple-500/20" />
              
              {/* Spinning scanning sweep */}
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-transparent border-t-purple-500 border-r-cyan-400 animate-spin" style={{ animationDuration: '1.2s' }} />
              
              {/* Inner glowing pulsing orb */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 blur-[2px] opacity-80 animate-pulse" />
              <Sparkles className="absolute w-4 h-4 text-white animate-bounce" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold tracking-tight text-white animate-pulse-glow">
                SD VERDICT ENGINE
              </h3>
              <p className="text-xs md:text-sm text-gray-500 font-semibold tracking-widest uppercase">
                {loadingPhase}
              </p>
            </div>
          </div>
        )}

        {/* ================= SCREEN 4: DASHBOARD ================= */}
        {step === 'DASHBOARD' && verdictData && (
          <div className="space-y-6 animate-slide-up w-full">
            
            {/* Top Back/Reset Bar */}
            <div className="flex items-center justify-between px-1">
              {isSharedMode ? (
                <span className="text-[10px] md:text-xs font-bold text-cyan-400/80 bg-cyan-950/20 border border-cyan-500/20 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Read-Only Shared View
                </span>
              ) : (
                <button
                  onClick={() => setStep('CATEGORIES')}
                  className="text-xs md:text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Edit Setup
                </button>
              )}

              <button
                onClick={resetComparison}
                className="text-xs md:text-sm font-bold text-purple-400 hover:text-purple-300 transition"
              >
                New Comparison
              </button>
            </div>

            {/* Dashboard Selector Tabs (Mobile Only) */}
            <div className="lg:hidden grid grid-cols-2 p-1.5 rounded-xl bg-white/[0.02] border border-white/5">
              <button
                type="button"
                onClick={() => setDashboardTab('verdict')}
                className={`py-2.5 text-xs md:text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                  dashboardTab === 'verdict'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Verdict Summary
              </button>
              <button
                type="button"
                onClick={() => setDashboardTab('criteria')}
                className={`py-2.5 text-xs md:text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                  dashboardTab === 'criteria'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
              >
                <ChartBar className="w-3.5 h-3.5" />
                Criteria Breakdown
              </button>
            </div>

            <div className="lg:flex lg:gap-8 lg:items-start w-full">
              {/* LEFT COLUMN: Verdict Terminal */}
              <div className={`w-full lg:w-1/2 space-y-6 ${dashboardTab === 'verdict' ? 'block' : 'hidden lg:block'}`}>
                
                {/* Decision Console Terminal UI */}
                <div className="decision-console">
                  <div className="console-header">
                     <div className="console-dot red"></div>
                     <div className="console-dot yellow"></div>
                     <div className="console-dot green"></div>
                     <span className="ml-2 text-[10px] md:text-xs text-gray-500 font-mono tracking-widest uppercase">
                       SD_Verdict_Engine // {classificationMode}
                     </span>
                  </div>
                  <div className="console-body space-y-5">
                     <div className="typewriter-text text-cyan-400 font-bold">&gt; TARGET_ENTITIES: {items.join(' vs ')}</div>
                     <div className="typewriter-text text-gray-300 font-sans" style={{ animationDelay: '0.2s' }}>
                       {verdictData.reasoningSummary}
                     </div>
                     
                     {classificationMode === 'RANKING' && verdictData.winner && (
                       <div className="typewriter-text mt-4 p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-lg text-yellow-400 font-bold text-center text-lg shadow-inner" style={{ animationDelay: '0.4s' }}>
                         &gt; FINAL_VERDICT: {verdictData.winner}
                       </div>
                     )}
          
                     <div className="typewriter-text mt-4 space-y-2" style={{ animationDelay: '0.6s' }}>
                       <span className="text-purple-400 font-bold">&gt; EXTRACTED_INSIGHTS:</span>
                       <ul className="space-y-3 ml-2 font-sans text-xs md:text-sm">
                         {(verdictData.tradeOffs || []).map((point, idx) => (
                           <li key={idx} className="flex gap-2">
                             <span className="text-gray-600 font-mono font-bold">[{idx + 1}]</span>
                             <span className="text-gray-300 leading-relaxed">{point}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                     
                     <div className="typewriter-text mt-4 pt-4 border-t border-white/10 flex justify-between" style={{ animationDelay: '0.8s' }}>
                        <span className="text-gray-500 font-bold">&gt; CONFIDENCE_LEVEL:</span>
                        <span className={`font-mono text-lg font-bold ${classificationMode === 'NEUTRAL' ? 'text-purple-400' : 'text-cyan-400'}`}>
                          {verdictData.confidence || 85}%
                        </span>
                     </div>
                  </div>
                </div>

                <ShareCard 
                  items={items}
                  categories={categories.filter(c => c.active)}
                  result={verdictData}
                  mode={classificationMode}
                />
              </div>

              {/* RIGHT COLUMN: Criteria Breakdown */}
              <div className={`w-full lg:w-1/2 space-y-6 ${dashboardTab === 'criteria' ? 'block' : 'hidden lg:block'}`}>
                
                {/* Visualizations (Scoring Modes Only) */}
                {classificationMode !== 'NEUTRAL' && verdictData.scores ? (
                  <div className="p-5 rounded-2xl glass-card border-white/5 space-y-6 flex flex-col items-center">
                    <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider self-start">
                      Comparative Analysis Chart
                    </h4>
                    
                    {categories.filter(c => c.active).length >= 3 ? (
                      <RadarChart 
                        items={items} 
                        categories={categories.filter(c => c.active)} 
                        scores={verdictData.scores} 
                      />
                    ) : (
                      <BarChart 
                        items={items} 
                        categories={categories.filter(c => c.active)} 
                        scores={verdictData.scores} 
                      />
                    )}
                  </div>
                ) : null}

                {/* Comparative Matrix List */}
                <div className="space-y-3">
                  <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider px-1">
                    Category Breakdown
                  </h4>
                  
                  {classificationMode === 'NEUTRAL' && verdictData.matrix ? (
                    <div className="space-y-4">
                      {categories.filter(c => c.active).map((cat) => (
                        <div key={cat.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                          <div className="text-xs md:text-sm font-semibold text-purple-400 uppercase tracking-wider pb-1.5 border-b border-white/5">
                            {cat.name}
                          </div>
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div key={item} className="space-y-1 text-xs md:text-sm">
                                <div className="font-bold text-gray-300">{item}</div>
                                <p className="text-gray-400 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
                                  {verdictData.matrix[item]?.[cat.name] || 'No analytical data.'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.filter(c => c.active).map((cat) => (
                        <div key={cat.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                          <div className="text-xs md:text-sm font-semibold text-cyan-400 uppercase tracking-wider pb-1.5 border-b border-white/5">
                            {cat.name}
                          </div>
                          
                          <div className="space-y-3">
                            {items.map((item) => {
                              const scoreObj = verdictData.scores?.[item]?.[cat.name];
                              const scoreVal = scoreObj ? (typeof scoreObj === 'number' ? scoreObj : scoreObj.score) : 50;
                              const reasonText = scoreObj && typeof scoreObj === 'object' ? scoreObj.reason : '';

                              return (
                                <div key={item} className="flex flex-col gap-1 text-xs md:text-sm">
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-gray-300">{item}</span>
                                    <span className="font-mono text-cyan-400 font-bold">{scoreVal}/100</span>
                                  </div>
                                  
                                  {reasonText && (
                                    <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
                                      {reasonText}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal Component */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onKeyChange={handleKeyUpdated}
      />

      {/* Sleek Copyright Footer (Always at the bottom) */}
      <footer className={`w-full mx-auto py-6 mt-8 px-4 border-t border-white/5 text-center space-y-1.5 text-xs md:text-sm text-gray-600 font-medium transition-all duration-300 ${step === 'DASHBOARD' ? 'max-w-6xl' : 'max-w-lg'}`}>
        <div>
          Copyright © Sagar Dey 2026. All rights reserved.
        </div>
        <div className="text-[10px] md:text-xs text-gray-700 tracking-wider">
          SD VERDICT ENGINE • VERSION 1.0.0
        </div>
      </footer>
    </div>
  );
}
