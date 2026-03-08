import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useStaffSession(requiredRole?: string) {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("staff_session");
    if (!stored) {
      navigate("/admin");
      return;
    }
    const parsed = JSON.parse(stored);
    if (requiredRole && parsed.role !== requiredRole) {
      navigate("/admin");
      return;
    }
    setSession(parsed);
  }, [navigate, requiredRole]);

  const logout = () => {
    localStorage.removeItem("staff_session");
    navigate("/admin");
  };

  return { session, logout };
}
