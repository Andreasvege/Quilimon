// Hvor prikkene står på et terningøye, i et 3x3-rutenett (0–8, lest som en bok).
const PIPS: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
};

interface DiceProps {
    value: number | null;
    rolling: boolean;
    size?: "big" | "small";
}

export function Dice({ value, rolling, size = "big" }: DiceProps) {
    const cells = [];
    for (let i = 0; i < 9; i++) {
        let hasPip = false;
        if (value !== null && PIPS[value].includes(i)) {
            hasPip = true;
        }
        cells.push(<span key={i} className={hasPip ? "pip" : "pip-empty"} />);
    }

    let className = "dice dice-" + size;
    if (rolling) {
        className += " dice-rolling";
    }
    if (value === null) {
        className += " dice-blank";
    }

    return <div className={className}>{cells}</div>;
}
