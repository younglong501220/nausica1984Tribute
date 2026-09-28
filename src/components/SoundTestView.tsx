import React, { useState } from 'react';
import { RetroAudio } from '../audio/retroAudio';

export const SoundTestView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isPlayingBgm, setIsPlayingBgm] = useState(RetroAudio.musicEnabled);
  const [lastPlayed, setLastPlayed] = useState<string>('NONE');

  const sfxList = [
    { id: 'flare', label: '蟲笛閃光彈發射 (FLARE LAUNCH)', action: () => RetroAudio.flare() },
    { id: 'explosion', label: '安撫閃光引爆 (FLASH EXPLODE)', action: () => RetroAudio.explosion() },
    { id: 'calm', label: '王蟲平息晶片音 (CALM CHIME)', action: () => RetroAudio.calm() },
    { id: 'whistle', label: '旋轉蟲笛共鳴 (INSECT WHISTLE)', action: () => RetroAudio.insectWhistle() },
    { id: 'alarm', label: '防線告急警報 (ALARM SIREN)', action: () => RetroAudio.alarm() },
    { id: 'impact', label: '風車防線受撞 (WALL IMPACT)', action: () => RetroAudio.wallHit() },
    { id: 'victory', label: '波次勝利號角 (VICTORY FANFARE)', action: () => RetroAudio.victory() },
    { id: 'gameover', label: '防線淪陷哀樂 (DEFENSE FALLEN)', action: () => RetroAudio.gameOver() },
    { id: 'click', label: '電腦終端按鍵 (TERMINAL BLIP)', action: () => RetroAudio.uiClick() }
  ];

  const handlePlaySfx = (item: { id: string; label: string; action: () => void }) => {
    RetroAudio.userGesture();
    item.action();
    setLastPlayed(item.label);
  };

  const handleToggleBgm = () => {
    RetroAudio.userGesture();
    const enabled = RetroAudio.toggleMusic();
    setIsPlayingBgm(enabled);
    setLastPlayed(enabled ? 'BGM: 風之傳奇 (1984 8-BIT TRIBUTE)' : 'BGM PAUSED');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a120c] border-2 border-[#3d6e4b] rounded-lg p-5 text-[#8efcb2] font-mono shadow-[0_0_30px_rgba(0,255,100,0.1)]">
      <div className="flex items-center justify-between pb-3 border-b border-[#2d5238] mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[#ffe600] text-xl font-bold">🎵 1984 PSG / FM 音源測試機 (SOUND TEST)</span>
          <span className="text-xs text-[#528d63] hidden sm:inline">PSG-AY-3-8910 EMULATOR</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-[#1a2e20] hover:bg-[#284a32] text-white border border-[#4e8f60] text-xs rounded transition-colors"
        >
          返回作戰 [ESC]
        </button>
      </div>

      {/* Monitor Display Box */}
      <div className="bg-[#050b07] border border-[#1b3524] p-3 rounded mb-5 flex items-center justify-between">
        <div>
          <span className="text-xs text-[#528d63] block">LAST TRIGGERED FREQUENCY REGISTER:</span>
          <span className="text-[#ffe600] font-bold text-sm">{lastPlayed}</span>
        </div>
        <button
          onClick={handleToggleBgm}
          className={`px-4 py-2 rounded text-xs font-bold border transition-colors ${
            isPlayingBgm
              ? 'bg-[#ffe600] text-black border-[#ffe600]'
              : 'bg-[#183321] text-[#72ff72] border-[#3d6e4b] hover:bg-[#264e33]'
          }`}
        >
          {isPlayingBgm ? '⏹ 停止背景音樂' : '▶ 播放風之傳奇 8-Bit BGM'}
        </button>
      </div>

      {/* SFX Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sfxList.map(item => (
          <button
            key={item.id}
            onClick={() => handlePlaySfx(item)}
            className="p-3 bg-[#112217] hover:bg-[#1b3524] active:bg-[#274c34] border border-[#2b5437] hover:border-[#4e8f60] rounded text-left transition-all group flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-[#a4eec0] group-hover:text-white">
              {item.label}
            </span>
            <span className="text-[10px] text-[#4d7e5b] mt-2 block">PLAY VOICE CHIP &gt;</span>
          </button>
        ))}
      </div>

      <div className="mt-5 pt-3 border-t border-[#1c3524] text-xs text-[#528d63] flex justify-between">
        <span>AUDIO SYNTHESIS: WEB AUDIO OSCILLATOR + GAIN ENVELOPE</span>
        <span>NO AUDIO SAMPLES USED (PURE MATHEMATICAL OSCILLATIONS)</span>
      </div>
    </div>
  );
};
