import { Users } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface PeopleMetaType {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export const peopleMeta: PeopleMetaType = {
  id: "people",
  label: "People",
  icon: Users,
  group: "Organization",
};

export default function usePeopleMeta() {
  return peopleMeta;
}
