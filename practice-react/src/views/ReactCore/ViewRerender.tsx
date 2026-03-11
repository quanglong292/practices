import React, { startTransition } from "react";
import MultipleProps from "./MultipleProps";
type Props = {};

const ViewRerender = (props: Props) => {
  const [count, setCount] = React.useState(0);
  const [text, setText] = React.useState("");

  const handleIncrement = () => {
    setCount(count + 1);
    setTimeout(() => {
      startTransition(() => {
        setText(`Count is ${count + 1}`);
      });
    }, 1);
  };
  const handleDecrement = () => {
    setCount(count - 1);
    setTimeout(() => {
      setText(`Count is ${count - 1}`);
    }, 0);
  };

  return (
    <div>
      <MultipleProps
        count={count}
        text={text}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </div>
  );
};

export default ViewRerender;
