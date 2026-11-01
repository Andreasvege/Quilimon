// Oversetter Card.image (et filnavn) til en URL Vite kan servere.
// Motoren vet bare filnavnet, så den forblir fri for bundler-avhengigheter.
// Bildene i Web/ er nedskalerte kopier av Cropped/, så siden laster raskt.

const files = import.meta.glob("../assets/Web/*.jpg", { eager: true, import: "default" }) as Record<string, string>;

export function cardImageUrl(fileName: string): string {
    const url = files["../assets/Web/" + fileName];
    if (!url) {
        throw new Error(`Fant ikke bilde ${fileName}`);
    }
    return url;
}
