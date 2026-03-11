import React from "react";

type Props = {
  count: number;
  text?: string;
  onIncrement: () => void;
  onDecrement?: () => void;
};

const MultipleProps = ({ count, text, onIncrement, onDecrement }: Props) => {
  console.log("re-render");

  return (
    <div>
      ViewRerender: {count}
      {text && <div>{text}</div>}
      <button onClick={() => onIncrement()}>Increment</button>
      {onDecrement && <button onClick={() => onDecrement()}>Decrement</button>}
    </div>
  );
};

export default MultipleProps;
