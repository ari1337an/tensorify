import Image from "next/image";

interface Collaborator {
  id: string;
  avatarUrl: string;
  status: "editing" | "viewing" | "idle";
  name: string;
  colorIndex: number;
}

interface CollaboratorAvatarsProps {
  collaborators: Collaborator[];
  maxVisible?: number;
}

export function CollaboratorAvatars({
  collaborators,
  maxVisible = 2,
}: CollaboratorAvatarsProps) {
  const visibleCollaborators = collaborators.slice(0, maxVisible);
  const remainingCount = Math.max(0, collaborators.length - maxVisible);

  // Google Sheets-like collaboration colors with their corresponding Tailwind classes
  const getRingColorClass = (
    status: Collaborator["status"],
    colorIndex: number
  ) => {
    if (status === "idle") return "ring-gray-500";

    const colors = [
      "ring-teal-500",
      "ring-pink-500",
      "ring-purple-500",
      "ring-orange-500",
      "ring-cyan-500",
      "ring-yellow-500",
      "ring-indigo-500",
      "ring-rose-500",
    ];
    return colors[colorIndex % colors.length];
  };

  const getDotColorClass = (
    status: Collaborator["status"],
    colorIndex: number
  ) => {
    if (status === "idle") return "bg-gray-500";

    const colors = [
      "bg-teal-500",
      "bg-pink-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-cyan-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-rose-500",
    ];
    return colors[colorIndex % colors.length];
  };

  return (
    <div className="flex -space-x-1.5">
      {[...visibleCollaborators].reverse().map((collaborator, index) => (
        <div key={collaborator.id} className={`relative z-[${index + 2}]`}>
          <div
            className={`h-6 w-6 rounded-full overflow-hidden ring-[2px] ${getRingColorClass(
              collaborator.status,
              collaborator.colorIndex
            )}`}
          >
            <Image
              width={24}
              height={24}
              src={collaborator.avatarUrl}
              alt={`${collaborator.name} (${collaborator.status})`}
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${getDotColorClass(
              collaborator.status,
              collaborator.colorIndex
            )} ring-[0.5px] ring-background`}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="relative z-[1] h-6 w-6 rounded-full bg-muted flex items-center justify-center ring-[2px] ring-zinc-800">
          <span className="text-[10px] text-muted-foreground font-extrabold">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}
