import React, { useState } from 'react';
import { GAME_LORE } from '../game/loreData';

export const ManualView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('story');

  const currentChapter = GAME_LORE.find(c => c.id === activeTab) || GAME_LORE[0];

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a120c] border-2 border-[#3d6e4b] rounded-lg p-5 text-[#8efcb2] font-mono shadow-[0_0_30px_rgba(0,255,100,0.1)]">
      <div className="flex items-center justify-between pb-3 border-b border-[#2d5238] mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[#ffe600] text-xl font-bold">📜 PC-8801 原廠發行手冊 (1984 EDITION)</span>
          <span className="text-xs text-[#528d63] hidden sm:inline">TOPCRAFT / TOKUMA SHOTEN TRIBUTE</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-[#1a2e20] hover:bg-[#284a32] text-white border border-[#4e8f60] text-xs rounded transition-colors"
        >
          返回作戰 [ESC]
        </button>
      </div>

      {/* Chapters Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-[#1c3524]">
        {GAME_LORE.map(chap => (
          <button
            key={chap.id}
            onClick={() => setActiveTab(chap.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
              activeTab === chap.id
                ? 'bg-[#ffe600] text-black border-[#ffe600]'
                : 'bg-[#122216] text-[#72ff72] border-[#294c34] hover:border-[#4e8f60]'
            }`}
          >
            {chap.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-[#060c08] border border-[#1e3826] p-4 rounded min-h-[260px] text-sm leading-relaxed">
        <h3 className="text-[#ffe600] text-base font-bold mb-1">{currentChapter.title}</h3>
        <p className="text-xs text-[#5aa872] mb-4">{currentChapter.subtitle}</p>

        <div className="space-y-3">
          {currentChapter.content.map((paragraph, idx) => (
            <p key={idx} className="text-[#a4eec0]">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Retro Footnote */}
      <div className="mt-4 pt-3 border-t border-[#1c3524] flex items-center justify-between text-xs text-[#528d63]">
        <span>SYSTEM: NEC PC-8801mkII / MSX-ROM 32KB</span>
        <span>© 1984 STUDIO GHIBLI / TOPCRAFT TRIBUTE</span>
      </div>
    </div>
  );
};
