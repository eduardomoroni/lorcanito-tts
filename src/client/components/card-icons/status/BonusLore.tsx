import { GenericIcons } from "~/client/components/card-icons/generic/GenericIcons";

export const BonusLore = (props: { className?: string; bonus: number }) => {
  return (
    <>
      <GenericIcons
        src="/images/icons/status/bonus-lore.svg"
        title={`This character has a ${props.bonus} bonus to their lore.`}
        className={props.className}
      />
      <span className="-ml-7 text-2xl font-extrabold text-black drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,1)]">
        {props.bonus}
      </span>
    </>
  );
};
