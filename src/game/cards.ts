interface Cards {
    name: string;
    description: string;
    image: string;
    type: string;
    hp: number;
    attacks: Attack[];
    evolution: string | null;
}