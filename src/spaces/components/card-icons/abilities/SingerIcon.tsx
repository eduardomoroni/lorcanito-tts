import { GenericIcons } from "~/spaces/components/card-icons/generic/GenericIcons";

export const SingerIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/singer.svg"
      className={props.className}
      title={"Singer (This character counts as cost X to sing songs.)"}
    />
  );
};
