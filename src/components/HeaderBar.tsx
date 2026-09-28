import React from 'react';
import { RetroAudio } from '../audio/retroAudio';
import { Volume2, VolumeX, Radio } from 'lucide-react';

export type NavTab = 'GAME' | 'MANUAL' | 'LEADERBOARD' | 'SOUND_TEST' | 'CRT_SETTINGS';

interface HeaderBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentTab,
  onSelectTab,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 py-3 border-b border-[#1f3827] bg-[#070b08]/95 backdrop-blur-sm sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => {
          RetroAudio.uiClick();
          onSelectTab('GAME');
        }}
        className="text-base sm:text-lg font-bold tracking-wider text-[#72ff72] hover:text-[#a4eec0] transition-colors whitespace-nowrap glow-green text-left"
      >
        風之谷：王蟲的襲擊 1984
      </button>

      {/* Zone 2: Clean navigation links */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-semibold tracking-wider text-[#76a885]">
        <button
          onClick={() => {
            RetroAudio.uiClick();
            onSelectTab('GAME');
          }}
          className={`hover:text-[#72ff72] transition-colors whitespace-nowrap pb-0.5 ${
            currentTab === 'GAME' ? 'text-[#ffe600] border-b-2 border-[#ffe600]' : ''
          }`}
        >
          作戰防線
        </button>
        <button
          onClick={() => {
            RetroAudio.uiClick();
            onSelectTab('MANUAL');
          }}
          className={`hover:text-[#72ff72] transition-colors whitespace-nowrap pb-0.5 ${
            currentTab === 'MANUAL' ? 'text-[#ffe600] border-b-2 border-[#ffe600]' : ''
          }`}
        >
          1984 手冊
        </button>
        <button
          onClick={() => {
            RetroAudio.uiClick();
            onSelectTab('LEADERBOARD');
          }}
          className={`hover:text-[#72ff72] transition-colors whitespace-nowrap pb-0.5 ${
            currentTab === 'LEADERBOARD' ? 'text-[#ffe600] border-b-2 border-[#ffe600]' : ''
          }`}
        >
          功勳榜
        </button>
        <button
          onClick={() => {
            RetroAudio.uiClick();
            onSelectTab('SOUND_TEST');
          }}
          className={`hover:text-[#72ff72] transition-colors whitespace-nowrap pb-0.5 ${
            currentTab === 'SOUND_TEST' ? 'text-[#ffe600] border-b-2 border-[#ffe600]' : ''
          }`}
        >
          晶片音源
        </button>
        <button
          onClick={() => {
            RetroAudio.uiClick();
            onSelectTab('CRT_SETTINGS');
          }}
          className={`hover:text-[#72ff72] transition-colors whitespace-nowrap pb-0.5 ${
            currentTab === 'CRT_SETTINGS' ? 'text-[#ffe600] border-b-2 border-[#ffe600]' : ''
          }`}
        >
          映像管校正
        </button>
      </nav>

      {/* Zone 3: Primary quick actions */}
      <div className="flex items-center gap-2">
        {/* Toggle BGM */}
        <button
          onClick={() => {
            RetroAudio.userGesture();
            RetroAudio.uiClick();
            onToggleMusic();
          }}
          title={musicEnabled ? '關閉背景音樂' : '開啟背景音樂'}
          className={`p-1.5 rounded border transition-colors flex items-center gap-1 text-xs ${
            musicEnabled
              ? 'bg-[#14291a] text-[#72ff72] border-[#376b45]'
              : 'bg-[#131a15] text-[#55695a] border-[#202d23]'
          }`}
          aria-label="背景音樂開關"
        >
          <Radio className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">{musicEnabled ? 'BGM' : 'BGM關'}</span>
        </button>

        {/* Toggle SFX */}
        <button
          onClick={() => {
            RetroAudio.userGesture();
            RetroAudio.uiClick();
            onToggleSound();
          }}
          title={soundEnabled ? '關閉音效' : '開啟音效'}
          className={`p-1.5 rounded border transition-colors flex items-center gap-1 text-xs ${
            soundEnabled
              ? 'bg-[#14291a] text-[#72ff72] border-[#376b45]'
              : 'bg-[#131a15] text-[#55695a] border-[#202d23]'
          }`}
          aria-label="音效開關"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[11px]">{soundEnabled ? '音效' : '靜音'}</span>
        </button>
      </div>
    </header>
  );
};
