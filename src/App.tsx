import { useState } from "react";
import type { CSSProperties } from "react";
import { createGame } from "./game/actions";
import { CARDS } from "./game/cards";
import type { GameState } from "./game/gamestate";
import { Battle } from "./ui/Battle";
import { cardImageUrl } from "./ui/images";
import "./App.css";

/** Stokker de sju kortene og deler ut tre til hver. Det sjuende blir liggende i bunken. */
function dealTeams(): [string[], string[]] {
    const ids = Object.keys(CARDS);

    // Fisher–Yates: bytt hvert kort med et tilfeldig kort foran seg
    for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = ids[i];
        ids[i] = ids[j];
        ids[j] = temp;
    }

    return [ids.slice(0, 3), ids.slice(3, 6)];
}

function App() {
    const [game, setGame] = useState<GameState | null>(null);
    const [name1, setName1] = useState("Andreas");
    const [name2, setName2] = useState("Jakob");

    function handleStart() {
        const teams = dealTeams();
        setGame(createGame(
            { name: name1 || "Spiller 1", cardIds: teams[0] },
            { name: name2 || "Spiller 2", cardIds: teams[1] }
        ));
    }

    if (game !== null) {
        return <Battle initialState={game} onRestart={() => setGame(null)} />;
    }

    // Startskjerm: vifte av alle sju kortene
    const fan = [];
    const ids = Object.keys(CARDS);
    for (let i = 0; i < ids.length; i++) {
        const card = CARDS[ids[i]];
        const angle = (i - 3) * 9;
        fan.push(
            <img
                key={card.id}
                className="fan-card"
                src={cardImageUrl(card.image)}
                alt={card.name}
                draggable={false}
                style={{ "--angle": angle + "deg", "--lift": Math.abs(i - 3) * 10 + "px", animationDelay: i * 70 + "ms" } as CSSProperties}
            />
        );
    }

    return (
        <main className="start">
            <h1 className="logo">Quilimon</h1>
            <p className="tagline">Et kortspill tegnet av Jakob</p>
            <div className="fan">{fan}</div>

            <div className="start-form">
                <input value={name1} onChange={(e) => setName1(e.target.value)} aria-label="Spiller 1" />
                <span className="versus">mot</span>
                <input value={name2} onChange={(e) => setName2(e.target.value)} aria-label="Spiller 2" />
            </div>
            <button className="big-button" onClick={handleStart}>Del ut kort</button>
            <p className="start-hint">Tre kort hver fra bunken på sju. Kast terningen, treff et angrep, slå ut motstanderens lag.</p>
        </main>
    );
}

export default App;
