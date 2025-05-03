import React, { useEffect, useState } from "react";

type Role = "BUYER" | "SELLER";

interface RoleSwitcherProps {
  userId: number;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ userId }) => {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveRole = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/roles/active`);
      const data = await res.json();
      setCurrentRole(data?.role ?? null);
    } catch (err) {
      console.error("Failed to fetch role:", err);
      setError("Unable to load active role.");
    }
  };

  const switchRole = async (newRole: Role) => {
    setLoading(true);
    setError(null);
    try {
      // Deactivate current role (optional)
      if (currentRole) {
        await fetch(`/api/users/${userId}/roles/deactivate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: currentRole }),
        });
      }

      // Record switch
      await fetch(`/api/users/${userId}/roles/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, isActive: true }),
      });

      // Activate new role
      await fetch(`/api/users/${userId}/roles/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      setCurrentRole(newRole);
    } catch (err) {
      console.error("Failed to switch role:", err);
      setError("Failed to switch role.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRole();
  }, [userId]);

  const otherRole: Role = currentRole === "BUYER" ? "SELLER" : "BUYER";

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-sm text-gray-600">
        Current Role: <strong>{currentRole || "Loading..."}</strong>
      </div>
      <button
        onClick={() => switchRole(otherRole)}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Switch to {otherRole}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default RoleSwitcher;
