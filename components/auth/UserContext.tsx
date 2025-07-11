'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        let docSnap = await getDoc(doc(db, "farmers", firebaseUser.uid));
        if (docSnap.exists()) {
          setRole("farmer");
          setUserData(docSnap.data());
        } else {
          docSnap = await getDoc(doc(db, "sellers", firebaseUser.uid));
          if (docSnap.exists()) {
            setRole("seller");
            setUserData(docSnap.data());
          } else {
            setRole(null);
            setUserData(null);
          }
        }
      } else {
        setUser(null);
        setRole(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, role, userData, setUserData, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 