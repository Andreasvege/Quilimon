import * as readline from "node:readline/promises";
import { createGame, rollDice, attack, switchMonster, endTurn } from "../src/game/actions";
import { getCard } from "../src/game/cards";
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
    console.log(currentPlayer.name + "sin tur! ");

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
    console.log("Valgt monster: " + currentPlayer.team[currentPlayer.activeIndex]) //bytt ut "1" med riktig index
    const roll = Math.floor(Math.random() * 6) + 1;
    console.log("Du kastet en " + roll);
    state = rollDice(state, roll).state;

    console.log("Tilgjengelige angrep:")
    for (let i = 0; i < getCard(currentPlayer.team[cardId].cardId).attackIds.length; i++) {
        if (getCard(currentPlayer.cardId).attackIds.diceCost.contains(roll) ) {
            console.log("- " + getAttack(attackId))
        }
    }
    
    

}

