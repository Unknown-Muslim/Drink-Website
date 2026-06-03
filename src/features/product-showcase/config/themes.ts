// Theme configuration for Monster × Red Bull energy drink flavors
export type JuiceName = "Original Strike" | "Red Storm" | "Ultra Void" | "Toxic Surge";

export interface ThemeConfig {
    mainBgColor: string;
    blurColor: string;
    textColor: string;
    accentColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
}

export interface JuiceInfo {
    title: string;
    description: string;
}

// Dark energy drink color themes
export const canThemeMap: Record<JuiceName, ThemeConfig> = {
    "Original Strike": {
        mainBgColor: "#0a1a0a",
        blurColor: "#00ff41",
        textColor: "white",
        accentColor: "rgba(0, 255, 65, 0.9)",
        buttonBgColor: "#00ff41",
        buttonTextColor: "#0a1a0a",
    },
    "Red Storm": {
        mainBgColor: "#1a0505",
        blurColor: "#ff1a1a",
        textColor: "white",
        accentColor: "rgba(255, 26, 26, 0.9)",
        buttonBgColor: "#ff1a1a",
        buttonTextColor: "#ffffff",
    },
    "Ultra Void": {
        mainBgColor: "#05050f",
        blurColor: "#6600ff",
        textColor: "white",
        accentColor: "rgba(102, 0, 255, 0.9)",
        buttonBgColor: "#6600ff",
        buttonTextColor: "#ffffff",
    },
    "Toxic Surge": {
        mainBgColor: "#0f1a00",
        blurColor: "#ccff00",
        textColor: "white",
        accentColor: "rgba(204, 255, 0, 0.9)",
        buttonBgColor: "#ccff00",
        buttonTextColor: "#0f1a00",
    },
};

// Energy drink product data
export const juiceData: Record<JuiceName, JuiceInfo> = {
    "Original Strike": {
        title: "Original Strike",
        description:
            "The classic collision. Monster's raw power meets Red Bull's precision in a neon-green surge that hits harder than anything you've felt before.",
    },
    "Red Storm": {
        title: "Red Storm",
        description:
            "Crimson chaos unleashed. A scorching fusion of Monster heat and Red Bull intensity — this one doesn't slow down. Ever.",
    },
    "Ultra Void": {
        title: "Ultra Void",
        description:
            "Enter the darkness. Ultra Void blends deep space cold with electric charge — a flavour that exists beyond the limits of ordinary energy.",
    },
    "Toxic Surge": {
        title: "Toxic Surge",
        description:
            "Radioactive rush. Toxic Surge delivers a citrus-acid jolt at the intersection of Monster aggression and Red Bull sharpness.",
    },
};

export interface SizeOption {
    size: string;
    unit: string;
    selected?: boolean;
}

export const defaultSizes: SizeOption[] = [
    { size: "355", unit: "ML", selected: true },
    { size: "500", unit: "ML", selected: false },
    { size: "1", unit: "L", selected: false },
];

export function getTheme(juiceName: string): ThemeConfig {
    return canThemeMap[juiceName as JuiceName] || canThemeMap["Original Strike"];
}

export function getJuiceInfo(juiceName: string): JuiceInfo {
    return juiceData[juiceName as JuiceName] || juiceData["Original Strike"];
}