import { GenericIcons } from "~/components/card-icons/generic/GenericIcons";

export const WardIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/ward.svg"
      className={props.className}
      title={
        "Ward (Opponents can't choose this character except to challenge.)"
      }
    />
  );
};
