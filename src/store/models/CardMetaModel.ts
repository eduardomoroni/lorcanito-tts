import type { Meta } from "~/providers/TabletopProvider";
import { makeAutoObservable, toJS } from "mobx";
import { mockProviders } from "next-auth/client/__tests__/helpers/mocks";
import type = mockProviders.github.type;

type MetaModel = Omit<Meta, "continuousEffects">;

// We're using null in this type, because firebase will remove the entire field if it's null
export class CardMetaModel implements MetaModel {
  exerted?: boolean | null = undefined;
  playedThisTurn?: boolean | null = undefined;
  damage?: number | null = undefined;
  shifter?: string | null = undefined;
  shifted?: string | null = undefined;
  revealed?: boolean | null = undefined;

  constructor(meta: Meta | undefined | null, observable: boolean) {
    if (observable) {
      makeAutoObservable(this);
    }

    this.sync(meta);
  }

  sync(meta: Meta | undefined | null) {
    if (!meta) {
      this.resetMeta();
    }

    this.exerted = meta?.exerted ?? undefined;
    this.playedThisTurn = meta?.playedThisTurn ?? undefined;
    this.damage = meta?.damage ?? undefined;
    this.shifter = meta?.shifter ?? undefined;
    this.shifted = meta?.shifted ?? undefined;
    this.revealed = meta?.revealed ?? undefined;
  }

  resetMeta() {
    this.exerted = undefined;
    this.playedThisTurn = undefined;
    this.damage = undefined;
    this.shifter = undefined;
    this.shifted = undefined;
    this.revealed = undefined;
  }

  update(meta: Partial<MetaModel>) {
    const currentMeta = this.toJSON();
    this.sync({ ...currentMeta, ...meta });
  }

  toJSON(): Meta {
    return toJS({
      exerted: this.exerted || null,
      playedThisTurn: this.playedThisTurn || null,
      damage: this.damage || null,
      shifter: this.shifter || null,
      shifted: this.shifted || null,
      revealed: this.revealed || null,
    });
  }
}
