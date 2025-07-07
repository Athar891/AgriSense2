'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { auth, provider, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'seller' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  completeOnboarding: (data: Partial<User>) => Promise<void>;
  login: (email: string, password: string, role: 'farmer' | 'seller' | 'admin') => Promise<{ success: boolean; error?: string }>;
  signup: (userData: { email: string; password: string; name: string; role: 'farmer' | 'seller' | 'admin' }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loginWithGoogle: (role: 'farmer' | 'seller' | 'admin') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          setNeedsOnboarding(!userData.role || typeof userData.role !== 'string' || userData.role.length === 0);
        } else {
          // If no profile, create a minimal one (no role yet)
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: undefined as any, // will trigger onboarding
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
          setNeedsOnboarding(true);
        }
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setNeedsOnboarding(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const completeOnboarding = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    await setDoc(doc(db, 'users', user.id), updatedUser, { merge: true });
    setUser(updatedUser);
    setNeedsOnboarding(false);
  };

  const login = async (email: string, password: string, role: 'farmer' | 'seller' | 'admin') => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Check role in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists() && userDoc.data().role === role) {
        setUser(userDoc.data() as User);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        await signOut(auth);
        return { success: false, error: 'Role mismatch or user profile not found' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData: { email: string; password: string; name: string; role: 'farmer' | 'seller' | 'admin' }) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const newUser: User = {
        id: result.user.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role
      };
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async (role: 'farmer' | 'seller' | 'admin') => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        // Create user profile with selected role
        const newUser: User = {
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || '',
          role,
        };
        await setDoc(doc(db, 'users', result.user.uid), newUser);
        setUser(newUser);
      } else {
        const userData = userDoc.data() as User;
        // If role is missing, set it to the selected role
        if (!userData.role || typeof userData.role !== 'string' || userData.role.length === 0) {
          await setDoc(doc(db, 'users', result.user.uid), { ...userData, role }, { merge: true });
          setUser({ ...userData, role });
        } else {
          setUser(userData);
        }
      }
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    needsOnboarding,
    completeOnboarding,
    login,
    signup,
    logout,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}