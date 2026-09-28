import React from 'react';
import { PaletteMode } from '../game/types';
import { RetroAudio } from '../audio/retroAudio';

interface CrtSettingsViewProps {
  paletteMode: PaletteMode;
  setPaletteMode: (mode: PaletteMode) => void;
  scanlines: boolean;
  setScanlines: (val: boolean) => void;
  crtCurvature: boolean;
  setCrtCurvature: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (val: boolean) => void;
  onClose: () => void;
}

export const CrtSettingsView: React.FC<CrtSettingsViewProps> = ({
  paletteMode,
  setPaletteMode,
  scanlines,
  setScanlines,
  crtCurvature,
  setCrtCurvature,
  soundEnabled,
  setSoundEnabled,
  musicEnabled,
  setMusicEnabled,
  onClose
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a120c] border-2 border-[#3d6e4b] rounded-lg p-5 text-[#8efcb2] font-mono shadow-[0_0_30px_rgba(0,255,100,0.1)]">
      <div className="flex items-center justify-between pb-3 border-b border-[#2d5238] mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[#ffe600] text-xl font-bold">⚙️ 映像管與音源設定 (CRT & DISPLAY SETUP)</span>
          <span className="text-xs text-[#528d63] hidden sm:inline">1984 MONITOR CALIBRATION</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-[#1a2e20] hover:bg-[#284a32] text-white border border-[#4e8f60] text-xs rounded transition-colors"
        >
          返回作戰 [ESC]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monitor Aesthetics Section */}
        <div className="bg-[#060c08] border border-[#1e3826] p-4 rounded space-y-4">
          <h3 className="text-[#ffe600] text-sm font-bold border-b border-[#1b3524] pb-2">
            1. 螢幕顯像濾鏡 (CRT MONITOR DISPLAY)
          </h3>

          {/* Palette Mode */}
          <div>
            <label className="text-xs text-[#5aa872] block mb-2">顯像管色彩模式 (PALETTE MODE):</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setPaletteMode('PC88_COLOR');
                  RetroAudio.uiClick();
                }}
                className={`p-2 text-xs rounded border text-center transition-colors ${
                  paletteMode === 'PC88_COLOR'
                    ? 'bg-[#ffe600] text-black border-[#ffe600] font-bold'
                    : 'bg-[#122216] text-[#72ff72] border-[#294c34] hover:border-[#4e8f60]'
                }`}
              >
                1984 原色
              </button>
              <button
                onClick={() => {
                  setPaletteMode('GREEN_PHOSPHOR');
                  RetroAudio.uiClick();
                }}
                className={`p-2 text-xs rounded border text-center transition-colors ${
                  paletteMode === 'GREEN_PHOSPHOR'
                    ? 'bg-[#38ff70] text-black border-[#38ff70] font-bold'
                    : 'bg-[#122216] text-[#72ff72] border-[#294c34] hover:border-[#4e8f60]'
                }`}
              >
                綠色螢光屏
              </button>
              <button
                onClick={() => {
                  setPaletteMode('AMBER_PHOSPHOR');
                  RetroAudio.uiClick();
                }}
                className={`p-2 text-xs rounded border text-center transition-colors ${
                  paletteMode === 'AMBER_PHOSPHOR'
                    ? 'bg-[#ffaa00] text-black border-[#ffaa00] font-bold'
                    : 'bg-[#122216] text-[#72ff72] border-[#294c34] hover:border-[#4e8f60]'
                }`}
              >
                琥珀單色屏
              </button>
            </div>
          </div>

          {/* Scanlines Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-[#a4eec0] font-bold block">1984 掃描線效果 (CRT SCANLINES)</span>
              <span className="text-[10px] text-[#528d63]">模擬陰極射線管交錯掃描光柵</span>
            </div>
            <button
              onClick={() => {
                setScanlines(!scanlines);
                RetroAudio.uiClick();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded border ${
                scanlines
                  ? 'bg-[#38ff70] text-black border-[#38ff70]'
                  : 'bg-[#18281d] text-gray-400 border-[#2d4734]'
              }`}
            >
              {scanlines ? '已開啟 ON' : '已關閉 OFF'}
            </button>
          </div>

          {/* CRT Curvature / Vignette */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-[#a4eec0] font-bold block">球形曲面與暗角 (BEZEL CURVATURE)</span>
              <span className="text-[10px] text-[#528d63]">模擬 14 吋古董映像管物理弧度</span>
            </div>
            <button
              onClick={() => {
                setCrtCurvature(!crtCurvature);
                RetroAudio.uiClick();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded border ${
                crtCurvature
                  ? 'bg-[#38ff70] text-black border-[#38ff70]'
                  : 'bg-[#18281d] text-gray-400 border-[#2d4734]'
              }`}
            >
              {crtCurvature ? '已開啟 ON' : '已關閉 OFF'}
            </button>
          </div>
        </div>

        {/* Audio Synthesis Section */}
        <div className="bg-[#060c08] border border-[#1e3826] p-4 rounded space-y-4">
          <h3 className="text-[#ffe600] text-sm font-bold border-b border-[#1b3524] pb-2">
            2. 晶片音源通道 (PSG AUDIO SYNTH)
          </h3>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#a4eec0] font-bold block">音效通道 (SFX CHANNELS)</span>
              <span className="text-[10px] text-[#528d63]">閃光彈、蟲笛、王蟲奔騰與防線撞擊音</span>
            </div>
            <button
              onClick={() => {
                const s = RetroAudio.toggleSound();
                setSoundEnabled(s);
                RetroAudio.uiClick();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded border ${
                soundEnabled
                  ? 'bg-[#38ff70] text-black border-[#38ff70]'
                  : 'bg-[#18281d] text-gray-400 border-[#2d4734]'
              }`}
            >
              {soundEnabled ? '已開啟 ON' : '靜音 MUTE'}
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-[#a4eec0] font-bold block">背景旋律 (8-BIT BGM ENGINE)</span>
              <span className="text-[10px] text-[#528d63]">風之傳奇 8-Bit 即時合成旋律與琶音</span>
            </div>
            <button
              onClick={() => {
                const m = RetroAudio.toggleMusic();
                setMusicEnabled(m);
                RetroAudio.uiClick();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded border ${
                musicEnabled
                  ? 'bg-[#38ff70] text-black border-[#38ff70]'
                  : 'bg-[#18281d] text-gray-400 border-[#2d4734]'
              }`}
            >
              {musicEnabled ? '已開啟 ON' : '靜音 MUTE'}
            </button>
          </div>

          {/* Audio Engine Info */}
          <div className="p-3 bg-[#0d1810] border border-[#1a3022] rounded text-xs text-[#528d63] leading-relaxed">
            💡 本遊戲採用純 Web Audio API 即時運算震盪器（Oscillator）與增益包絡（ADSR Envelope），完全無須下載額外音頻檔案，忠實再現 1984 年日本個人電腦遊戲的硬體風貌。
          </div>
        </div>
      </div>
    </div>
  );
};
