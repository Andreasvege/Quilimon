// Enkle typeikoner, tegnet i samme ånd som symbolene øverst til venstre på originalkortene.

export function TypeIcon({ type }: { type: string }) {
    if (type === "fire") {
        return (
            <svg viewBox="0 0 24 24" className="type-icon">
                <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z" />
            </svg>
        );
    }
    if (type === "grass") {
        return (
            <svg viewBox="0 0 24 24" className="type-icon">
                <path d="M3 21c2-5 3-9 2-14 2 4 3 8 3 14M9 21c0-6 1-11 4-16-1 5-1 11 0 16M14 21c1-5 3-9 7-12-3 4-4 8-4 12" />
            </svg>
        );
    }
    if (type === "fighting") {
        return (
            <svg viewBox="0 0 24 24" className="type-icon">
                <path d="M5 9h12a3 3 0 0 1 0 6h-2v3H7a2 2 0 0 1-2-2zM8 9V6m3 3V5m3 4V6" />
            </svg>
        );
    }
    if (type === "water") {
        return (
            <svg viewBox="0 0 24 24" className="type-icon">
                <path d="M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12z" />
            </svg>
        );
    }
    if (type === "rock") {
        return (
            <svg viewBox="0 0 24 24" className="type-icon">
                <path d="M3 18l3-8 5-3 6 2 4 6-2 4H5z" />
            </svg>
        );
    }
    // dark: solen fra Slepios kort
    return (
        <svg viewBox="0 0 24 24" className="type-icon">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
        </svg>
    );
}
