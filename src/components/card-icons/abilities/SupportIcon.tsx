import { GenericIcons } from "~/components/card-icons/generic/GenericIcons";

export const SupportIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/support.svg"
      className={props.className}
      title={
        "Support (Whenever this character quests, you may add their ※ to another chosen character‘s ※ this turn.)"
      }
    />
  );
};
