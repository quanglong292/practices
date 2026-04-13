import Item from "./Item";
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

type Props = {
  items: any[];
  id: string | number;
};

const Column = ({ items, id }: Props) => {
  const columnId = `column-${id}`;
  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex flex-col gap-1 p-4 bg-blue-900 min-w-[128px] rounded-md",
        {
          "bg-green-700": isOver,
        },
      )}
    >
      {items.map((id, index) => {
        return (
          <div className="relative">
            <Item key={id} id={id} columnId={columnId} />
            {isOver && index === items.length - 1 && (
              <div className="h-1 absolute bottom-[-8px] left-0 right-0 bg-white animate-pulse rounded-md" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Column;
