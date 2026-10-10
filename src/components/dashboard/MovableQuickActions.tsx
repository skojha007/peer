import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersRound,
  FolderKanban,
  Package,
  Wallet,
  UserCheck,
  Calendar,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Move,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QuickActionItem } from '../../types';

export const MovableQuickActions: React.FC = () => {
  const { quickActions, moveQuickAction, resetQuickActions } = useApp();
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getActionIcon = (name: string) => {
    switch (name) {
      case 'UsersRound':
        return <UsersRound className="w-4 h-4" />;
      case 'FolderKanban':
        return <FolderKanban className="w-4 h-4" />;
      case 'Package':
        return <Package className="w-4 h-4" />;
      case 'Wallet':
        return <Wallet className="w-4 h-4" />;
      case 'UserCheck':
        return <UserCheck className="w-4 h-4" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    // Move in appropriate direction
    if (draggedIndex < targetIndex) {
      for (let i = draggedIndex; i < targetIndex; i++) {
        moveQuickAction(i, 'down');
      }
    } else {
      for (let i = draggedIndex; i > targetIndex; i--) {
        moveQuickAction(i, 'up');
      }
    }
    setDraggedIndex(null);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#173D2A] flex items-center gap-2">
            Quick Actions
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF1DC] text-[#26783C]">
              Movable
            </span>
          </h2>
          <p className="text-xs text-[#687769]">Rapid campus navigation shortcuts.</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {isReordering ? (
            <>
              <button
                onClick={resetQuickActions}
                className="px-2 py-1 rounded-lg border border-[#DCE6D2] bg-[#FAFCF5] hover:bg-[#EAF1DC] text-[#687769] hover:text-[#173D2A] font-medium flex items-center gap-1 text-[11px]"
                title="Reset to default arrangement"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button
                onClick={() => setIsReordering(false)}
                className="px-2.5 py-1 rounded-lg bg-[#26783C] text-white font-bold flex items-center gap-1 text-[11px]"
              >
                <Check className="w-3 h-3" /> Done
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsReordering(true)}
              className="px-2.5 py-1 rounded-lg border border-[#DCE6D2] bg-[#FAFCF5] hover:bg-[#EAF1DC] text-[#173D2A] font-semibold flex items-center gap-1 text-[11px] transition-colors"
              title="Customize position of quick actions"
            >
              <Move className="w-3 h-3 text-[#26783C]" /> Reorder
            </button>
          )}
        </div>
      </div>

      {/* Grid of 6 Quick Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        {quickActions.map((action, idx) => {
          return (
            <div
              key={action.id}
              draggable={isReordering}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              className={`p-3 rounded-card border transition-all relative flex flex-col justify-between ${
                isReordering
                  ? 'bg-[#EAF1DC]/90 border-dashed border-[#26783C] cursor-grab active:cursor-grabbing shadow-xs'
                  : 'bg-[#FAFCF5] hover:bg-[#EEF4E3] border-[#DCE6D2] hover:border-[#26783C]/40 group'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAF1DC] text-[#26783C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getActionIcon(action.iconName)}
                </div>

                {/* Move Controls if in Reordering mode */}
                {isReordering ? (
                  <div className="flex items-center gap-0.5 bg-[#FAFCF5] rounded-md border border-[#DCE6D2] p-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveQuickAction(idx, 'up')}
                      className="p-1 hover:bg-[#EAF1DC] disabled:opacity-30 rounded text-[#173D2A]"
                      title="Move backward"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <GripVertical className="w-3 h-3 text-[#687769]" />
                    <button
                      type="button"
                      disabled={idx === quickActions.length - 1}
                      onClick={() => moveQuickAction(idx, 'down')}
                      className="p-1 hover:bg-[#EAF1DC] disabled:opacity-30 rounded text-[#173D2A]"
                      title="Move forward"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#A2BA95] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    #{idx + 1}
                  </span>
                )}
              </div>

              {/* Title & Desc */}
              {isReordering ? (
                <div>
                  <div className="font-bold text-xs text-[#173D2A] leading-tight">
                    {action.title}
                  </div>
                  <div className="text-[10px] text-[#687769] leading-tight mt-0.5">
                    {action.desc}
                  </div>
                </div>
              ) : (
                <Link to={action.to} className="block">
                  <div className="font-bold text-xs text-[#173D2A] group-hover:text-[#26783C] transition-colors leading-tight">
                    {action.title}
                  </div>
                  <div className="text-[10px] text-[#687769] leading-tight mt-0.5">
                    {action.desc}
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
