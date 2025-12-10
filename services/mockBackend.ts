import { User, Project, AuthResponse, Transaction } from '../types';

const STORAGE_KEYS = {
  USERS: 'amy_users',
  PROJECTS: 'amy_projects',
  SESSION: 'amy_session',
  TRANSACTIONS: 'amy_transactions',
  GUEST_USAGE: 'amy_guest_usage'
};

const DAILY_FREE_CREDITS = 3;
const ADMIN_EMAIL = "brightgiggletv@gmail.com";

// --- HELPERS ---
const getFromStorage = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- AUTH SERVICES ---

export const authService = {
  signUp: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    if (users.find((u: any) => u.email === email)) {
      throw new Error("User already exists");
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      email,
      name,
      freeCredits: DAILY_FREE_CREDITS,
      purchasedCredits: 0,
      lastDailyReset: Date.now(),
      createdAt: Date.now(),
      isBanned: false
    };

    users.push({ ...newUser, password }); 
    saveToStorage(STORAGE_KEYS.USERS, users);

    const token = 'token_' + Date.now();
    saveToStorage(STORAGE_KEYS.SESSION, { token, userId: newUser.id });

    return { user: newUser, token };
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    let user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.isBanned) throw new Error("Account suspended.");

    // DAILY RESET CHECK
    user = creditService.checkAndResetDailyCredits(user, users);

    const { password: _, ...safeUser } = user;
    const token = 'token_' + Date.now();
    saveToStorage(STORAGE_KEYS.SESSION, { token, userId: safeUser.id });

    return { user: safeUser, token };
  },

  signInWithGoogle: async (): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const mockGoogleUser = {
      email: "user" + Math.floor(Math.random() * 1000) + "@gmail.com",
      name: "Google User",
      photoURL: "https://lh3.googleusercontent.com/a/ACg8ocIq8d_...=s96-c" 
    };

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    let user = users.find((u: any) => u.email === mockGoogleUser.email);

    if (!user) {
      // Create new user
      user = {
        id: 'user_' + Date.now(),
        email: mockGoogleUser.email,
        name: mockGoogleUser.name,
        photoURL: mockGoogleUser.photoURL,
        freeCredits: DAILY_FREE_CREDITS,
        purchasedCredits: 0,
        lastDailyReset: Date.now(),
        createdAt: Date.now(),
        isBanned: false,
        password: 'google_auth_placeholder'
      };
      users.push(user);
      saveToStorage(STORAGE_KEYS.USERS, users);
    } else {
      // Existing user: Check Daily Reset
      user = creditService.checkAndResetDailyCredits(user, users);
    }

    if (user.isBanned) throw new Error("Account suspended.");

    const { password: _, ...safeUser } = user;
    const token = 'token_' + Date.now();
    saveToStorage(STORAGE_KEYS.SESSION, { token, userId: safeUser.id });

    return { user: safeUser, token };
  },

  signOut: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const session = getFromStorage(STORAGE_KEYS.SESSION);
    if (!session) return null;

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    let user = users.find((u: any) => u.id === session.userId);
    
    if (user) {
      if (user.isBanned) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        return null;
      }
      // Check reset on every load/refresh
      user = creditService.checkAndResetDailyCredits(user, users);
      
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },

  isAdmin: (email: string) => email === ADMIN_EMAIL
};

// --- CREDIT & PAYMENT SERVICES ---

export const creditService = {
  // Core logic to reset daily credits
  checkAndResetDailyCredits: (user: any, allUsers: any[]) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Default values for migration if missing
    if (user.freeCredits === undefined) user.freeCredits = 0;
    if (user.purchasedCredits === undefined) user.purchasedCredits = (user.credits || 0); // Migrate old credits to paid
    if (!user.lastDailyReset) user.lastDailyReset = 0;

    if (now - user.lastDailyReset > oneDay) {
      user.freeCredits = DAILY_FREE_CREDITS; // Reset to 3
      user.lastDailyReset = now;
      
      // Update in DB
      const index = allUsers.findIndex(u => u.id === user.id);
      if (index !== -1) {
        allUsers[index] = user;
        saveToStorage(STORAGE_KEYS.USERS, allUsers);
      }
    }
    return user;
  },

  purchaseCredits: async (userId: string, amount: number, cost: number): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate payment processing

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const index = users.findIndex((u: any) => u.id === userId);
    
    if (index === -1) throw new Error("User not found");

    // Add to PURCHASED credits (never expire)
    users[index].purchasedCredits = (users[index].purchasedCredits || 0) + amount;
    saveToStorage(STORAGE_KEYS.USERS, users);

    // Log transaction
    const transactions = getFromStorage(STORAGE_KEYS.TRANSACTIONS) || [];
    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      userId,
      amount,
      cost,
      type: 'purchase',
      timestamp: Date.now()
    };
    transactions.push(newTx);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

    return users[index];
  }
};

export const usageService = {
  checkGuestLimit: (): boolean => {
    const usage = parseInt(localStorage.getItem(STORAGE_KEYS.GUEST_USAGE) || '0');
    return usage < 3;
  },

  incrementGuestUsage: () => {
    const usage = parseInt(localStorage.getItem(STORAGE_KEYS.GUEST_USAGE) || '0');
    localStorage.setItem(STORAGE_KEYS.GUEST_USAGE, (usage + 1).toString());
  },

  deductCredit: async (userId: string): Promise<User> => {
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const index = users.findIndex((u: any) => u.id === userId);
    
    if (index === -1) throw new Error("User not found");
    const user = users[index];

    // Priority: Use Free Credits first
    if (user.freeCredits > 0) {
      user.freeCredits -= 1;
    } else if (user.purchasedCredits > 0) {
      user.purchasedCredits -= 1;
    } else {
      throw new Error("Insufficient credits");
    }

    saveToStorage(STORAGE_KEYS.USERS, users);
    return user;
  }
};

// --- ADMIN SERVICES ---

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    return users.map(({ password, ...u }: any) => u);
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    return getFromStorage(STORAGE_KEYS.TRANSACTIONS) || [];
  },

  updateUserCredits: async (userId: string, amount: number): Promise<void> => {
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const index = users.findIndex((u: any) => u.id === userId);
    if (index !== -1) {
      // Admin adds to purchased credits
      users[index].purchasedCredits = (users[index].purchasedCredits || 0) + amount;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  },

  toggleUserBan: async (userId: string): Promise<boolean> => {
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const index = users.findIndex((u: any) => u.id === userId);
    let newStatus = false;
    if (index !== -1) {
      if (users[index].email === ADMIN_EMAIL) return false;
      users[index].isBanned = !users[index].isBanned;
      newStatus = users[index].isBanned;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
    return newStatus;
  }
};

// --- PROJECT SERVICES ---
export const projectService = {
  createProject: async (userId: string, name: string, description: string): Promise<Project> => {
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS) || [];
    
    const newProject: Project = {
      id: 'proj_' + Date.now(),
      userId,
      name: name || "Untitled Project",
      description: description || "No description",
      code: "", 
      messages: [],
      images: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    projects.push(newProject);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },

  updateProject: async (project: Project): Promise<void> => {
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS) || [];
    const index = projects.findIndex((p: any) => p.id === project.id);
    
    if (index !== -1) {
      projects[index] = { ...project, updatedAt: Date.now() };
      saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    }
  },

  getUserProjects: async (userId: string): Promise<Project[]> => {
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS) || [];
    return projects
      .filter((p: any) => p.userId === userId)
      .sort((a: any, b: any) => b.updatedAt - a.updatedAt);
  },

  deleteProject: async (projectId: string) => {
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS) || [];
    const filtered = projects.filter((p: any) => p.id !== projectId);
    saveToStorage(STORAGE_KEYS.PROJECTS, filtered);
  }
};
