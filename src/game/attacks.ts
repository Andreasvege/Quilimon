import type { Card } from './cards'

export interface Attack {
    name: string;
    description: string;
    damage: number;
    diceCost: number[];
    id: string;
    effect?: "burn" | "poison";
}

export interface BurnEffect {
    type: "burn";
    damagePerTurn: number;
    turnsRemaining: number;
}

export interface PoisonEffect {
    type: "poison";
    damagePerTurn: number;
    turnsRemaining: number;
}

export type effect = BurnEffect | PoisonEffect;

/*
function applyStatusEffect(target: Card, effect: StatusEffect): void {
    if (effect.type === "burn" && effect.turnsRemaining > 0) {
        target.hp -= effect.damagePerTurn;
        target.damageMultiplier *= 0.9; // Example: Burn reduces damage output
    } else if (effect.type === "poison" && effect.turnsRemaining > 0) {
        target.hp -= effect.damagePerTurn;
        effect.turnsRemaining--;
    }
}    
*/