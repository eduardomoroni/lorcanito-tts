import { GenericIcons } from "~/spaces/components/card-icons/generic/GenericIcons";

export const EvasiveIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/evasive.svg"
      className={props.className}
      title={
        "Evasive (Only characters with Evasive can challenge this character.)"
      }
    />
  );
};
