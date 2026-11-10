import React from 'react';
import {
  DndContext, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskRow from './TaskRow';

/**
 * The tasks of one view, under their group headings.
 *
 * Overdue is a heading like any other rather than a separate screen, so unfinished work
 * from an earlier day sits directly above today's and is impossible to miss.
 */
function TaskList({ groups, onToggle, onStar, onOpen, onReorder, onGroupAction, busy, empty }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } })
  );

  if (groups.length === 0) {
    return (
      <section className="surface p-8 text-center" aria-label={empty.title}>
        <h2 className="font-semibold text-white">{empty.title}</h2>
        <p className="text-sm text-slate-500 mt-1">{empty.body}</p>
      </section>
    );
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-5">
        {groups.map(group => (
          <section key={group.id} aria-label={group.title}>
            <div className="flex items-center gap-2 px-1 mb-2">
              <h2 className={`text-xl font-bold ${group.tone === 'overdue' ? 'text-rose-400' : 'text-white'}`}>
                {group.title}
              </h2>
              <span className="text-sm text-slate-500 flex-1">{group.tasks.length}</span>
              {/* The group's own way out: move a pile of overdue work, or clear a finished day */}
              {group.action && onGroupAction && (
                <button
                  type="button"
                  onClick={() => onGroupAction(group)}
                  disabled={busy}
                  className="h-9 px-3.5 shrink-0 rounded-full bg-background-paper text-sm font-bold text-slate-200 hover:text-white disabled:opacity-50"
                >
                  {group.action === 'moveToToday' ? 'Move to today' : 'Clear all'}
                </button>
              )}
            </div>
            <SortableContext items={group.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {group.tasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    busy={busy}
                    onToggle={onToggle}
                    onStar={onStar}
                    onOpen={onOpen}
                  />
                ))}
              </ul>
            </SortableContext>
          </section>
        ))}
      </div>
    </DndContext>
  );
}

export default TaskList;
