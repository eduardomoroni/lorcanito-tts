import clsx from "clsx";

// @ts-ignore
export const Container = ({ className, ...props }) => (
  <div
    className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    {...props}
  />
);
