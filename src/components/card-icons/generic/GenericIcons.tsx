"use client";

import Image from "next/image";
import { Tooltip } from "antd";

export const GenericIcons = (props: {
  className?: string;
  src: string;
  title: string;
}) => {
  const { className, src, title } = props;

  return (
    <Tooltip title={title}>
      <Image
        src={src}
        width={36}
        height={36}
        className={`h-9 w-9 ${className}`}
        alt={title}
        title={title}
      />
    </Tooltip>
  );
};
