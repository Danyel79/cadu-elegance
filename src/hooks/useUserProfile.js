import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyUserProfile, isAdminProfile } from "../services/adminDataService";

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      if (!user) {
        setProfile(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      (async () => {
        const res = await getMyUserProfile(user.$id);
        if (cancelled) return;
        if (res.success) {
          setProfile(res.data);
          setError(null);
        } else {
          setProfile(null);
          setError(res.error);
        }
        setLoading(false);
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return {
    profile,
    loading,
    error,
    isAdmin: isAdminProfile(profile),
  };
}
