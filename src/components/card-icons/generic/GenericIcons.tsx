import Image from "next/image";
import { Tooltip } from "@nextui-org/react";

export const GenericIcons = (props: {
  className?: string;
  src: string;
  title: string;
}) => {
  const { className, src, title } = props;

  return (
    <Tooltip content={title}>
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
