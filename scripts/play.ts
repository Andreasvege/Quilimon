import * as readline from "node:readline/promises";
import { createGame, rollDice, attack, switchMonster, endTurn } from "../src/game/actions";
import { getCard } from "../src/game/cards";
import { getAttack } from "../src/game/attacks";
import type { GameState } from "../src/game/gamestate";

const rl = readline.createInterface({ input : process.stdin, output: process.stdout});



function showState(state: GameState) {
    for (const player of state.players) {
        console.log(`Player (${player.name}) has the following team:`);
        for (const card of player.team) {
            const cardData = getCard(card.cardId);
            console.log(`- ${cardData.name} (HP: ${card.currentHp})`);
        }
    }   
}

let state = createGame(
    { name: "Andreas", cardIds: ["magmo", "shag", "plune"] },
    { name: "Jakob", cardIds: ["magecko", "atcool", "mush"] }
);

let gameOver = false

while (!gameOver) {
    showState(state);
    let currentPlayer = state.players[state.currentPlayerIndex];
    console.log(currentPlayer.name + " sin tur!");

    const kb = await rl.question("[K]ast eller [b]ytt?");
    if (kb === "B" || kb === "b") {
        for (let i = 0; i < currentPlayer.team.length; i++ ) {
            const card = currentPlayer.team[i];
            const cardData = getCard(card.cardId);
            console.log(i+1 + ". " + `${cardData.name} (HP: ${card.currentHp})`);
        }
        const chosenIndex = await rl.question("Hvilket monster velger du?");
        state = switchMonster(state, Number(chosenIndex)-1).state;
        continue;
    }
    const activeMonster = currentPlayer.team[currentPlayer.activeIndex];
    const activeCard = getCard(activeMonster.cardId);
    console.log("Valgt monster: " + activeCard.name);

    const roll = Math.floor(Math.random() * 6) + 1;
    console.log("Du kastet en " + roll);
    state = rollDice(state, roll).state;

    console.log("Angrep (✓ = terningen treffer):");
    for (let i = 0; i < activeCard.attackIds.length; i++) {
        const attackId = activeCard.attackIds[i];
        const chosenAttack = getAttack(attackId);
        let mark = "";
        if (chosenAttack.diceCost.includes(roll)) {
            mark = " ✓";
        }
        console.log((i + 1) + ". " + chosenAttack.name + mark);
    }

    const answer = await rl.question("Velg angrep (nummer), eller Enter for å stå over: ");

    if (answer !== "") {
        const chosenId = activeCard.attackIds[Number(answer) - 1];
        const result = attack(state, chosenId);
        state = result.state;

        for (const event of result.events) {
            console.log(event);
            if (event.kind === "gameEnded") {
                console.log(state.players[event.winnerPlayerIndex].name + " vant!");
                gameOver = true;
            }
        }
    }

    if (!gameOver) {
        state = endTurn(state).state;
    }
}

rl.close();
