import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthed(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!isAuthed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
