import { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut as firebaseSignOut,
    signInAnonymously,
    onAuthStateChanged,
    updateProfile
  } from 'firebase/auth';
  import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    orderBy,
    limit
  } from 'firebase/firestore';
  import { auth, db, googleProvider } from './firebase';
  import { User, Project, AuthResponse, Transaction } from '../types';
  
  // --- MOCK STORAGE FALLBACK (Used if Firebase is not configured) ---
  const STORAGE_KEYS = {
    USERS: 'amy_users',
    PROJECTS: 'amy_projects',
    SESSION: 'amy_session',
    TRANSACTIONS: 'amy_transactions',
  };
  
  const isFirebaseActive = !!auth && !!db && (import.meta as any).env.VITE_FIREBASE_API_KEY;
  
  const DAILY_FREE_CREDITS = 3;
  const ADMIN_EMAIL = "brightgiggletv@gmail.com";
  
  // --- AUTH SERVICE ---
  
  export const authService = {
    signUp: async (name: string, email: string, password: string): Promise<AuthResponse> => {
      if (isFirebaseActive && auth && db) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        const newUser: User = {
          id: userCredential.user.uid,
          email: email,
          name: name,
          freeCredits: DAILY_FREE_CREDITS,
          purchasedCredits: 0,
          lastDailyReset: Date.now(),
          createdAt: Date.now(),
          isBanned: false
        };
        
        await setDoc(doc(db, "users", newUser.id), newUser);
        return { user: newUser, token: await userCredential.user.getIdToken() };
      } else {
        // Fallback Mock
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        if (users.find((u: any) => u.email === email)) throw new Error("User exists");
        const newUser = {
          id: 'user_' + Date.now(),
          email, name, freeCredits: DAILY_FREE_CREDITS, purchasedCredits: 0,
          lastDailyReset: Date.now(), createdAt: Date.now(), isBanned: false
        };
        users.push({ ...newUser, password });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ userId: newUser.id }));
        return { user: newUser, token: 'mock_token' };
      }
    },
  
    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      if (isFirebaseActive && auth && db) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (!userDoc.exists()) throw new Error("User data not found");
        const userData = userDoc.data() as User;
        
        // Reset check
        const updatedUser = creditService.checkAndResetDailyCredits(userData);
        if (updatedUser.lastDailyReset !== userData.lastDailyReset) {
             await updateDoc(doc(db, "users", userData.id), { 
                 freeCredits: updatedUser.freeCredits,
                 lastDailyReset: updatedUser.lastDailyReset 
             });
        }
  
        return { user: updatedUser, token: await userCredential.user.getIdToken() };
      } else {
        // Fallback Mock
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        let user = users.find((u: any) => u.email === email && u.password === password);
        if (!user) throw new Error("Invalid credentials");
        user = creditService.checkAndResetDailyCredits(user);
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ userId: user.id }));
        // Update mock db
        const idx = users.findIndex((u:any) => u.id === user.id);
        users[idx] = user;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return { user, token: 'mock_token' };
      }
    },
  
    signInWithGoogle: async (): Promise<AuthResponse> => {
        if (isFirebaseActive && auth && db && googleProvider) {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const userRef = doc(db, "users", userCredential.user.uid);
            const userDoc = await getDoc(userRef);

            let userData: User;

            if (userDoc.exists()) {
                userData = userDoc.data() as User;
            } else {
                userData = {
                    id: userCredential.user.uid,
                    email: userCredential.user.email || "",
                    name: userCredential.user.displayName || "User",
                    photoURL: userCredential.user.photoURL || undefined,
                    freeCredits: DAILY_FREE_CREDITS,
                    purchasedCredits: 0,
                    lastDailyReset: Date.now(),
                    createdAt: Date.now(),
                    isBanned: false
                };
                await setDoc(userRef, userData);
            }
             // Reset check
            const updatedUser = creditService.checkAndResetDailyCredits(userData);
            if (updatedUser.lastDailyReset !== userData.lastDailyReset) {
                    await updateDoc(userRef, { 
                        freeCredits: updatedUser.freeCredits,
                        lastDailyReset: updatedUser.lastDailyReset 
                    });
            }
            return { user: updatedUser, token: await userCredential.user.getIdToken() };
        } else {
             // Mock Google
             return authService.signUp("Mock Google User", `user${Date.now()}@gmail.com`, "password");
        }
    },

    signInAnonymously: async (): Promise<User> => {
        if (isFirebaseActive && auth) {
            const userCredential = await signInAnonymously(auth);
            return {
                id: userCredential.user.uid,
                email: "guest@amy.ai",
                name: "Guest",
                freeCredits: 2, // Strict limit for guests
                purchasedCredits: 0,
                lastDailyReset: Date.now(),
                createdAt: Date.now(),
                isBanned: false
            }
        }
        throw new Error("Guest mode not available in mock");
    },
  
    signOut: async () => {
        if (isFirebaseActive && auth) {
            await firebaseSignOut(auth);
        }
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    },
  
    getCurrentUser: async (): Promise<User | null> => {
      if (isFirebaseActive && auth && db) {
         return new Promise((resolve) => {
             const unsubscribe = onAuthStateChanged(auth, async (user) => {
                 unsubscribe();
                 if (user) {
                     const snap = await getDoc(doc(db, "users", user.uid));
                     if (snap.exists()) {
                         resolve(snap.data() as User);
                     } else {
                         resolve(null);
                     }
                 } else {
                     resolve(null);
                 }
             });
         });
      } else {
          // Fallback Mock
          const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
          if (!session) return null;
          const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
          return users.find((u:any) => u.id === session.userId) || null;
      }
    }
  };
  
  // --- PROJECT SERVICE ---
  
  export const projectService = {
    createProject: async (userId: string, name: string, description: string): Promise<Project> => {
        const newProject: Project = {
            id: 'proj_' + Date.now() + Math.random().toString(36).substr(2, 9),
            userId,
            name: name || "Untitled Project",
            description: description || "",
            code: "",
            messages: [],
            images: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        if (isFirebaseActive && db) {
            await setDoc(doc(db, "projects", newProject.id), newProject);
        } else {
            const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
            projects.push(newProject);
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        }
        return newProject;
    },
  
    updateProject: async (project: Project): Promise<void> => {
        if (isFirebaseActive && db) {
            await updateDoc(doc(db, "projects", project.id), { ...project, updatedAt: Date.now() });
        } else {
            const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
            const idx = projects.findIndex((p:any) => p.id === project.id);
            if (idx !== -1) {
                projects[idx] = { ...project, updatedAt: Date.now() };
                localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
            }
        }
    },
  
    getUserProjects: async (userId: string): Promise<Project[]> => {
        if (isFirebaseActive && db) {
            const q = query(collection(db, "projects"), where("userId", "==", userId), orderBy("updatedAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => d.data() as Project);
        } else {
            const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
            return projects.filter((p:any) => p.userId === userId).sort((a:any, b:any) => b.updatedAt - a.updatedAt);
        }
    },
    
    getPublicProject: async (projectId: string): Promise<Project | null> => {
         if (isFirebaseActive && db) {
             const docSnap = await getDoc(doc(db, "projects", projectId));
             if (docSnap.exists()) return docSnap.data() as Project;
             return null;
         } else {
             const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
             return projects.find((p:any) => p.id === projectId) || null;
         }
    },
    
    publishProject: async (projectId: string): Promise<string> => {
        // In this architecture, projects are already in DB. Publishing just means sharing the ID.
        // We could add a flag "isPublic: true" to enforce security rules in a real app.
        if (isFirebaseActive && db) {
            await updateDoc(doc(db, "projects", projectId), { isPublic: true });
        }
        return `${window.location.origin}/?project=${projectId}`;
    },

    deleteProject: async (projectId: string) => {
        if (isFirebaseActive && db) {
            await deleteDoc(doc(db, "projects", projectId));
        } else {
             const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
             const filtered = projects.filter((p:any) => p.id !== projectId);
             localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
        }
    }
  };
  
  // --- CREDIT SERVICE ---
  
  export const creditService = {
    checkAndResetDailyCredits: (user: User) => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      const lastReset = user.lastDailyReset || 0;
      if (now - lastReset > oneDay) {
        return { ...user, freeCredits: DAILY_FREE_CREDITS, lastDailyReset: now };
      }
      return user;
    },
  
    purchaseCredits: async (userId: string, amount: number, cost: number): Promise<User> => {
        // Simulate Payment
        await new Promise(r => setTimeout(r, 1000));
        
        if (isFirebaseActive && db) {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) throw new Error("User not found");
            
            const userData = userSnap.data() as User;
            const newCredits = (userData.purchasedCredits || 0) + amount;
            
            await updateDoc(userRef, { purchasedCredits: newCredits });
            
            // Log Transaction
            const tx: Transaction = {
                id: 'tx_' + Date.now(),
                userId, amount, cost, type: 'purchase', timestamp: Date.now()
            };
            await setDoc(doc(db, "transactions", tx.id), tx);
            
            return { ...userData, purchasedCredits: newCredits };
        } else {
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
            const idx = users.findIndex((u:any) => u.id === userId);
            if (idx === -1) throw new Error("User not found");
            users[idx].purchasedCredits = (users[idx].purchasedCredits || 0) + amount;
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            return users[idx];
        }
    }
  };
  
  // --- USAGE SERVICE ---
  export const usageService = {
      deductCredit: async (userId: string): Promise<User> => {
          if (isFirebaseActive && db) {
             const userRef = doc(db, "users", userId);
             const snap = await getDoc(userRef);
             if (!snap.exists()) throw new Error("User missing");
             const u = snap.data() as User;
             
             if (u.freeCredits > 0) {
                 await updateDoc(userRef, { freeCredits: u.freeCredits - 1 });
                 return { ...u, freeCredits: u.freeCredits - 1 };
             } else if (u.purchasedCredits > 0) {
                 await updateDoc(userRef, { purchasedCredits: u.purchasedCredits - 1 });
                 return { ...u, purchasedCredits: u.purchasedCredits - 1 };
             } else {
                 throw new Error("Insufficient credits");
             }
          } else {
             // Mock Fallback
             const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
             const idx = users.findIndex((u:any) => u.id === userId);
             if (idx === -1) throw new Error("User not found");
             
             const user = users[idx];
             if (user.freeCredits > 0) {
                 user.freeCredits -= 1;
             } else if (user.purchasedCredits > 0) {
                 user.purchasedCredits -= 1;
             } else {
                 throw new Error("Insufficient credits");
             }
             users[idx] = user;
             localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
             return user;
          }
      },
      
      checkGuestLimit: () => {
         const count = parseInt(localStorage.getItem("guest_usage") || '0');
         return count < 2;
      },
      
      incrementGuestUsage: () => {
         const count = parseInt(localStorage.getItem("guest_usage") || '0');
         localStorage.setItem("guest_usage", (count + 1).toString());
      }
  };

  // --- ADMIN SERVICE ---
  export const adminService = {
      getAllUsers: async (): Promise<User[]> => {
          if (isFirebaseActive && db) {
             const q = query(collection(db, "users"), limit(50));
             const s = await getDocs(q);
             return s.docs.map(d => d.data() as User);
          } else {
              // Mock
              const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
              return users;
          }
      },
      getAllTransactions: async () => [],
      updateUserCredits: async () => {},
      toggleUserBan: async (userId: string) => {
          if (isFirebaseActive && db) {
             const ref = doc(db, "users", userId);
             const snap = await getDoc(ref);
             if (snap.exists()) {
                 const current = snap.data().isBanned || false;
                 await updateDoc(ref, { isBanned: !current });
                 return !current;
             }
          } else {
             const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
             const idx = users.findIndex((u:any) => u.id === userId);
             if (idx !== -1) {
                 users[idx].isBanned = !users[idx].isBanned;
                 localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
                 return users[idx].isBanned;
             }
          }
          return false;
      }
  };