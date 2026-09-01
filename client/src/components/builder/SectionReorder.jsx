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
import { sectionLabel } from '../../lib/resume';

function SortableRow({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

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
      aria-label={`${sectionLabel(id)} section, drag to reorder`}
    >
      <svg
        className={`h-4 w-4 shrink-0 ${isDragging ? 'text-brand-500' : 'text-surface-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M7 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM13 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM13 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM13 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
      </svg>
      {sectionLabel(id)}
    </div>
  );
}

export default function SectionReorder({ order, onChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id);
    const newIndex = order.indexOf(over.id);
    onChange(arrayMove(order, oldIndex, newIndex));
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {order.map((id) => (
              <SortableRow key={id} id={id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="mt-2 text-xs text-surface-400">Drag to reorder sections on your resume.</p>
    </div>
  );
}
