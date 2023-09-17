import { GenericIcons } from "~/components/card-icons/generic/GenericIcons";

export const BodyguardIcon = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/abilities/bodyguard.svg"
      className={props.className}
      title={
        "Bodyguard (An opposing character who challenges one of your characters must choose one with Bodyguard if able.)"
      }
    />
  );
};
