import React, { useState, useRef, useEffect } from "react";

const FloatingToolbar = () => {
  const [position, setPosition] = useState({ top: 0, left: 0, show: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelection = () => {
    const selection = window.getSelection();

    // console.log({ selection });

    // Nếu không có text nào được bôi đen (isCollapsed = true)
    if (!selection || selection.isCollapsed) {
      setPosition((prev) => ({ ...prev, show: false }));
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    console.log({ range, rect });

    // Tính toán vị trí để toolbar nằm chính giữa phía trên đoạn text
    // Trừ đi chiều cao toolbar (ví dụ 40px) và cộng thêm scroll hiện tại
    // setPosition({
    //   top: rect.top + window.scrollY - 45,
    //   left: rect.left + window.scrollX + rect.width / 2,
    //   show: true,
    // });
    setPosition({
      top: rect.top - 60,
      left: rect.left,
      show: true,
    });
  };

  useEffect(() => {
    const handleMouseUp = () => {
      handleSelection();
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onMouseUp={handleSelection}
        className="relative p-10"
      >
        <p>Bôi đen đoạn văn bản này để test thử trong dự án SMP của b nhé...</p>
        <p>Bôi đen đoạn văn bản này để test thử trong dự án SMP của b nhé...</p>
        <p>Bôi đen đoạn văn bản này để test thử trong dự án SMP của b nhé...</p>
      </div>

      {position.show && (
        <div
          className="absolute z-50 flex gap-2 p-1 bg-black rounded shadow-lg -translate-x-1/2 transition-all"
          style={{ top: position.top, left: position.left }}
        >
          <button className="text-white px-2 hover:bg-gray-700">B</button>
          <button className="text-white px-2 hover:bg-gray-700">I</button>
          <button className="text-white px-2 hover:bg-gray-700">Link</button>
        </div>
      )}
    </>
  );
};

export default FloatingToolbar;
