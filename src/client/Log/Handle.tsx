import React from "react";
import type { ResizeHandle } from "react-resizable";

interface Props {
  handleAxis?: ResizeHandle;
}

export type Ref = HTMLSpanElement;
export const Handle = React.forwardRef<Ref, Props>((props, ref) => {
  const { handleAxis, ...restProps } = props;
  return (
    <span
      ref={ref}
      className={`text-md sticky -mt-6 mr-4 flex cursor-se-resize justify-end self-end text-right align-bottom text-white opacity-100`}
      {...restProps}
    >
      ◢
    </span>
  );
});
