import { GenericIcons } from "~/spaces/components/card-icons/generic/GenericIcons";

export const BonusLore = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/status/bonus-lore.svg"
      title={"This character has a bonus to their lore."}
      className={props.className}
    />
  );
};
