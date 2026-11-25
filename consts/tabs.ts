import {
  Cog6ToothIcon,
  PaintBrushIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

export type TabItem = {
  id: string;
  name: string;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
};

export const tabs: TabItem[] = [
  {
    id: "general",
    name: "General",
    icon: Cog6ToothIcon,
  },
  {
    id: "content",
    name: "Content",
    icon: PencilSquareIcon,
  },
  {
    id: "design",
    name: "Design",
    icon: PaintBrushIcon,
  },
];
