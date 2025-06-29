import { type ComponentType, type SVGProps } from "react";

export interface NodeItem {
  id: string;
  draggable: boolean;
  version?: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  children?: NodeItem[];
}
