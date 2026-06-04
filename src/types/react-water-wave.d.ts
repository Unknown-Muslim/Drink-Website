declare module "react-water-wave" {
  import { ReactNode } from "react";
  interface WaterWaveProps {
    imageUrl: string;
    dropRadius?: number;
    perturbance?: number;
    resolution?: number;
    children: (data: unknown) => ReactNode;
    [key: string]: unknown;
  }
  export default function WaterWave(props: WaterWaveProps): JSX.Element;
}