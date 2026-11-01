import { useState } from "react";
import { rollDice, attack, switchMonster, endTurn } from "../game/actions";
import { getCard } from "../game/cards";
import { getAttack } from "../game/attacks";
import type { GameState, Player } from "../game/gamestate";
import { CardView, BenchCard, GraveCard } from "./CardView";
import type { Hit } from "./CardView";
import { Dice } from "./Dice";

// Hvor lenge hver del av en angrepsanimasjon varer (millisekunder)
const ROLL_TIME = 700;
const HIT_TIME = 900;
const DEFEAT_TIME = 900;

function otherPlayer(index: 0 | 1): 0 | 1 {
    if (index === 0) {
        return 1;
    }
    return 0;
}

/**
 * Lager en kopi av staten der forsvarerens aktive monster har ny HP.
 * Bare til visning: motoren har allerede regnet ut alt, men fjerner et beseiret
 * monster med en gang. Denne lar oss vise det med 0 HP et øyeblikk før det forsvinner.
 */
function withActiveHp(state: GameState, playerIndex: 0 | 1, hp: number): GameState {
    const player = state.players[playerIndex];
    const newTeam = [...player.team];
    newTeam[player.activeIndex] = { ...newTeam[player.activeIndex], currentHp: hp };
    const newPlayers: [Player, Player] = [state.players[0], state.players[1]];
    newPlayers[playerIndex] = { ...player, team: newTeam };
    return { ...state, players: newPlayers };
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

interface BattleProps {
    initialState: GameState;
    onRestart: () => void;
}

export function Battle({ initialState, onRestart }: BattleProps) {
    const [state, setState] = useState(initialState);
    const [busy, setBusy] = useState(false);
    const [rollingFace, setRollingFace] = useState<number | null>(null);
    const [hit, setHit] = useState<Hit | null>(null);
    const [defeatedCardId, setDefeatedCardId] = useState<string | null>(null);
    const [message, setMessage] = useState(initialState.players[0].name + " begynner!");
    const [messageKey, setMessageKey] = useState(0);
    const [winner, setWinner] = useState<0 | 1 | null>(null);

    function say(text: string) {
        setMessage(text);
        setMessageKey((k) => k + 1);
    }

    const current = state.players[state.currentPlayerIndex];

    // ---------- Handlinger ----------

    async function handleRoll() {
        setBusy(true);

        // Terningen «ruller»: vis tilfeldige øyne en liten stund
        const interval = setInterval(() => {
            setRollingFace(Math.floor(Math.random() * 6) + 1);
        }, 80);
        await wait(ROLL_TIME);
        clearInterval(interval);
        setRollingFace(null);

        const roll = Math.floor(Math.random() * 6) + 1;
        const newState = rollDice(state, roll).state;
        setState(newState);
        setBusy(false);

        // Treffer terningen noe?
        const player = newState.players[newState.currentPlayerIndex];
        const card = getCard(player.team[player.activeIndex].cardId);
        let anyHit = false;
        for (const attackId of card.attackIds) {
            if (getAttack(attackId).diceCost.includes(roll)) {
                anyHit = true;
            }
        }
        if (anyHit) {
            say(`${roll}! Velg et angrep`);
        } else {
            say(`${roll} … ingenting treffer`);
        }
    }

    async function handleAttack(attackId: string) {
        const result = attack(state, attackId);
        if (result.events.length === 0) {
            return;
        }
        setBusy(true);

        const attackerIndex = state.currentPlayerIndex;
        const defenderIndex = otherPlayer(attackerIndex);
        const chosenAttack = getAttack(attackId);
        const attackerName = getCard(current.team[current.activeIndex].cardId).name;

        // Les hendelsene fra motoren
        let damage = 0;
        let targetCardId = "";
        let defeatedId: string | null = null;
        let gameOver = false;
        for (const event of result.events) {
            if (event.kind === "damageDealt") {
                damage = event.amount;
                targetCardId = event.targetCardId;
            }
            if (event.kind === "cardDefeated") {
                defeatedId = event.cardId;
            }
            if (event.kind === "gameEnded") {
                gameOver = true;
            }
        }

        // 1. Treffet: vis ny HP på forsvareren, rist kortet, sprett skadetallet
        const defender = state.players[defenderIndex];
        const oldHp = defender.team[defender.activeIndex].currentHp;
        let shownHp = oldHp - damage;
        if (shownHp < 0) {
            shownHp = 0;
        }
        setState({ ...withActiveHp(state, defenderIndex, shownHp), lastRoll: null });
        setHit({ cardId: targetCardId, amount: damage, key: Date.now() });
        if (chosenAttack.effect !== undefined && damage === 0) {
            say(`${attackerName} bruker ${chosenAttack.name}! (effekten kommer i neste versjon)`);
        } else {
            say(`${attackerName} bruker ${chosenAttack.name}!`);
        }
        await wait(HIT_TIME);

        // 2. Beseiret: kortet faller ut
        if (defeatedId !== null) {
            setDefeatedCardId(defeatedId);
            say(`${getCard(defeatedId).name} er beseiret!`);
            await wait(DEFEAT_TIME);
        }

        // 3. Ta i bruk motorens ferdige state
        setHit(null);
        setDefeatedCardId(null);
        if (gameOver) {
            setState(result.state);
            setWinner(attackerIndex);
            say(`${state.players[attackerIndex].name} vant!`);
        } else {
            const next = endTurn(result.state).state;
            setState(next);
            say(`${next.players[next.currentPlayerIndex].name} sin tur`);
        }
        setBusy(false);
    }

    function handlePass() {
        const next = endTurn(state).state;
        setState(next);
        say(`${next.players[next.currentPlayerIndex].name} sin tur`);
    }

    function handleSwitch(teamIndex: number) {
        const result = switchMonster(state, teamIndex);
        if (result.events.length === 0) {
            return;
        }
        setState(result.state);
        const player = result.state.players[result.state.currentPlayerIndex];
        say(`${player.name} sender inn ${getCard(player.team[teamIndex].cardId).name}!`);
    }

    // ---------- Visning ----------

    function renderSide(playerIndex: 0 | 1) {
        const player = state.players[playerIndex];
        const isTurn = state.currentPlayerIndex === playerIndex && winner === null;

        let activeCard = <div className="card-empty">Ingen monstre igjen</div>;
        if (player.team.length > 0) {
            const monster = player.team[player.activeIndex];
            activeCard = (
                <CardView
                    key={monster.cardId}
                    monster={monster}
                    isTurn={isTurn}
                    lastRoll={state.lastRoll}
                    busy={busy}
                    hit={hit}
                    defeated={defeatedCardId === monster.cardId}
                    onAttack={handleAttack}
                />
            );
        }

        const bench = [];
        for (let i = 0; i < player.team.length; i++) {
            if (i === player.activeIndex) {
                continue;
            }
            const teamIndex = i;
            bench.push(
                <BenchCard
                    key={player.team[i].cardId}
                    monster={player.team[i]}
                    clickable={isTurn && !busy}
                    onClick={() => handleSwitch(teamIndex)}
                />
            );
        }

        const graves = [];
        for (const cardId of player.graveyard) {
            graves.push(<GraveCard key={cardId} cardId={cardId} />);
        }

        return (
            <section className={"side" + (isTurn ? " side-turn" : "")}>
                <h2 className="player-name">
                    {player.name}
                    {isTurn && <span className="turn-tag">sin tur</span>}
                </h2>
                {activeCard}
                <div className="reserves">
                    {bench.length > 0 && <div className="bench">{bench}</div>}
                    {graves.length > 0 && <div className="graveyard">{graves}</div>}
                </div>
            </section>
        );
    }

    // Terningen: viser rullende øyne under kastet, ellers siste kast
    let diceValue = state.lastRoll;
    if (rollingFace !== null) {
        diceValue = rollingFace;
    }

    return (
        <main className="battle">
            {renderSide(0)}

            <section className="center">
                <h1 className="logo logo-small">Quilimon</h1>
                <Dice value={diceValue} rolling={rollingFace !== null} />
                <p className="message" key={messageKey}>{message}</p>

                {winner === null && (
                    <div className="controls">
                        <button
                            className="big-button"
                            onClick={handleRoll}
                            disabled={busy || state.lastRoll !== null}
                        >
                            Kast terning
                        </button>
                        <button
                            className="small-button"
                            onClick={handlePass}
                            disabled={busy || state.lastRoll === null}
                        >
                            Stå over
                        </button>
                    </div>
                )}
            </section>

            {renderSide(1)}

            {winner !== null && (
                <div className="winner-overlay">
                    <div className="winner-box">
                        <p className="winner-crown" aria-hidden="true">★</p>
                        <h2>{state.players[winner].name} vant!</h2>
                        <button className="big-button" onClick={onRestart}>Spill igjen</button>
                    </div>
                </div>
            )}
        </main>
    );
}
