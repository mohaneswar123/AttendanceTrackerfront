import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { STATUSES } from '../../hooks/useTaskBoard';
import TaskColumn from './TaskColumn';
import TaskCard, { TaskCardBody } from './TaskCard';

// The drag-and-drop board. `visibleStatuses` is all three columns on desktop and the
// chosen one on phones. onMove(task, status, index) fires once, when a card is dropped.
function TaskBoard({ columns, visibleStatuses, loading, onMove, cardActions }) {
  // While dragging, the ids in each column including the card's preview position
  const [dragItems, setDragItems] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    // A short movement before dragging, so the card's buttons still click
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // A long press on phones, so swiping still scrolls the page
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const savedItems = useMemo(
    () => Object.fromEntries(STATUSES.map(status => [status, columns[status].map(t => t.id)])),
    [columns]
  );
  const tasksById = useMemo(
    () => new Map(STATUSES.flatMap(status => columns[status].map(t => [t.id, t]))),
    [columns]
  );
  const items = dragItems || savedItems;

  // `id` is a column (dropping on its empty space) or a card in one
  const columnOf = (itemsByColumn, id) =>
    STATUSES.includes(id) ? id : STATUSES.find(status => itemsByColumn[status].includes(id));

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    setDragItems(savedItems);
  };

  // Moving over another column shows the card there straight away
  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    setDragItems(prev => {
      const current = prev || savedItems;
      const from = columnOf(current, active.id);
      const to = columnOf(current, over.id);
      if (!from || !to || from === to) return current;
      const target = current[to].filter(id => id !== active.id);
      const overIndex = target.indexOf(over.id);
      target.splice(overIndex >= 0 ? overIndex : target.length, 0, active.id);
      return { ...current, [from]: current[from].filter(id => id !== active.id), [to]: target };
    });
  };

  const handleDragEnd = ({ active, over }) => {
    const current = dragItems;
    setActiveId(null);
    setDragItems(null);
    if (!over || !current) return;

    const status = columnOf(current, active.id);
    let ids = current[status];
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (to >= 0 && to !== from) ids = arrayMove(ids, from, to);

    const task = tasksById.get(active.id);
    const index = ids.indexOf(active.id);
    if (task && (status !== task.status || index !== savedItems[status].indexOf(active.id))) {
      onMove(task, status, index);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setDragItems(null);
  };

  const activeTask = activeId ? tasksById.get(activeId) : null;
  const singleColumn = visibleStatuses.length === 1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={singleColumn ? '' : 'grid grid-cols-3 gap-5 items-start'}>
        {visibleStatuses.map(status => (
          <TaskColumn key={status} status={status} taskIds={items[status]} loading={loading} showHeader={!singleColumn}>
            {items[status].map(id => {
              const task = tasksById.get(id);
              return task && (
                <TaskCard
                  key={id}
                  task={task}
                  onMoveTo={(to) => cardActions.onMoveTo(task, to)}
                  onEdit={() => cardActions.onEdit(task)}
                  onDelete={() => cardActions.onDelete(task)}
                />
              );
            })}
          </TaskColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCardBody task={activeTask} dragging />}
      </DragOverlay>
    </DndContext>
  );
}

export default TaskBoard;
