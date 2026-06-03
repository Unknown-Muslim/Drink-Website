import { JuiceCan, PositionConfig } from "../types";

// Energy drink can data with 3D model paths
export const juiceCans: JuiceCan[] = [
    {
        name: "Original Strike",
        color: "#00ff41",
        model: "/assets/3d/can/lemon.glb",
        position: "top",
    },
    {
        name: "Red Storm",
        color: "#ff1a1a",
        model: "/assets/3d/can/raspberry.glb",
        position: "right",
    },
    {
        name: "Ultra Void",
        color: "#6600ff",
        model: "/assets/3d/can/blueberry.glb",
        position: "bottom",
    },
    {
        name: "Toxic Surge",
        color: "#ccff00",
        model: "/assets/3d/can/mango.glb",
        position: "left",
    },
];

export const positionConfigs: PositionConfig[] = [
    {
        className: "absolute top-0 left-1/2 -translate-x-1/2",
        transformOrigin: "center center",
        rotation: [0, Math.PI / 3, 0],
    },
    {
        className: "absolute top-1/2 right-0  -translate-y-1/2 rotate-90",
        transformOrigin: "center center",
        rotation: [0, Math.PI / 3, 0],
    },
    {
        className: "absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180",
        transformOrigin: "center center",
        rotation: [0, Math.PI / 3, 0],
    },
    {
        className: "absolute top-1/2 left-0 -translate-y-1/2  rotate-270",
        transformOrigin: "center center",
        rotation: [0, Math.PI / 3, 0],
    },
];