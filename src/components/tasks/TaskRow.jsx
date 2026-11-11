import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { dayLabel, isDone, isOverdue, stepsLabel } from '../../utils/tasks';
import { CheckIcon, ListIcon, StarIcon } from '../icons';

// Keeps a press on the circle or the star from starting a drag
const noDrag = {
  onPointerDown: (e) => e.stopPropagation(),
  onKeyDown: (e) => e.stopPropagation()
};

/**
 * One task.
 *
 * The circle is the whole row's purpose, so it is the first thing and the biggest target.
 * The star is on the right, away from it, because starring by accident while trying to
 * finish something is annoying in a way the reverse is not.
 */
export function TaskRowBody({ task, dragging = false, onToggle, onStar, onOpen, busy }) {
  const done = isDone(task);
  const overdue = isOverdue(task);
  const steps = stepsLabel(task);

  return (
    <div className={`surface flex items-center gap-3 p-3 ${dragging ? 'rotate-1' : ''} ${done ? 'opacity-60' : ''}`}>
      {/* Ticking a task off is the most frequent action in Tasks and it sits right beside
          the title, so a near-miss used to open the task instead of completing it. The
          circle stays 24px to the eye; the button around it is a full 44px to the thumb.
          The growth is upward, downward and rightward only — overhanging to the left would
          cover the row's own padding, which is where a drag is grabbed from. */}
      <div {...noDrag} className="-my-2.5 -mr-2.5">
        <button
          type="button"
          onClick={() => onToggle(task)}
          disabled={busy}
          aria-pressed={done}
          aria-label={done ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
          className="group w-11 h-11 shrink-0 grid place-items-center disabled:opacity-50"
        >
          <span
            className={`w-6 h-6 rounded-full border-2 grid place-items-center transition-colors ${done
              ? 'bg-tasks border-tasks text-white'
              : 'border-line group-hover:border-tasks'}`}
          >
            {done && <CheckIcon className="w-3.5 h-3.5" />}
          </span>
        </button>
      </div>

      <button type="button" onClick={() => onOpen(task)} className="flex-1 min-w-0 text-left">
        <p className={`text-sm font-medium truncate ${done ? 'line-through text-slate-400' : 'text-white'}`}>
          {task.title}
        </p>
        {(overdue || steps || task.note || task.taskDate) && (
          <p className="mt-0.5 text-xs flex items-center gap-2 flex-wrap">
            <span className={overdue ? 'text-rose-400 font-medium' : 'text-slate-400'}>
              {dayLabel(task.taskDate)}
            </span>
            {steps && (
              <span className="text-slate-400 inline-flex items-center gap-1">
                <ListIcon className="w-3 h-3" aria-hidden="true" />
                {steps}
              </span>
            )}
            {task.note && <span className="text-slate-400 truncate max-w-[12rem]">{task.note}</span>}
          </p>
        )}
      </button>

      <div {...noDrag}>
        <button
          type="button"
          onClick={() => onStar(task)}
          disabled={busy}
          aria-pressed={Boolean(task.important)}
          aria-label={task.important ? `Remove the star from "${task.title}"` : `Star "${task.title}"`}
          className={`w-11 h-11 shrink-0 rounded-lg grid place-items-center transition-colors ${task.important
            ? 'text-streak'
            : 'text-slate-400 hover:text-slate-300'}`}
        >
          <StarIcon className="w-[18px] h-[18px]" filled={task.important} />
        </button>
      </div>
    </div>
  );
}

/** The same row, draggable so the student can set their own order */
function TaskRow({ task, ...actions }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-tasks ${isDragging ? 'opacity-30' : ''}`}
      {...attributes}
      {...listeners}
    >
      <TaskRowBody task={task} {...actions} />
    </li>
  );
}

export default TaskRow;
