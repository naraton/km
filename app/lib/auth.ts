export const getUser = () => {
  if (typeof window === "undefined") return null;

  const storedUser = localStorage.getItem("user");

  if (!storedUser) return null;

  return JSON.parse(storedUser);
};

export const hasPermission = (permission: string) => {
  if (typeof window === "undefined") return false;

  // 1. Check from standalone permissions stored in localStorage
  const storedPermissions = localStorage.getItem("permissions");
  if (storedPermissions) {
    try {
      const permissions = JSON.parse(storedPermissions);
      if (Array.isArray(permissions) && permissions.includes(permission)) {
        return true;
      }
    } catch (e) {
      console.error("Error parsing permissions from localStorage:", e);
    }
  }

  // 2. Fallback to check within stored user permissions
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (Array.isArray(user.permissions) && user.permissions.includes(permission)) {
        return true;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
  }

  return false;
};