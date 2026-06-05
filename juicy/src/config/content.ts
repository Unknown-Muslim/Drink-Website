import { NavItem } from "@/features/navigation";
import { SizeOption } from "@/features/product-showcase";

export interface PageContent {
  nav: { logo: string; items: NavItem[]; cartCount: number; };
  logo: { text: string; };
  sizes: SizeOption[];
  product: { title: string; description: string; buttonText: string; };
  scroll: { firstLine: string; secondLine: string; };
}

export const pageContent: PageContent = {
  nav: {
    logo: "MxRB",
    items: [
      { label: "Flavours" },
      { label: "Drinks"   },
      { label: "Energy"   },
      { label: "About"    },
      { label: "Contact"  },
    ],
    cartCount: 2,
  },
  logo: { text: "MONSTER × RED BULL" },
  sizes: [
    { size: "355", unit: "ML", selected: true },
    { size: "500", unit: "ML" },
    { size: "1",   unit: "L"  },
  ],
  product: {
    title: "Original Strike",
    description: "The classic collision. Monster's raw power meets Red Bull's precision in a neon-green surge.",
    buttonText: "Explore",
  },
  scroll: { firstLine: "Get", secondLine: "This" },
};