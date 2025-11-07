import React from "react";

type Props = {
  children: React.ReactNode;
};

const LayoutSection = ({ children }: Props) => {
  return <div>{children}</div>;
};

export default LayoutSection;
