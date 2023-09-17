import { ArrowUturnDownIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Tooltip } from "@nextui-org/react";

export const ExertedIcon = (props: { className?: string }) => {
  const { className } = props;
  return (
    <Tooltip content={"Exerted"}>
      <ArrowUturnDownIcon
        title="Exerted"
        className={`${className} h-9 w-9 -scale-x-100`}
      />
    </Tooltip>
  );
};
