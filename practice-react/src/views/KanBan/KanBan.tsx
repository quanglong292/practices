import React, { useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import Column from "./Column";

const KanBan = () => {
  const [data, setData] = useState([[1, 2, 3, 4, 5], [6], [7], [], []]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const dropColumnIndex = over
      ? parseInt(over.id.toString().split("-")[1])
      : -1;
    const values = active.id.toString().split("-");
    const itemId = parseInt(values[values.length - 1]);
    const activeColumnIndex = parseInt(values[1]);
    // console.log({ over, active, dropColumnIndex, itemId, activeColumnIndex });

    if (dropColumnIndex < 0 || !itemId) return;
    if (dropColumnIndex === activeColumnIndex) return;

    setData((prev) => {
      const newData = prev.map((column) => [...column]);

      newData[activeColumnIndex] = newData[activeColumnIndex].filter(
        (id) => id !== itemId,
      );
      newData[dropColumnIndex].push(itemId);
      return newData;
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-2">
        {data.map((column, index) => {
          return <Column key={index} items={column} id={index} />;
        })}
      </div>
    </DndContext>
  );
};

export default KanBan;
