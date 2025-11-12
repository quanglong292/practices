import clsx from "clsx";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const LayoutSection = ({ children, className }: Props) => {
  return <div className={clsx("h-screen w-screen", className)}>{children}</div>;
};

export default LayoutSection;
