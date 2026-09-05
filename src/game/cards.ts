export interface Card {
    id: string;
    name: string;
    description: string;
    image: string;
    type: "dark" | "fire" | "fighting" | "grass" | "water" | "rock";
    hp: number;
    attackIds: string[];
    evolution: string | null;
}


export const CARDS: Record<string, Card> = {
    "slepio": {
        id: "slepio",
        name: "Slepio",
        description: "Monsteret som krabbet hele veien fra Hades til Oververdenen. Utviklet slepemuskulatur over århundrer fra reisen sin, og bruker den nå til å hevne seg på alle som trosset det.",
        image: "Slepio.jpg",
        type: "dark",
        hp: 200,
        attackIds: ["mindInfuse", "grip"],
        evolution: null
    },
    "magmo": {
        id: "magmo",
        name: "Magmo",
        description: "Sagt til å være utløseren av destruksjonen av Pompeii. Reist rundt om hele verden og tatt med seg krig og død over alt.",
        image: "Magmo.jpg",
        type: "fire",
        hp: 100,
        attackIds: ["magmaSmoke", "fireball"],
        evolution: null
    },
    "magecko": {
        id: "magecko",
        name: "Magecko",
        description: "Det sies at Magecko faktisk ikke er en Gecko, men en magisk frosk som alltid blir blandet med en Gecko. Kaller du han ved hans gitte navn vil han bruke sine eldgamle kung-fu ferdigheter til å få deg til å angre.",
        image: "Magecko.jpg",
        type: "fighting",
        hp: 60,
        attackIds: ["mageckoGuard", "reflekt"],
        evolution: null
    },
    "atcool": {
        id: "atcool",
        name: "Atcool",
        description: "Legenden sier at Atcool, som i sin tid var en vanlig mann, ble forhekset av en ond trollkvinne, og tvunge til å leve for alltid. Steinen han er dekt i er ikke stein, men hans harde, gamle, ganske ekle hud.",
        image: "Atcool.jpg",
        type: "rock",
        hp: 50,
        attackIds: ["rockKick", "atcoolSpess"],
        evolution: null
    },
    "shag": {
        id: "shag",
        name: "Shag",
        description: "Ingen vet noe om Shag.",
        image: "Shag.jpg",
        type: "fire",
        hp: 40,
        attackIds: ["scratch", "inflame"],
        evolution: "Infireo"
    },
    "mush": {
        id: "mush",
        name: "Mush",
        description: "Fra kantarellfamilien.",
        image: "Mush.jpg",
        type: "grass",
        hp: 30,
        attackIds: ["charge", "pollen"],
        evolution: "Lumpbeard"
    },
    "plune": {
        id: "plune",
        name: "Plune",
        description: "En umulig skapning. En vanndråpe, satt på fyr av sin skaper. Alltid i balanse mellom varm og kald, ild og vann. Og liv og død.",
        image: "Plune.jpg",
        type: "water",
        hp: 30,
        attackIds: ["bubbles", "spectralBeem"],
        evolution: "Pawlune"
    }
}

export function getCard(id: string): Card {
    const card = CARDS[id];
    if (!card) {
        throw new Error(`Card with id ${id} not found`);
    }
    return card;
}