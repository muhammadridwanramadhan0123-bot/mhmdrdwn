import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  /*
   * Mengambil profil berdasarkan:
   * profiles.id = auth.users.id
   */
  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }, []);

  /*
   * Menyamakan session Supabase Auth
   * dengan data profile di database.
   */
  const synchronizeSession = useCallback(
    async (session, showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        setAuthError("");

        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (!currentUser) {
          setProfile(null);
          return;
        }

        const currentProfile = await loadProfile(
          currentUser.id
        );

        setProfile(currentProfile);
      } catch (error) {
        console.error(
          "Gagal menyinkronkan session admin:",
          error
        );

        setProfile(null);

        setAuthError(
          error instanceof Error
            ? error.message
            : "Data akun gagal dimuat."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [loadProfile]
  );

  /*
   * Memeriksa session ketika aplikasi
   * pertama kali dibuka.
   */
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        setLoading(true);
        setAuthError("");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        await synchronizeSession(
          session,
          false
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Gagal memeriksa session login:",
          error
        );

        setUser(null);
        setProfile(null);

        setAuthError(
          error instanceof Error
            ? error.message
            : "Session login gagal diperiksa."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    /*
     * Memantau login, logout,
     * dan perubahan session.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }

        void synchronizeSession(session);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [synchronizeSession]);

  /*
   * Memuat ulang profile setelah role
   * atau data profile berubah.
   */
  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return null;
    }

    try {
      setAuthError("");

      const updatedProfile = await loadProfile(
        user.id
      );

      setProfile(updatedProfile);

      return updatedProfile;
    } catch (error) {
      console.error(
        "Gagal memperbarui profile:",
        error
      );

      setAuthError(
        error instanceof Error
          ? error.message
          : "Profile gagal diperbarui."
      );

      throw error;
    }
  }, [loadProfile, user]);

  /*
   * Logout dipusatkan melalui context.
   */
  const signOut = useCallback(async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
    setProfile(null);
    setAuthError("");
  }, []);

  const role = String(
    profile?.role || ""
  )
    .trim()
    .toLowerCase();

  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const isViewer = role === "viewer";

  const isContentManager =
    isAdmin || isEditor;

  const value = useMemo(
    () => ({
      user,
      profile,
      role,
      loading,
      authError,
      isAdmin,
      isEditor,
      isViewer,
      isContentManager,
      refreshProfile,
      signOut,
    }),
    [
      user,
      profile,
      role,
      loading,
      authError,
      isAdmin,
      isEditor,
      isViewer,
      isContentManager,
      refreshProfile,
      signOut,
    ]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(
    AdminAuthContext
  );

  if (!context) {
    throw new Error(
      "useAdminAuth harus digunakan di dalam AdminAuthProvider."
    );
  }

  return context;
}