import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import useStore from "@/app/_store/store";

export function AccountIcon() {
  const currentUser = useStore((state) => state.currentUser);

  return (
    <Avatar className="h-5 w-5">
      <AvatarImage
        src={currentUser?.imageUrl}
        alt={currentUser?.firstName + " " + currentUser?.lastName || ""}
      />
      <AvatarFallback>
        {currentUser?.firstName?.[0]}
        {currentUser?.lastName?.[0]}
      </AvatarFallback>
    </Avatar>
  );
}

export default AccountIcon;
