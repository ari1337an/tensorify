import useStore from "@/app/_store/store";

export const accountMeta = {
  id: "account",
  label: "Account",
  group: "account",
};

export function useAccountMeta() {
  const currentUser = useStore((state) => state.currentUser);

  return {
    ...accountMeta,
    label: currentUser?.fullName || "Account",
  };
}

export default useAccountMeta;
