import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from './fields';

function SortableEntry({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2.5 transition-all ${
        isDragging ? 'z-10 opacity-75 ring-2 ring-brand-500/30' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-3.5 flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-button border border-surface-200 bg-white text-surface-400 shadow-card transition-colors hover:border-brand-300 hover:bg-surface-50 hover:text-surface-600 active:cursor-grabbing dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:border-surface-600 dark:hover:bg-surface-700 touch-none"
        aria-roledescription="draggable"
        aria-label="Drag to reorder entry"
      >
        <DragHandle isDragging={isDragging} />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function EntryReorder({ items, renderItem, onChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => (item._id || item._key) === active.id);
    const newIndex = items.findIndex((item) => (item._id || item._key) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newItems = arrayMove(items, oldIndex, newIndex);
    onChange(newItems);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item._id || item._key)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item, index) => {
            const id = item._id || item._key;
            return (
              <SortableEntry key={id} id={id}>
                {renderItem(item, index)}
              </SortableEntry>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}