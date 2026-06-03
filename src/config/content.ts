import { NavItem } from "@/features/navigation";
import { SizeOption } from "@/features/product-showcase";

export interface PageContent {
    nav: {
        logo: string;
        items: NavItem[];
        cartCount: number;
    };
    logo: {
        text: string;
    };
    sizes: SizeOption[];
    product: {
        title: string;
        description: string;
        buttonText: string;
    };
    scroll: {
        firstLine: string;
        secondLine: string;
    };
}

export const pageContent: PageContent = {
    nav: {
        logo: "MxRB",
        items: [
            { label: "Flavours" },
            { label: "Drinks" },
            { label: "Energy" },
            { label: "About" },
            { label: "Contact" },
        ],
        cartCount: 2,
    },
    logo: {
        text: "MONSTER × RED BULL",
    },
    sizes: [
        { size: "355", unit: "ML", selected: true },
        { size: "100", unit: "ML" },
        { size: "125", unit: "ML" },
    ],
    product: {
        title: "Collision",
        description:
            "Two legends. One unstoppable force. Monster × Red Bull Collab fuses raw energy with precision-crafted power — unleash the collision.",
        buttonText: "Explore",
    },
    scroll: {
        firstLine: "Get",
        secondLine: "This",
    },
};