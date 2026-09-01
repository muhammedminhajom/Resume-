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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from './fields';

function SortableEntry({ id, children, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 rounded-input border bg-white px-3.5 py-2.5 text-sm font-medium shadow-card transition-all ${
        isDragging
          ? 'z-10 shadow-elevated ring-2 ring-brand-500/30 cursor-grabbing'
          : 'cursor-grab hover:border-brand-300 hover:shadow-card-hover active:cursor-grabbing'
      }`}
      role="button"
      aria-roledescription="draggable"
      aria-label="Drag to reorder"
    >
      <DragHandle isDragging={isDragging} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function EntryReorder({ items, renderItem, onChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
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
        <div className="space-y-2">
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