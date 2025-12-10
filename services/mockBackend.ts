import { User, Project, AuthResponse } from '../types';

const STORAGE_KEYS = {
  USERS: 'amy_users',
  PROJECTS: 'amy_projects',
  SESSION: 'amy_session',
  GUEST_USAGE: 'amy_guest_usage'
};

const INITIAL_CREDITS = 20;
const GUEST_LIMIT = 3;

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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    if (users.find((u: any) => u.email === email)) {
      throw new Error("User already exists");
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      email,
      name,
      credits: INITIAL_CREDITS,
      createdAt: Date.now()
    };

    // Store user (password would be hashed in real app)
    users.push({ ...newUser, password }); 
    saveToStorage(STORAGE_KEYS.USERS, users);

    // Create session
    const token = 'token_' + Date.now();
    saveToStorage(STORAGE_KEYS.SESSION, { token, userId: newUser.id });

    return { user: newUser, token };
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Remove password from returned object
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
    const user = users.find((u: any) => u.id === session.userId);
    
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }
};

// --- USAGE & CREDITS ---

export const usageService = {
  checkGuestLimit: (): boolean => {
    const usage = parseInt(localStorage.getItem(STORAGE_KEYS.GUEST_USAGE) || '0');
    return usage < GUEST_LIMIT;
  },

  incrementGuestUsage: () => {
    const usage = parseInt(localStorage.getItem(STORAGE_KEYS.GUEST_USAGE) || '0');
    localStorage.setItem(STORAGE_KEYS.GUEST_USAGE, (usage + 1).toString());
  },

  deductCredit: async (userId: string): Promise<User> => {
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) throw new Error("User not found");
    
    if (users[userIndex].credits <= 0) {
      throw new Error("Insufficient credits");
    }

    users[userIndex].credits -= 1;
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    return users[userIndex];
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
      code: "", // Starts empty
      messages: [],
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
