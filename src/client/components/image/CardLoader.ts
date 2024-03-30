import { ImageLoaderProps } from "next/image";

export const cardLoader = ({ src, width }: ImageLoaderProps) => {
  return `${src}?w=${width}&auto=format&q=50`;
};
