import { useState } from 'react'
import { rollDice, createGame } from './game/actions'
import { getCard } from './game/cards'
import './App.css'

function App() {
  const [state, setState] = useState(() => createGame(
    { name: "Andreas", cardIds: ["magmo", "shag", "plune"] },
    { name: "Jakob", cardIds: ["magecko", "atcool", "mush"] }
  ))
  const player1 = state.players[0];
  const monster1 = player1.team[player1.activeIndex];
  const card1 = getCard(monster1.cardId);
  const player2 = state.players[1];
  const monster2 = player2.team[player2.activeIndex];
  const card2 = getCard(monster2.cardId);

  function handleRoll() {
    const roll = (Math.floor(Math.random()*6)+1);
    setState(rollDice(state, roll).state);
  }

  function handleAttack(attackId: string) {
    const resultat = attack(state, attackId);
  }
    return (
    <>
      <main>
        <p>{player1.name}: {card1.name} ({monster1.currentHp} HP)</p>
        <p>{player2.name}: {card2.name} ({monster2.currentHp} HP)</p>

        <p>{state.players[state.currentPlayerIndex].name} sin tur</p>
        <button onClick={handleRoll}>Kast terning</button>
        <p>Terning: {state.lastRoll}</p>
      </main>
    </>
  )
}

export default App
