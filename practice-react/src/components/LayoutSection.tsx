import React from "react";

type Props = {
  children: React.ReactNode;
};

const LayoutSection = ({ children }: Props) => {
  return <div className="h-full w-full">{children}</div>;
};

export default LayoutSection;
