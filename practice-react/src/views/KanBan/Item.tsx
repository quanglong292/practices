import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  id: string | number;
  columnId: string;
};

const Item = ({ id, columnId }: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${columnId}-drag-${id}`,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      className={clsx("w-24 h-24 bg-blue-300 p-4 rounded-md cursor-grab", {
        "cursor-grabbing": transform && transform.x !== 0 && transform.y !== 0,
      })}
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <span className="text-lg font-bold text-purple-800">{id}</span>
    </div>
  );
};

export default Item;
