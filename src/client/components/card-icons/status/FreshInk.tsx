import { GenericIcons } from "~/client/components/card-icons/generic/GenericIcons";

export const FreshInk = (props: { className?: string }) => {
  return (
    <GenericIcons
      src="/images/icons/status/fresh-ink.svg"
      title={"Fresh Ink"}
      className={props.className}
    />
  );
};
