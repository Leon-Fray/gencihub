// types.ts
export interface SpoofConfig {
    quality: number;
    enableNoise: boolean;
    enableWarping: boolean;
    enableColorShift: boolean;
    enableFilters: boolean;
    enableShapes: boolean;
}

export interface Point {
    x: number;
    y: number;
}

