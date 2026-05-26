import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, ShieldAlert, Trash2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onKeyChange }) {
  const [keyInput, setKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('SD_VERDICT_GEMINI_API_KEY') || '';
    setKeyInput(savedKey);
    setIsSaved(savedKey.trim() !== '');
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('SD_VERDICT_GEMINI_API_KEY', keyInput.trim());
    setIsSaved(keyInput.trim() !== '');
    if (onKeyChange) onKeyChange();
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('SD_VERDICT_GEMINI_API_KEY');
    setKeyInput('');
    setIsSaved(false);
    if (onKeyChange) onKeyChange();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl glass-card neon-border-purple animate-slide-up">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 -ml-16 -mb-16 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">API Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 transition hover:text-white rounded-lg hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            By default, SD Verdict uses the pre-configured system key. If you have your own Google Gemini API Key and want to bypass potential shared rate limits, you can enter it below.
          </p>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex gap-3 text-xs text-purple-200">
            <Key className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
            <div>
              Your key is saved locally in your browser (<code className="bg-purple-950/50 px-1 rounded">localStorage</code>) and is sent directly to Google. It never touches our servers.
            </div>
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Gemini API Key
            </label>
            <div className="relative flex items-center">
              <input
                id="apiKey"
                type="password"
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
              />
              {isSaved && (
                <CheckCircle className="absolute right-3 w-5 h-5 text-emerald-400" />
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {isSaved && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-500/20"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
