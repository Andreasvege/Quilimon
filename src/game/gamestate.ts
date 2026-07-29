import type { Card } from "./cards";
import { Card } from './cards';

export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    lastRoll: number | null;
    deck: Card[];
}

export interface Player {
    id: number;
    name: string;
    hand: Card[];
    bench: Card[];
}

export interface InBattle {
    quilimonId : number;
    currentHp : number;
    statusEffects : StatusEffect[];
    damageMultiplier : number;


}