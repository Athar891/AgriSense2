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

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'seller' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

function getUserDocRef(userOrUidAndRole: { id: string, role: string } | { uid: string, role: string }) {
  const id = 'id' in userOrUidAndRole ? userOrUidAndRole.id : userOrUidAndRole.uid;
  const role = userOrUidAndRole.role;
  if (role === 'farmer') return doc(db, 'farmers', id);
  if (role === 'seller') return doc(db, 'sellers', id);
  throw new Error('Unknown role');
}

export { getUserDocRef };
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to get user profile from both collections
        let userDoc, userData, foundRole;
        for (const role of ['farmer', 'seller']) {
          const ref = getUserDocRef({ id: firebaseUser.uid, role });
          const docSnap = await getDoc(ref);
          if (docSnap.exists()) {
            userDoc = docSnap;
            userData = docSnap.data();
            foundRole = role;
            break;
          }
        }
        if (userDoc && userData && foundRole) {
          setUser({ 
            id: firebaseUser.uid,
            email: userData.email || firebaseUser.email || '',
            name: userData.name || firebaseUser.displayName || '',
            role: foundRole as 'farmer' | 'seller' | 'admin'
          });
          setNeedsOnboarding(!userData.role || typeof userData.role !== 'string' || userData.role.length === 0);
        } else {
          // If no profile, create a minimal one in 'farmers' by default
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: 'farmer',
          };
          await setDoc(getUserDocRef(newUser), newUser);
          setUser(newUser);
          setNeedsOnboarding(true);
        }
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setNeedsOnboarding(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const completeOnboarding = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    await setDoc(getUserDocRef(updatedUser), updatedUser, { merge: true });
    setUser(updatedUser);
    setNeedsOnboarding(false);
  };

  const login = async (email: string, password: string, role: 'farmer' | 'seller' | 'admin') => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const ref = getUserDocRef({ id: result.user.uid, role });
      const userDoc = await getDoc(ref);
      if (userDoc.exists() && userDoc.data().role === role) {
        const userData = userDoc.data();
        setUser({ 
          id: result.user.uid, 
          email: userData.email || '',
          name: userData.name || '',
          role: role 
        });
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
      await setDoc(getUserDocRef(newUser), newUser);
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
      let userDoc, userData, foundRole;
      for (const r of ['farmer', 'seller']) {
        const ref = getUserDocRef({ id: result.user.uid, role: r });
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          userDoc = docSnap;
          userData = docSnap.data();
          foundRole = r;
          break;
        }
      }
      if (!userDoc) {
        // Create user profile with selected role
        const newUser: User = {
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || '',
          role,
        };
        await setDoc(getUserDocRef(newUser), newUser);
        setUser(newUser);
      } else if (userData && foundRole) {
        if (!userData.role || typeof userData.role !== 'string' || userData.role.length === 0) {
          await setDoc(getUserDocRef({ id: result.user.uid, role }), { ...userData, role }, { merge: true });
          setUser({ 
            id: result.user.uid,
            email: userData.email || '',
            name: userData.name || '',
            role: role 
          });
        } else {
          setUser({ 
            id: result.user.uid,
            email: userData.email || '',
            name: userData.name || '',
            role: foundRole as 'farmer' | 'seller' | 'admin'
          });
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
    isLoading,
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