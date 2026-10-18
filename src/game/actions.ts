import type { GameState, InBattle, Player } from "./gamestate";
import { getAttack } from "./attacks";
import { CARDS, getCard } from "./cards";
import type { ActionResult, GameEvent } from "./events";

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
        currentHp: newHp
    };

    const newTeam = [...tPlayer.team];
    newTeam[tPlayer.activeIndex] = newTarget;

    const newPlayer = {...tPlayer, team: newTeam}

    const newPlayers: [Player, Player] = [state.players[0], state.players[1]];
    newPlayers[playerIndex] = newPlayer;

    return { ...state, players: newPlayers };
}

export function attack(state: GameState, attackId: string): ActionResult{
    const attackerIndex = state.currentPlayerIndex;
    let defenderIndex: 0 | 1 = 1;
    if (attackerIndex === 1) {
        defenderIndex = 0;
    }
    if (state.players[defenderIndex].team.length === 0) {
        return { state, events: [] };
    }

    const chosenAttack = getAttack(attackId);
    const attackerCard = getCard(getActive(state, attackerIndex).cardId);

    if (!attackerCard.attackIds.includes(attackId)) {
        return { state, events: [] };
    }
    if (state.lastRoll === null) {
        return { state, events: [] }
    }
    if (!chosenAttack.diceCost.includes(state.lastRoll)) {
        return { state, events: [] };
    }
    
    let damage = 0;
    if (chosenAttack.damage !== undefined) {
        damage = chosenAttack.damage;
    }
    const damagedState = dealDamage(state, defenderIndex, damage);
    const newState: GameState = {...damagedState, lastRoll: null}

    const attacker = getActive(state, attackerIndex);
    const defender = getActive(state, defenderIndex);

    const events: GameEvent[] = [
        { kind: "attackUsed", attackId, attackerCardId: attacker.cardId },
        { kind: "damageDealt", targetCardId: defender.cardId, amount: damage }
    ];

    let finalState = newState;
    const defenderAfter = getActive(newState, defenderIndex);
    if (defenderAfter.currentHp <= 0) {
        finalState = removeDefeated(newState, defenderIndex);
        events.push({kind: "cardDefeated", cardId: defender.cardId});

        if (finalState.players[defenderIndex].team.length === 0) {
            events.push({kind: "gameEnded", winnerPlayerIndex: attackerIndex})
        }
    }
    return { state: finalState, events };
}


function removeDefeated(state: GameState, playerIndex: 0 | 1): GameState {
    const player = state.players[playerIndex];
    const defeated = player.team[player.activeIndex]

    const newTeam: InBattle[] = [];
    for (let i = 0; i < player.team.length; i++) {
        if (i !== player.activeIndex) {
            newTeam.push(player.team[i]);
        }
    }

    const newGraveyard = [...player.graveyard, defeated.cardId]
    const newPlayer: Player = { ...player, team: newTeam, graveyard: newGraveyard, activeIndex: 0}

    const newPlayers: [Player, Player] = [state.players[0], state.players[1]];
    newPlayers[playerIndex] = newPlayer;


    return {...state, players: newPlayers}
}

export function switchMonster(state: GameState, teamIndex: number): ActionResult {
    const playerIndex = state.currentPlayerIndex;
    const player = state.players[playerIndex];

    if (teamIndex < 0 || teamIndex >= player.team.length) {
        return { state, events: [] };
    }

    if (teamIndex === player.activeIndex) {
        return { state, events: [] };
    }
    const oldCard = player.team[player.activeIndex];
    const newCard = player.team[teamIndex];

    const newPlayer: Player = { ...player, activeIndex: teamIndex };
    
    const newPlayers: [Player, Player] = [state.players[0], state.players[1]];
    newPlayers[playerIndex] = newPlayer;

    return { 
        state: {...state, players: newPlayers}, 
        events: [{kind: "cardSwitched", oldCardId: oldCard.cardId, newCardId: newCard.cardId}]}
}

export function endTurn(state: GameState): ActionResult {
    const current = state.currentPlayerIndex;
    let next: 0 | 1 = 1;
    if (current === 1) {
        next = 0;
    }

    const newState: GameState = { ...state, currentPlayerIndex: next, lastRoll: null };

    return {
        state: newState,
        events: [
            { kind: "turnEnded", currentPlayerIndex: current },
            { kind: "turnBegan", currentPlayerIndex: next }
        ]
    };
}
