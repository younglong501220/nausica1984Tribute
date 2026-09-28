import React, { useState, useEffect } from 'react';
import { HighScoreEntry } from '../game/types';

export const LeaderboardView: React.FC<{ onClose: () => void; currentHighScore: number }> = ({
  onClose,
  currentHighScore
}) => {
  const [entries, setEntries] = useState<HighScoreEntry[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem('nausicaa_hall_of_fame');
      if (data) {
        setEntries(JSON.parse(data));
      } else {
        // Default historical arcade entries
        const defaults: HighScoreEntry[] = [
          { name: 'NAUSICAÄ', score: 6200, wave: 5, date: '1984/03/11', title: '金色原野的奇蹟' },
          { name: 'YUPA M.', score: 4850, wave: 4, date: '1984/03/15', title: '風之谷第一劍士' },
          { name: 'MITO_ENG', score: 3400, wave: 3, date: '1984/03/20', title: '巨型砲艇輪機長' },
          { name: 'ASBEL_PE', score: 2600, wave: 2, date: '1984/04/01', title: '培吉特滑翔飛手' },
          { name: 'KUSHANA', score: 1800, wave: 2, date: '1984/04/05', title: '多魯美奇亞第四親王' }
        ];
        if (currentHighScore > 1800) {
          defaults.unshift({
            name: 'PLAYER',
            score: currentHighScore,
            wave: 3,
            date: new Date().toLocaleDateString(),
            title: '風之谷守護者'
          });
          defaults.sort((a, b) => b.score - a.score);
        }
        setEntries(defaults);
        localStorage.setItem('nausicaa_hall_of_fame', JSON.stringify(defaults));
      }
    } catch {
      // fallback
    }
  }, [currentHighScore]);

  const clearScores = () => {
    localStorage.removeItem('nausicaa_hall_of_fame');
    localStorage.removeItem('nausicaa_high_score');
    setEntries([
      { name: 'NAUSICAÄ', score: 5000, wave: 5, date: '1984/03/11', title: '金色原野的奇蹟' }
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a120c] border-2 border-[#3d6e4b] rounded-lg p-5 text-[#8efcb2] font-mono shadow-[0_0_30px_rgba(0,255,100,0.1)]">
      <div className="flex items-center justify-between pb-3 border-b border-[#2d5238] mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[#ffe600] text-xl font-bold">🏆 風之谷 功勳戰績榜 (HALL OF FAME)</span>
          <span className="text-xs text-[#528d63] hidden sm:inline">TOP PILOT ARCHIVES</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-[#1a2e20] hover:bg-[#284a32] text-white border border-[#4e8f60] text-xs rounded transition-colors"
        >
          返回作戰 [ESC]
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#1f3b28] text-xs text-[#5aa872]">
              <th className="py-2 px-3">排名</th>
              <th className="py-2 px-3">飛行員</th>
              <th className="py-2 px-3">守護榮譽積分</th>
              <th className="py-2 px-3">波次</th>
              <th className="py-2 px-3">授勳稱號</th>
              <th className="py-2 px-3">記錄日期</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#15291c]">
            {entries.map((item, idx) => (
              <tr key={idx} className={idx === 0 ? 'text-[#ffe600] font-bold' : 'text-[#a4eec0]'}>
                <td className="py-2.5 px-3">
                  {idx === 0 ? '👑 01' : idx === 1 ? '🥈 02' : idx === 2 ? '🥉 03' : `  0${idx + 1}`}
                </td>
                <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                <td className="py-2.5 px-3 tabular-nums">{item.score.toString().padStart(6, '0')}</td>
                <td className="py-2.5 px-3">WAVE {item.wave}</td>
                <td className="py-2.5 px-3 text-xs">{item.title}</td>
                <td className="py-2.5 px-3 text-xs text-[#639c75]">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 pt-3 border-t border-[#1c3524] flex items-center justify-between">
        <button
          onClick={clearScores}
          className="text-xs text-[#d9534f] hover:text-[#ff7875] transition-colors"
        >
          [重置戰績歷史]
        </button>
        <span className="text-xs text-[#528d63]">記錄存儲於 PC-8801 本機磁區</span>
      </div>
    </div>
  );
};
