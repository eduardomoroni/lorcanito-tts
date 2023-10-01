import { GenericIcons } from "~/spaces/components/card-icons/generic/GenericIcons";

export const ChallengeRestriction = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/status/challenge-restriction.svg"
      title={"This character has a challenge restriction."}
      className={props.className}
    />
  );
};
