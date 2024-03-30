import { GenericIcons } from "~/client/components/card-icons/generic/GenericIcons";

export const RushIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/rush.svg"
      className={props.className}
      title={"Rush (This character can challenge the turn they're played.)"}
    />
  );
};
