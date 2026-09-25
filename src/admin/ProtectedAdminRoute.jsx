import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export function ProtectedAdminRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!active) return;

      if (sessionError || !session?.user) {
        setStatus("unauthenticated");
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        await supabase.auth.signOut();
        setStatus("forbidden");
        return;
      }

      setStatus("authorized");
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <main><p>Kontrollerer adgang...</p></main>;
  }

  if (status === "unauthenticated" || status === "forbidden") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
