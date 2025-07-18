export default interface NodeItem {
  id: string;
  draggable: boolean;
  version?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  children?: NodeItem[];
}
