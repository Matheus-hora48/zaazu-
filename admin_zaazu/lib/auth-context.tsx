"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      console.warn("Firebase not configured, using demo mode");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get user data from Firestore
          if (db) {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: userData.name || "",
                role: userData.role || "user",
                createdAt: userData.createdAt?.toDate() || new Date(),
                lastLogin: userData.lastLogin?.toDate(),
              });
            } else {
              // If user document doesn't exist, treat as regular user
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: firebaseUser.displayName || "",
                role: "user",
                createdAt: new Date(),
              });
            }
          } else {
            // Fallback when Firestore is not available
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "",
              role: "user",
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error(
        "Firebase não configurado. Configure as credenciais no arquivo .env.local"
      );
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      setUser(null);
      setFirebaseUser(null);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    logout,
    isAdmin: user?.role === "admin",
    isFirebaseReady: isFirebaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
