export const rbacMeta = {
  id: "rbac",
  label: "Role Based Access Control",
  group: "accessControl",
};

export function useRBACMeta() {
  return {
    ...rbacMeta,
  };
}

export default useRBACMeta;
