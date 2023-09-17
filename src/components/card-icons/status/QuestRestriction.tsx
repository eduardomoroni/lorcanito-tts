import { GenericIcons } from "~/components/card-icons/generic/GenericIcons";

export const QuestRestriction = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/status/quest-restriction.svg"
      title={"This character has a quest restriction."}
      className={props.className}
    />
  );
};
