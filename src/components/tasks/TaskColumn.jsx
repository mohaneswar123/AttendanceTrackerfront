import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { STATUS_LABELS } from '../../hooks/useTaskBoard';

const DOT_COLOURS = { TODO: 'bg-slate-400', IN_PROGRESS: 'bg-primary-400', DONE: 'bg-emerald-400' };

// One Kanban column; also accepts drops when empty
function TaskColumn({ status, taskIds, loading, showHeader = true, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      aria-label={STATUS_LABELS[status]}
      className={`glass-panel rounded-3xl p-4 flex flex-col min-h-[16rem] transition-colors ${isOver ? 'border-primary-500/40 bg-primary-500/5' : ''}`}
    >
      {showHeader && (
        <h3 className="flex items-center gap-2 px-1 mb-4 font-bold text-white">
          <span className={`w-2 h-2 rounded-full ${DOT_COLOURS[status]}`} />
          {STATUS_LABELS[status]}
          <span className="ml-auto text-xs font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{taskIds.length}</span>
        </h3>
      )}
      <SortableContext id={status} items={taskIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-1 flex flex-col gap-3">
          {children}
          {taskIds.length === 0 && (
            <p className="flex-1 flex items-center justify-center text-sm text-slate-500 border border-dashed border-white/10 rounded-2xl py-8">
              {loading ? 'Loading…' : 'Nothing here yet.'}
            </p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

export default TaskColumn;
