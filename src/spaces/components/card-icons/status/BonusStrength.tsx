import { GenericIcons } from "~/spaces/components/card-icons/generic/GenericIcons";

// TODO: THIS IS SO UGLY FIX THIS
export const BonusStrength = (props: { className?: string; bonus: number }) => {
  return (
    <>
      <GenericIcons
        src="/images/icons/status/bonus-strength.svg"
        title={"This character has a bonus to their strength."}
        className={props.className}
      />
      <span className="-ml-7 text-2xl font-extrabold text-black drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,1)]">
        {props.bonus}
      </span>
    </>
  );
};
