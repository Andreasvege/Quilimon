export type GameEvent =
    | { kind: "diceRolled"; value: number }
    | { kind: "damageDealt"; targetCardId: string; amount: number }
    | { kind: "attackUsed"; attackId: string; attackerCardId: string }
    | { kind: "cardDefeated"; cardId: string;}
    | { kind: "cardSwitched"; oldCardId: string; newCardId: string; }
    | { kind: "statusApplied"; targetCardId: string; effectId: string; duration: number; durationType: "turns" | "uses" }
    | { kind: "statusRemoved"; targetCardId: string; effectId: string }
    | { kind: "turnBegan"; currentPlayerIndex: 0 | 1 }
    | { kind: "turnEnded"; currentPlayerIndex: 0 | 1 }
    | { kind: "gameEnded"; winnerPlayerIndex: 0 | 1 }