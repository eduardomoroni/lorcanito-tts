import { GenericIcons } from "~/client/components/card-icons/generic/GenericIcons";

export const ResistIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/resist.svg"
      className={props.className}
      title={"Resist +X (Damage dealt to this character is reduced by X.)"}
    />
  );
};
