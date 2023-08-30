import { FC } from "react";

const icons = {
  amber: "/images/icons/amber.svg",
  amethyst: "/images/icons/amethyst.svg",
  emerald: "/images/icons/emerald.svg",
  ruby: "/images/icons/ruby.svg",
  sapphire: "/images/icons/sapphire.svg",
  steel: "/images/icons/steel.svg",
} as const;

export const InkColorIcon: FC<{ color: keyof typeof icons }> = (props) => {
  const { color } = props;
  return (
    <img
      src={icons[color]}
      key={color}
      alt={color}
      className="inline h-10 w-10 rounded-full"
    />
  );
};
