import { type TableCard } from "@lorcanito/engine";

export const CardImageGrid = (props: {
  cards: TableCard[];
  onCardClick: (card: TableCard) => void;
}) => {
  const { cards, onCardClick } = props;

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {cards.map((card) => {
        return (
          <a
            key={card.instanceId}
            data-id-card={card.instanceId}
            onClick={() => onCardClick(card)}
            className={`group rounded-lg transition-all ease-linear hover:scale-110`}
          >
            {/*<CardImage*/}
            {/*  card={card.instanceId}*/}
            {/*  selected={selected?.instanceId === card.instanceId}*/}
            {/*/>*/}
          </a>
        );
      })}
    </div>
  );
};
