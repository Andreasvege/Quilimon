export interface Attack {
    name: string;
    description: string;
    damage?: number;
    diceCost: number[];
    id: string;
    effect?: string;
    type: "normal" | "dark" | "fire" | "fighting" | "grass" | "water" | "rock";
}



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