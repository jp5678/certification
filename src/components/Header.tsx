import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { UserProgress } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  progress: UserProgress;
  onUpdateName: (name: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  progress,
  onUpdateName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(progress.userName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
      setIsEditing(false);
    }
  };

  return (
    <header className="glass shadow-premium header-container no-print p-4">
      <div className="max-w-7xl header-content">
        
        {/* 로고 & 타이틀 */}
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/jeffrey_logo.png" 
               alt="제프리 교수 로고" 
               className="w-12 h-12 rounded-full border-2 border-teal-500 object-cover shadow-sm select-none"
               style={{ 
                 width: '48px', 
                 height: '48px', 
                 borderRadius: '50%',
                 border: '2px solid var(--teal-500)',
                 objectFit: 'cover'
               }} />
          <div>
            <h1 className="text-blue-900 flex flex-col" style={{ margin: 0, lineHeight: '1.35' }}>
              <span className="text-[10px] md:text-[11px] text-teal-600 font-bold tracking-wider" style={{ fontSize: '11px', color: 'var(--teal-600)' }}>
                제프리 교수의 AI기반 디지털 리터러시 역량 강화 자가학습 플랫폼
              </span>
              <span className="text-sm md:text-base font-extrabold text-blue-950 tracking-tight" style={{ fontSize: '1.05rem', color: 'var(--blue-900)' }}>
                Google Workspace for Education & Google Spreadsheet
              </span>
            </h1>
          </div>
        </div>

        {/* 탭 네비게이션 & 이름 입력 */}
        <div className="flex items-center gap-4 flex-wrap">
          <nav className="nav-section">
            {[
              { id: 'dashboard', label: '대시보드', icon: 'LayoutDashboard' },
              { id: 'review', label: '오답노트', icon: 'BookOpenCheck' },
              { id: 'stats', label: '학습 통계', icon: 'BarChart3' },
              { id: 'certificate', label: '수료증', icon: 'Award' },
            ].map((tab) => {
              const IconComponent = (Icons as any)[tab.icon];
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`tab-button ${isActive ? 'active' : ''}`}
                >
                  {IconComponent && <IconComponent size={16} />}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* 실시간 학생 이름 설정 보드 */}
          <div className="user-badge">
            <Icons.User size={16} className="text-slate-400" />
            {isEditing ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-1-5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-0-5 text-xs focus:outline-none focus:border-teal-500"
                  style={{ width: '100px', borderRadius: '4px' }}
                  autoFocus
                  maxLength={10}
                />
                <button type="submit" style={{ color: 'var(--teal-600)' }}>
                  <Icons.Check size={16} />
                </button>
                <button type="button" onClick={() => { setTempName(progress.userName); setIsEditing(false); }} style={{ color: 'var(--color-error)' }}>
                  <Icons.X size={16} />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1 text-xs">
                <span className="font-semibold text-slate-800">{progress.userName}님</span>
                <span className="text-slate-400 font-normal">(학생)</span>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ color: 'var(--slate-400)', marginLeft: '4px' }}
                  title="이름 수정"
                >
                  <Icons.Edit2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
