import React, { FC } from "react";
import { useDnD } from "@/context/DnDContext";

interface LeftPanelTypeItemProps {
  id: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  draggable: boolean;
  title: string;
  description: string;
  className?: string;
  version?: string;
}

const LeftPanelTypeItem: FC<LeftPanelTypeItemProps> = ({
  id,
  draggable,
  Icon,
  title,
  description,
  className = "",
  version,
}) => {
  const [_, setType, __, setVersion] = useDnD();

  const onDragStart = (
    event: { dataTransfer: { effectAllowed: string } },
    nodeType: string,
    version?: string
  ) => {
    setType(nodeType);
    setVersion(version || null);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`dndnode flex flex-row items-center p-2 gap-x-4 hover:cursor-pointer hover:bg-secondary rounded ${className}`}
      onDragStart={(event) => onDragStart(event, id, version)}
      draggable={draggable}
    >
      {Icon && (
        <Icon
          className="flex-shrink-0"
          style={{ height: "30px", width: "30px" }}
        />
      )}
      <div>
        <div className="font-bold text-lg">{title}</div>
        <div className="font-light text-slate-500 text-xs">{description}</div>
      </div>
    </div>
  );
};

export default LeftPanelTypeItem;
