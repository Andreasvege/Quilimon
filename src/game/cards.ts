export interface Card {
    name: string;
    id: string;
    description: string;
    image: string;
    type: "dark" | "fire" | "fighting" | "grass" | "water" | "rock";
    hp: number;
    attackIds: string[];
    evolution: string | null;
}