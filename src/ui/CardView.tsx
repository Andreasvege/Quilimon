import { getCard } from "../game/cards";
import { getAttack } from "../game/attacks";
import type { InBattle } from "../game/gamestate";
import { cardImageUrl } from "./images";
import { Dice } from "./Dice";
import { TypeIcon } from "./TypeIcon";

/** Kortene som ikke har SPESS-merket på originalene. */
const CARDS_WITHOUT_SPESS = ["slepio", "magmo"];

/** Treffet som skal animeres på kortet akkurat nå. `key` endres for hvert treff, så animasjonen starter på nytt. */
export interface Hit {
    cardId: string;
    amount: number;
    key: number;
}

/**
 * Terningkravet slik Jakob skriver det: et sammenhengende sett som intervall
 * («A: ⚃ – ⚅»), ellers hver terning for seg (som Fireball).
 */
function DiceCost({ cost }: { cost: number[] }) {
    let isRange = cost.length >= 2;
    for (let i = 1; i < cost.length; i++) {
        if (cost[i] !== cost[i - 1] + 1) {
            isRange = false;
        }
    }

    if (isRange) {
        return (
            <span className="qc-cost">
                <Dice value={cost[0]} rolling={false} size="small" />
                <span className="qc-dash">–</span>
                <Dice value={cost[cost.length - 1]} rolling={false} size="small" />
            </span>
        );
    }

    const dice = [];
    for (const value of cost) {
        dice.push(<Dice key={value} value={value} rolling={false} size="small" />);
    }
    return <span className="qc-cost">{dice}</span>;
}

interface QuilimonCardProps {
    monster: InBattle;
    lastRoll?: number | null;
    canAct?: boolean;           // spilleren som eier kortet har turen, og ingen animasjon pågår
    onAttack?: (attackId: string) => void;
}

/** Selve kortet, bygd etter strukturen på Jakobs originaler. Brukes både stort og som minikort. */
export function QuilimonCard({ monster, lastRoll = null, canAct = false, onAttack }: QuilimonCardProps) {
    const card = getCard(monster.cardId);

    const hpPercent = (monster.currentHp / card.hp) * 100;
    let hpColor = "hp-high";
    if (hpPercent <= 50) {
        hpColor = "hp-mid";
    }
    if (hpPercent <= 25) {
        hpColor = "hp-low";
    }

    const attackRows = [];
    for (let i = 0; i < card.attackIds.length; i++) {
        const attackId = card.attackIds[i];
        const chosenAttack = getAttack(attackId);

        let canUse = false;
        if (canAct && lastRoll !== null && chosenAttack.diceCost.includes(lastRoll)) {
            canUse = true;
        }

        // SPESS står på det andre angrepet når det har et element (slik på originalene).
        // Slepio og Magmo har ikke merket på sine kort.
        let isSpess = false;
        if (i === 1 && chosenAttack.type !== "normal" && !CARDS_WITHOUT_SPESS.includes(card.id)) {
            isSpess = true;
        }

        let damageText = "";
        if (chosenAttack.damage !== undefined) {
            damageText = "-" + chosenAttack.damage;
        }

        // Effektangrep har ingen skade, så kortet forklarer hva de gjør (som originalene)
        let effectText = null;
        if (chosenAttack.effect !== undefined) {
            effectText = <span className="qc-effect">{chosenAttack.description}</span>;
        }

        // Mange enkeltterninger (som Fireball) får egen linje over navnet, slik som på originalen
        let rowClass = "qc-attack";
        if (chosenAttack.diceCost.length > 3) {
            rowClass += " qc-attack-stacked";
        }

        const rowContent = (
            <>
                <span className="qc-a">A:</span>
                <DiceCost cost={chosenAttack.diceCost} />
                <span className="qc-attack-name">{chosenAttack.name}</span>
                <span className="qc-damage">{damageText}</span>
                {effectText}
            </>
        );

        attackRows.push(
            <div key={attackId} className="qc-attack-wrap">
                {isSpess && <span className="qc-spess">SPESS</span>}
                {onAttack ? (
                    <button
                        className={rowClass + (canUse ? " qc-attack-ready" : "")}
                        disabled={!canUse}
                        onClick={() => onAttack(attackId)}
                    >
                        {rowContent}
                    </button>
                ) : (
                    // Minikort: bare visning, ingen knapp (knapper kan ikke ligge inni knapper)
                    <div className={rowClass}>{rowContent}</div>
                )}
            </div>
        );
    }

    let footer = <span className="qc-logo">Quilimon</span>;
    if (card.evolution !== null) {
        footer = (
            <>
                <span className="qc-evo-from">{card.name}</span>
                <span className="qc-evo-to">– {card.evolution}</span>
            </>
        );
    }

    return (
        <div className={"qcard t-" + card.type}>
            <header className="qc-head">
                <TypeIcon type={card.type} />
                <span className="qc-name">{card.name}</span>
                <span className="qc-hp">L.{monster.currentHp}</span>
            </header>

            <div className="qc-art">
                <img src={cardImageUrl(card.image)} alt={card.name} draggable={false} />
            </div>

            {/* Den lyse stripa under bildet er HP-baren */}
            <div className="qc-strip">
                <div className={"qc-strip-fill " + hpColor} style={{ width: hpPercent + "%" }} />
                <span className="qc-strip-text">{monster.currentHp} / {card.hp}</span>
            </div>

            <div className="qc-attacks">{attackRows}</div>

            <footer className="qc-foot">{footer}</footer>
        </div>
    );
}

interface CardViewProps {
    monster: InBattle;
    isTurn: boolean;          // spilleren som eier kortet har turen
    lastRoll: number | null;
    busy: boolean;            // en animasjon pågår, ingen klikk
    hit: Hit | null;
    defeated: boolean;
    onAttack: (attackId: string) => void;
}

/** Det store, aktive kortet, med treff-animasjonene rundt. */
export function CardView({ monster, isTurn, lastRoll, busy, hit, defeated, onAttack }: CardViewProps) {
    let isHit = false;
    if (hit !== null && hit.cardId === monster.cardId) {
        isHit = true;
    }

    let className = "card";
    if (isTurn) {
        className += " card-turn";
    }
    if (defeated) {
        className += " card-defeated";
    }

    return (
        <div className={className}>
            {/* Ny key per treff starter shake-animasjonen på nytt */}
            <div className={isHit ? "card-inner shake" : "card-inner"} key={isHit ? hit!.key : "still"}>
                <QuilimonCard monster={monster} lastRoll={lastRoll} canAct={isTurn && !busy} onAttack={onAttack} />
                {isHit && <div className="hit-flash" />}
            </div>

            {isHit && (
                <div className={"damage-pop" + (hit!.amount === 0 ? " damage-miss" : "")} key={"pop" + hit!.key}>
                    {hit!.amount > 0 ? "−" + hit!.amount : "0"}
                </div>
            )}
        </div>
    );
}

interface BenchCardProps {
    monster: InBattle;
    clickable: boolean;
    onClick: () => void;
}

/** Minikort for resten av laget: hele kortet i liten skala. Forstørres ved hover, klikk for å bytte inn. */
export function BenchCard({ monster, clickable, onClick }: BenchCardProps) {
    const card = getCard(monster.cardId);
    return (
        <div
            className={"mini" + (clickable ? " mini-clickable" : "")}
            role="button"
            tabIndex={clickable ? 0 : -1}
            aria-disabled={!clickable}
            aria-label={"Bytt til " + card.name}
            onClick={() => {
                if (clickable) {
                    onClick();
                }
            }}
            onKeyDown={(e) => {
                if (clickable && (e.key === "Enter" || e.key === " ")) {
                    onClick();
                }
            }}
        >
            <QuilimonCard monster={monster} />
            {clickable && <span className="mini-label">Bytt inn</span>}
        </div>
    );
}

/** Beseiret kort i graveyard: også hele kortet, men grått. */
export function GraveCard({ cardId }: { cardId: string }) {
    const card = getCard(cardId);
    const dead: InBattle = { cardId, currentHp: 0, statusEffects: [], damageMultiplier: 1 };
    return (
        <div className="mini mini-grave" title={card.name + " er beseiret"}>
            <QuilimonCard monster={dead} />
            <span className="grave-x">✕</span>
        </div>
    );
}
