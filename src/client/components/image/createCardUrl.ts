import { ENCHANTED_MAP } from "~/client/components/image/enchanteds";
import type { LorcanitoCard } from "@lorcanito/engine";

function pad(n: number, length: number) {
  let len = length - ("" + n).length;
  return (len > 0 ? new Array(++len).join("0") : "") + n;
}

export function createCardUrl(
  cardSet: LorcanitoCard["set"],
  number: number,
  opt: {
    hideCardText?: boolean;
    imageOnly?: boolean;
    language: "EN" | "DE" | "FR";
  } = { language: "EN" },
): string {
  const { language } = opt;

  const edition = cardSet === "TFC" ? "001" : "002";
  const enchantedCard: number = ENCHANTED_MAP[cardSet]?.[number] || 0;
  const cardNumber = pad(enchantedCard || number, 3);

  let url = `https://six-inks.pages.dev/assets/images/cards/${language.toLocaleUpperCase()}/${edition}/${cardNumber}.avif`;

  if (opt?.imageOnly) {
    return `https://six-inks.pages.dev/assets/images/cards/${edition}/art_only/${cardNumber}.avif`;
  }

  if (opt?.hideCardText) {
    return url.replace(`/${edition}/`, `/${edition}/art_and_name/`);
  }

  // Enchanted cards are only available in English
  if (enchantedCard) {
    return `https://six-inks.pages.dev/assets/images/cards/EN/${edition}/${cardNumber}.avif`;
  }

  return url;
}
