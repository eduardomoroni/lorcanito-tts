import { GenericIcons } from "~/components/card-icons/generic/GenericIcons";

export const RecklessIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/reckless.svg"
      className={props.className}
      title={
        "Reckless (This character can't quest and must challenge each turn if able.)"
      }
    />
  );
};
