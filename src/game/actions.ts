import type { GameState, InBattle, Player } from "./gamestate";
import { CARDS, getCard } from "./cards";
import type { ActionResult } from "./events";

/** Gjør en kort-id om til et monster i kamp, med full HP fra katalogen. */
function createInBattle(cardId: string): InBattle {
    return {
        cardId,
        currentHp: getCard(cardId).hp,
        statusEffects: [],
        damageMultiplier: 1
    };
}

/**
 * Bygger startstaten. Kortene sendes inn i stedet for å trekkes tilfeldig her,
 * slik at tester kan sette opp nøyaktig den situasjonen de vil sjekke.
 */
export function createGame(
    player1: { name: string; cardIds: string[] },
    player2: { name: string; cardIds: string[] }
): GameState {
    const p1: Player = {
        id: 0,
        name: player1.name,
        activeIndex: 0,
        graveyard: [],
        team: player1.cardIds.map(createInBattle)
    };

    const p2: Player = {
        id: 1,
        name: player2.name,
        activeIndex: 0,
        graveyard: [],
        team: player2.cardIds.map(createInBattle)
    };

    // Kortene som ikke ble delt ut blir liggende i fellesbunken.
    const dealt = [...player1.cardIds, ...player2.cardIds];
    const deck = Object.keys(CARDS).filter(id => !dealt.includes(id));

    return {
        players: [p1, p2],
        currentPlayerIndex: 0,
        lastRoll: null,
        deck
    };
}

export function rollDice(state: GameState, value: number): ActionResult {
    return {
        state: { ...state, lastRoll: value},
        events: [{kind: "diceRolled", value}]
    };
}


function getActive(state: GameState, playerIndex: 0 | 1): InBattle {
        const player = state.players[playerIndex];
        return player.team[player.activeIndex];        
}

function dealDamage(state: GameState, playerIndex: 0 | 1, amount: number): GameState {
    const tPlayer = state.players[playerIndex]
    const tMonster = tPlayer.team[tPlayer.activeIndex];

    let newHp = tMonster.currentHp - amount;
    if (newHp < 0) {
        newHp = 0;
    }

    const newTarget: InBattle = {
        ...tMonster,
        currentHp: Math.max(0, tMonster.currentHp - amount)
    };

    const newTeam = [...tPlayer.team];
    newTeam[tPlayer.activeIndex] = newTarget;

    const newPlayer = {...tPlayer, team: newTeam}

    const newPlayers: [Player, Player] = [state.players[0], state.players[1]];
    newPlayers[playerIndex] = newPlayer;

    return { ...state, players: newPlayers };
}