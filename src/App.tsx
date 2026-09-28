/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { HeaderBar, NavTab } from './components/HeaderBar';
import { ManualView } from './components/ManualView';
import { LeaderboardView } from './components/LeaderboardView';
import { SoundTestView } from './components/SoundTestView';
import { CrtSettingsView } from './components/CrtSettingsView';
import { PaletteMode } from './game/types';
import { RetroAudio } from './audio/retroAudio';
import { BookOpen, Trophy, Music, Sliders, Gamepad2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('GAME');
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('PC88_COLOR');
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [crtCurvature, setCrtCurvature] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);

  const [score, setScore] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [defense, setDefense] = useState<number>(100);

  const handleScoreUpdate = (s: number, w: number, d: number) => {
    setScore(s);
    setWave(w);
    setDefense(d);
  };

  const handleToggleSound = () => {
    const s = RetroAudio.toggleSound();
    setSoundEnabled(s);
  };

  const handleToggleMusic = () => {
    const m = RetroAudio.toggleMusic();
    setMusicEnabled(m);
  };

  return (
    <div className="min-h-screen bg-[#06090d] text-[#72ff72] flex flex-col items-center justify-between pb-10">
      {/* Top Bar with Top Bar Contract */}
      <HeaderBar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        musicEnabled={musicEnabled}
        onToggleMusic={handleToggleMusic}
      />

      {/* Main Container */}
      <main className="w-full max-w-5xl px-3 sm:px-4 py-4 flex flex-col items-center flex-1">
        {/* Sub-header Context / 1984 Computer Banner */}
        <div className="w-full max-w-4xl flex items-center justify-between text-xs text-[#528d63] pb-2 mb-2 border-b border-[#132218]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#38ff70] shadow-[0_0_8px_#38ff70] animate-pulse" />
            <span>NEC PC-8801mkII N88-BASIC ROM MODE</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[#72ff72]">
            <span>波次: {wave}/5</span>
            <span>防線: {Math.round(defense)}%</span>
            <span>功勳: {score.toString().padStart(6, '0')}</span>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'GAME' && (
          <div className="w-full flex flex-col items-center">
            <GameCanvas
              paletteMode={paletteMode}
              scanlines={scanlines}
              crtCurvature={crtCurvature}
              soundEnabled={soundEnabled}
              musicEnabled={musicEnabled}
              onScoreUpdate={handleScoreUpdate}
            />

            {/* Quick Operational Guidelines under the monitor */}
            <div className="w-full max-w-4xl mt-3 p-3 bg-[#08100b] border border-[#1b3323] rounded text-xs text-[#8cfcb2] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[#ffe600] font-bold mr-1">飛行操作：</span>
                <span>[WASD / 方向鍵] 移動滑翔翼「雨燕」 · [<span className="text-[#ffe600] font-bold">空白鍵 SPACE</span>] 投擲閃光彈 · [<span className="text-[#7ef9ff] font-bold">E 鍵</span>] 旋轉蟲笛</span>
              </div>
              <div className="text-[11px] text-[#558e65] shrink-0">
                安撫紅眼王蟲（轉為蔚藍退回腐海），保衛左側風車防線！
              </div>
            </div>
          </div>
        )}

        {activeTab === 'MANUAL' && (
          <div className="w-full">
            <ManualView onClose={() => setActiveTab('GAME')} />
          </div>
        )}

        {activeTab === 'LEADERBOARD' && (
          <div className="w-full">
            <LeaderboardView onClose={() => setActiveTab('GAME')} currentHighScore={score} />
          </div>
        )}

        {activeTab === 'SOUND_TEST' && (
          <div className="w-full">
            <SoundTestView onClose={() => setActiveTab('GAME')} />
          </div>
        )}

        {activeTab === 'CRT_SETTINGS' && (
          <div className="w-full">
            <CrtSettingsView
              paletteMode={paletteMode}
              setPaletteMode={setPaletteMode}
              scanlines={scanlines}
              setScanlines={setScanlines}
              crtCurvature={crtCurvature}
              setCrtCurvature={setCrtCurvature}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              musicEnabled={musicEnabled}
              setMusicEnabled={setMusicEnabled}
              onClose={() => setActiveTab('GAME')}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#08110b]/95 border-t border-[#1e3827] py-2 px-3 flex items-center justify-around z-40 backdrop-blur">
        <button
          onClick={() => {
            RetroAudio.uiClick();
            setActiveTab('GAME');
          }}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'GAME' ? 'text-[#ffe600]' : 'text-[#568a65]'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>作戰</span>
        </button>
        <button
          onClick={() => {
            RetroAudio.uiClick();
            setActiveTab('MANUAL');
          }}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'MANUAL' ? 'text-[#ffe600]' : 'text-[#568a65]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>手冊</span>
        </button>
        <button
          onClick={() => {
            RetroAudio.uiClick();
            setActiveTab('LEADERBOARD');
          }}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'LEADERBOARD' ? 'text-[#ffe600]' : 'text-[#568a65]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>功勳</span>
        </button>
        <button
          onClick={() => {
            RetroAudio.uiClick();
            setActiveTab('SOUND_TEST');
          }}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'SOUND_TEST' ? 'text-[#ffe600]' : 'text-[#568a65]'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>音源</span>
        </button>
        <button
          onClick={() => {
            RetroAudio.uiClick();
            setActiveTab('CRT_SETTINGS');
          }}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'CRT_SETTINGS' ? 'text-[#ffe600]' : 'text-[#568a65]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>設定</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 pt-4 border-t border-[#122116] flex flex-col sm:flex-row items-center justify-between text-xs text-[#487856] gap-2">
        <div>
          <span>風之谷：王蟲的襲擊 (風の谷のナウシカ 王蟲の襲撃) · 1984 PC-8801 / MSX 紀念獻禮</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Web Audio PSG 音源合成</span>
          <span aria-hidden="true">·</span>
          <span>純純 HTML5 Canvas 渲染</span>
        </div>
      </footer>
    </div>
  );
}
