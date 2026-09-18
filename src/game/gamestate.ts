export interface GameState {
    players: [Player, Player];
    currentPlayerIndex: 0 | 1;
    lastRoll: number | null;
    deck: string[];
}

export interface Player {
    id: number;
    name: string;
    activeIndex: number;
    graveyard: string[];
    team: InBattle[]
}

export interface InBattle {
    cardId : string;
    currentHp : number;
    statusEffects : StatusEffect[];
    damageMultiplier : number;
}

export interface StatusEffect {
    effectId: string;
    remaining: number;
    durationType: "turns" | "uses";
}