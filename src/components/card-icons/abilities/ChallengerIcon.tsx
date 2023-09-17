import { GenericIcons } from "~/components/card-icons/generic/GenericIcons";

export const ChallengerIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/challenger.svg"
      className={props.className}
      title={
        "Challenger (When challenging, this character has bonus strength.)"
      }
    />
  );
};
