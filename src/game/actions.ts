import type { GameState, InBattle, Player, StatusEffect } from "./gamestate";
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

    const attacker = getActive(state, attackerIndex);
    const defender = getActive(state, defenderIndex);

    // Krok «før angrep»: en status på angriperen kan stoppe angrepet helt.
    // Kastet er brukt opp, og turen går videre som om man stod over.
    const blocker = getAttackBlocker(attacker, state.lastRoll);
    if (blocker !== null) {
        return {
            state: { ...state, lastRoll: null },
            events: [
                { kind: "attackUsed", attackId, attackerCardId: attacker.cardId },
                { kind: "attackBlocked", attackerCardId: attacker.cardId, effectId: blocker }
            ]
        };
    }

    let damage = 0;
    if (chosenAttack.damage !== undefined) {
        damage = chosenAttack.damage;
    }
    // Rock Throw: skaden er 10 × terningkastet
    if (chosenAttack.effect === "diceScaledDamage") {
        damage = 10 * state.lastRoll;
    }

    const damagedState = dealDamage(state, defenderIndex, damage);
    let newState: GameState = {...damagedState, lastRoll: null}

    const events: GameEvent[] = [
        { kind: "attackUsed", attackId, attackerCardId: attacker.cardId }
    ];
    // Rene effektangrep (Magma Smoke, Pollen …) gjør ingen skade, og sender heller ingen skadehendelse
    if (damage > 0) {
        events.push({ kind: "damageDealt", targetCardId: defender.cardId, amount: damage });
    }

    // Utsatte effekter: legg en status på forsvarerens monster. Den virker i hans neste tur.
    if (chosenAttack.effect === "blind" || chosenAttack.effect === "pollen") {
        const status: StatusEffect = { effectId: chosenAttack.effect, remaining: 1, durationType: "turns" };
        newState = addStatus(newState, defenderIndex, status);
        events.push({
            kind: "statusApplied",
            targetCardId: defender.cardId,
            effectId: status.effectId,
            duration: status.remaining,
            durationType: status.durationType
        });
    }

    let finalState = newState;
    const defenderAfter = getActive(newState, defenderIndex);
    if (defenderAfter.currentHp <= 0) {
        finalState = removeDefeated(newState, defenderIndex);
        events.push({kind: "cardDefeated", cardId: defender.cardId});

        if (finalState.players[defenderIndex].team.length === 0) {
            events.push({kind: "gameEnded", winnerPlayerIndex: attackerIndex})
            return { state: finalState, events };
        }
    }

    // Mind Infuse: angriperen får en handling til. Motoren avslutter aldri turen selv,
    // så hendelsen er et signal til den som styrer spillet om å IKKE kalle endTurn.
    if (chosenAttack.effect === "extraAction") {
        events.push({ kind: "extraAction", playerIndex: attackerIndex });
    }

    return { state: finalState, events };
}

/**
 * Svarer på om en status på angriperen stopper angrepet, gitt kastet.
 * Returnerer id-en til statusen som stopper det, eller null hvis angrepet går gjennom.
 * Eksportert slik at UI-et kan vise det før spilleren klikker.
 */
export function getAttackBlocker(attacker: InBattle, roll: number): string | null {
    for (const status of attacker.statusEffects) {
        // Magma Smoke: blendet i en runde, kan ikke angripe i det hele tatt
        if (status.effectId === "blind") {
            return "blind";
        }
        // Pollen: må slå en sekser for å angripe
        if (status.effectId === "pollen" && roll !== 6) {
            return "pollen";
        }
    }
    return null;
}

/** Legger en status på en spillers aktive monster. Har det samme status fra før, erstattes den. */
function addStatus(state: GameState, playerIndex: 0 | 1, status: StatusEffect): GameState {
    const player = state.players[playerIndex];
    const monster = player.team[player.activeIndex];

    const newStatuses: StatusEffect[] = [];
    for (const existing of monster.statusEffects) {
        if (existing.effectId !== status.effectId) {
            newStatuses.push(existing);
        }
    }
    newStatuses.push(status);

    const newTeam = [...player.team];
    newTeam[player.activeIndex] = { ...monster, statusEffects: newStatuses };

    const newPlayers: [Player, Player] = [state.players[0], state.players[1]];
    newPlayers[playerIndex] = { ...player, team: newTeam };

    return { ...state, players: newPlayers };
}

/**
 * Krok «ved rundeslutt»: teller ned alle runde-statuser på laget til spilleren som avslutter turen.
 * Statuser som når 0 fjernes. «uses»-statuser telles ikke her, men av kroken som bruker dem opp.
 */
function tickStatuses(state: GameState, playerIndex: 0 | 1): ActionResult {
    const player = state.players[playerIndex];
    const events: GameEvent[] = [];
    const newTeam: InBattle[] = [];

    for (const monster of player.team) {
        const newStatuses: StatusEffect[] = [];
        for (const status of monster.statusEffects) {
            if (status.durationType !== "turns") {
                newStatuses.push(status);
                continue;
            }
            const remaining = status.remaining - 1;
            if (remaining > 0) {
                newStatuses.push({ ...status, remaining });
            } else {
                events.push({ kind: "statusRemoved", targetCardId: monster.cardId, effectId: status.effectId });
            }
        }
        newTeam.push({ ...monster, statusEffects: newStatuses });
    }

    const newPlayers: [Player, Player] = [state.players[0], state.players[1]];
    newPlayers[playerIndex] = { ...player, team: newTeam };

    return { state: { ...state, players: newPlayers }, events };
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

    // Statusene på laget som nettopp hadde turen har nå virket i én runde
    const ticked = tickStatuses(state, current);
    const newState: GameState = { ...ticked.state, currentPlayerIndex: next, lastRoll: null };

    return {
        state: newState,
        events: [
            { kind: "turnEnded", currentPlayerIndex: current },
            ...ticked.events,
            { kind: "turnBegan", currentPlayerIndex: next }
        ]
    };
}
