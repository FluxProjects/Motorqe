// src/utils/auth/navigation.ts
import { useNavigate } from "react-router-dom";

export const useAuthNavigation = () => {
  const navigate = useNavigate();

  const navigateByRole = (roleId: number) => {
    if (roleId === 1) {
      navigate("/buyer-dashboard");
    } else if (roleId === 2) {
      navigate("/seller-dashboard");
    } else if (roleId === 3) {
      navigate("/showroom-dashboard");
    } else if (roleId === 4) {
      navigate("/garage-dashboard");
    } else if ([5, 6, 7, 8].includes(roleId)) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return { navigateByRole };
};