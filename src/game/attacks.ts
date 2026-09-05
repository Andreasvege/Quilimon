export interface Attack {
    name: string;
    description: string;
    damage?: number;
    diceCost: number[];
    id: string;
    effect?: string;
    type: "normal" | "dark" | "fire" | "fighting" | "grass" | "water" | "rock";
}



export const ATTACKS: Record<string, Attack> = {
    // Mind Infuse må helt sikkert nerfes, alt for OP med 40 dmg, repeatable.
    "mindInfuse": {
        id: "mindInfuse",
        name: "Mind Infuse",
        description: "Psykisk grep inn i motstanderens hode. Lar deg også angripe igjen",
        damage: 40, 
        diceCost: [2, 3, 4],
        effect: "extraAction",
        type: "dark"
    },
    "grip": {
        id: "grip",
        name: "Grip",
        description: "Griper mostanderen og sleper han til din egen bunke.",
        diceCost: [1, 5, 6],
        effect: "grip",
        type: "dark"
    },
    "magmaSmoke": {
        id: "magmaSmoke",
        name: "Magma Smoke",
        description: "Blender fienden med brennende røyk i en runde.",
        diceCost: [2],
        effect: "blind",
        type: "fire"
    },
    // Fireball er potensielt også for OP. Kanskje 50 dmg siden den er så accurate?
    "fireball": {
        id: "fireball",
        name: "Fireball",
        description: "Skyter ut en ildkule på motstanderen.",
        damage: 70,
        diceCost: [1, 3, 4, 5, 6],
        type: "fire"
    },
    "mageckoGuard": {
        id: "mageckoGuard",
        name: "Guard",
        description: "Magecko vokter med kung-fu ferdigheter. Reduserer skade fra neste angrep og sender halvparten tilbake.",
        diceCost: [4, 6],
        effect: "mageckoGuard",
        type: "fighting"
    },
    "reflekt": {
        id: "reflekt",
        name: "Reflekt",
        description: "Reflekterer neste angrep tilbake på motstanderen.",
        diceCost: [4, 5, 6],
        effect: "reflect",
        type: "fighting"
    },
    "rockKick": {
        id: "rockKick",
        name: "Rock Kick",
        description: "Sparker løs en steinblokk mot motstanderen.",
        damage: 30,
        diceCost: [4, 6],
        type: "normal"
    },
    // Skaden er 10 x terningverdien, så den kan ikke stå som et tall her.
    // Effekten "diceScaledDamage" regner den ut fra kastet.
    // Revisjon til senere: La den fungere med hvilket som helst terningkast, og gange med 10. 1 -> 10, 2 -> 20 ... 6 -> 60.
    "atcoolSpess": {
        id: "atcoolSpess",
        name: "Rock Throw",
        description: "Slynger sin egen forsteinede hud mot motstanderen. Kraften avhenger av terningen.",
        diceCost: [4, 6],
        effect: "diceScaledDamage",
        type: "rock"
    },
    "scratch": {
        id: "scratch",
        name: "Scratch",
        description: "Klorer motstanderen med skarpe klør.",
        damage: 20,
        diceCost: [4, 6],
        type: "normal"
    },
    "inflame": {
        id: "inflame",
        name: "Inflame",
        description: "Antenner motstanderen i et plutselig utbrudd av flammer.",
        damage: 40,
        diceCost: [5, 6],
        type: "fire"
    },
    "charge": {
        id: "charge",
        name: "Charge",
        description: "Stormer inn i motstanderen med hodet først.",
        damage: 20,
        diceCost: [4, 6],
        type: "normal"
    },
    "pollen": {
        id: "pollen",
        name: "Pollen",
        description: "Sprer sporer som gjør motstanderen omtåket. Krever en sekser for å angripe neste runde.",
        diceCost: [4, 6],
        effect: "pollen",
        type: "grass"
    },
    "bubbles": {
        id: "bubbles",
        name: "Bubbles",
        description: "Spruter en byge av bobler mot motstanderen.",
        damage: 20,
        diceCost: [4, 6],
        type: "normal"
    },
    "spectralBeem": {
        id: "spectralBeem",
        name: "Spectral Beem",
        description: "Skyter en stråle av ren spektral energi. Verken varm eller kald.",
        damage: 60,
        diceCost: [5, 6],
        type: "water"
    },
}


/** Slår opp et angrep. Kaster ved ukjent id — det er en datafeil, ikke en spilltilstand. */
export function getAttack(id: string): Attack {
    const attack = ATTACKS[id];
    if (!attack) {
        throw new Error(`Attack with id ${id} not found`);
    }
    return attack;
}
