import React, { useState } from 'react';
import { Share2, Download, Copy, Check, Info } from 'lucide-react';

export default function ShareCard({ items, categories, result, mode }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getTitle = () => {
    return items.join(' vs ');
  };

  // 1. URL Sharing - base64 encode comparison state
  const handleCopyLink = () => {
    try {
      const stateObj = { items, categories, result, mode };
      const stateStr = JSON.stringify(stateObj);
      const encoded = btoa(unescape(encodeURIComponent(stateStr)));
      
      const shareUrl = `${window.location.origin}${window.location.pathname}#shared=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // 2. High-res Image Sharing - HTML Canvas Drawer
  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      // Create high-res canvas (800x600 px)
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');

      // Draw Gradient Background
      const gradient = ctx.createRadialGradient(400, 300, 100, 400, 300, 500);
      gradient.addColorStop(0, '#120b22');
      gradient.addColorStop(1, '#050308');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Draw Neon Border
      ctx.strokeStyle = mode === 'NEUTRAL' ? '#a855f7' : (result.winner ? '#eab308' : '#06b6d4');
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 760, 560);
      
      // Draw Inner Border Glow
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, 740, 540);

      // Draw Sleek Brand Logo (top-left)
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('SD VERDICT', 50, 75);
      
      // Minimal geometric logo icon next to text
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(190, 58);
      ctx.lineTo(202, 75);
      ctx.lineTo(220, 58);
      ctx.stroke();

      // Draw Verdict Mode Tag (top-right)
      const modeText = mode === 'NEUTRAL' ? 'NEUTRAL ANALYSIS' : (mode === 'ANALYTICAL' ? 'ANALYTICAL COMPARISON' : 'RANKING DECISION');
      const tagColor = mode === 'NEUTRAL' ? '#a855f7' : (mode === 'ANALYTICAL' ? '#06b6d4' : '#eab308');
      
      ctx.font = 'bold 12px system-ui, sans-serif';
      const textWidth = ctx.measureText(modeText).width;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(750 - textWidth - 20, 55, textWidth + 20, 28);
      ctx.strokeStyle = tagColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(750 - textWidth - 20, 55, textWidth + 20, 28);
      
      ctx.fillStyle = tagColor;
      ctx.fillText(modeText, 750 - textWidth - 10, 73);

      // Title (Items list)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px system-ui, sans-serif';
      const titleText = getTitle();
      // Shrink text if it is too long
      if (ctx.measureText(titleText).width > 700) {
        ctx.font = 'bold 26px system-ui, sans-serif';
      }
      ctx.fillText(titleText, 50, 150);

      // Subtitle line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 180);
      ctx.lineTo(750, 180);
      ctx.stroke();

      // Main Content Area: Winner declaration or Analytical summary
      let contentY = 220;
      if (mode === 'RANKING' && result.winner) {
        // Draw Winner Card Background
        ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
        ctx.fillRect(50, 205, 700, 100);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
        ctx.strokeRect(50, 205, 700, 100);

        // Gold Winner Crown Icon Drawing
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('RECOMMENDED VERDICT', 80, 235);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.fillText(`🏆 WINNER: ${result.winner}`, 80, 275);

        // Confidence Rating
        ctx.fillStyle = '#8e9aa8';
        ctx.font = 'normal 14px system-ui, sans-serif';
        ctx.fillText(`Evaluation Confidence: ${result.confidence || 90}%`, 530, 258);
        
        contentY = 345;
      } else {
        // Analytical or Neutral Mode
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(50, 205, 700, 100);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeRect(50, 205, 700, 100);

        ctx.fillStyle = mode === 'NEUTRAL' ? '#a855f7' : '#06b6d4';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText(mode === 'NEUTRAL' ? 'NEUTRAL CONTEXT ANALYSIS' : 'SYSTEM TRADE-OFF ASSESSMENT', 80, 235);

        ctx.fillStyle = '#f3f0fa';
        ctx.font = 'normal 14px system-ui, sans-serif';
        
        // Wrap reasoning summary
        const summaryText = result.reasoningSummary || '';
        wrapText(ctx, summaryText, 80, 260, 640, 20);
        
        contentY = 345;
      }

      // Draw Key Takeaways / Trade-offs
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('KEY TAKEAWAYS & TRADE-OFFS', 50, contentY);
      
      ctx.fillStyle = '#d1d5db';
      ctx.font = 'normal 15px system-ui, sans-serif';
      let bulletY = contentY + 30;

      const itemsToRender = result.tradeOffs || [
        "Each entity offers unique functional paradigms.",
        "Structural variations necessitate contextual evaluation."
      ];

      itemsToRender.slice(0, 3).forEach((point) => {
        // Draw bullet point indicator
        ctx.fillStyle = tagColor;
        ctx.beginPath();
        ctx.arc(60, bulletY - 5, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw bullet text
        ctx.fillStyle = '#d1d5db';
        bulletY = wrapText(ctx, point, 80, bulletY, 670, 22) + 26;
      });

      // Draw Footer Copyright and URL
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 520);
      ctx.lineTo(750, 520);
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('Copyright © Sagar Dey 2026. All rights reserved.', 50, 550);
      
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('sdverdict.app', 700, 550);

      // Export canvas to PNG download
      const imageURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `sd-verdict-${items.join('-').toLowerCase()}.png`;
      link.href = imageURL;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Canvas text wrapper helper
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
  };

  const shareColorBorder = mode === 'NEUTRAL' ? 'neon-border-purple' : (result.winner ? 'neon-border-gold' : 'neon-border-cyan');
  const shareBgGlow = mode === 'NEUTRAL' ? 'bg-purple-500/5' : (result.winner ? 'bg-yellow-500/5' : 'bg-cyan-500/5');
  const accentText = mode === 'NEUTRAL' ? 'text-purple-400' : (result.winner ? 'text-yellow-400' : 'text-cyan-400');

  return (
    <div className="w-full space-y-4">
      {/* Visual Card Preview */}
      <div className={`relative p-5 rounded-2xl glass-card ${shareColorBorder} ${shareBgGlow} overflow-hidden`}>
        {/* Glow accent */}
        <div className={`absolute top-0 right-0 w-28 h-28 -mr-12 -mt-12 opacity-20 blur-2xl rounded-full ${mode === 'NEUTRAL' ? 'bg-purple-500' : (result.winner ? 'bg-yellow-500' : 'bg-cyan-500')}`} />
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
            SD Verdict Card
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${mode === 'NEUTRAL' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : (result.winner ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10')}`}>
            {mode === 'NEUTRAL' ? 'Neutral Analysis' : (mode === 'ANALYTICAL' ? 'Analytical' : 'Ranking')}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-3">
          {getTitle()}
        </h3>

        {mode === 'RANKING' && result.winner ? (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">
                Winner Verdict
              </div>
              <div className="text-base font-extrabold text-white">
                🏆 {result.winner}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-semibold">Confidence</span>
              <span className="text-sm font-bold font-mono text-yellow-400">{result.confidence || 90}%</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className={`text-[10px] font-bold ${accentText} uppercase tracking-wide mb-1`}>
              {mode === 'NEUTRAL' ? 'Neutral Breakdown' : 'Summary Assessment'}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed italic">
              "{result.reasoningSummary}"
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            Key Insights
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {(result.tradeOffs || []).slice(0, 3).map((trade, idx) => (
              <li key={idx} className="flex gap-2 items-start leading-tight">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${mode === 'NEUTRAL' ? 'bg-purple-500' : (result.winner ? 'bg-yellow-500' : 'bg-cyan-500')}`} />
                <span>{trade}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500">
          <span>Copyright © Sagar Dey 2026</span>
          <span className="font-bold">sdverdict.app</span>
        </div>
      </div>

      {/* Sharing Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] text-gray-300 hover:text-white text-xs font-semibold transition"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              Copied Link!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Share Link
            </>
          )}
        </button>

        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadImage}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-purple-500/10 disabled:opacity-55"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating...' : 'Download Image'}
        </button>
      </div>
    </div>
  );
}
