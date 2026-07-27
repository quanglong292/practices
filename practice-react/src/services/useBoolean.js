import { useState } from "react";

const useBoolean = () => {
  const [value, setValue] = useState(false);

  return {
    value,
    setTrue: () => setValue(true),
    setFalse: () => setValue(false),
  };
};

export default useBoolean;
