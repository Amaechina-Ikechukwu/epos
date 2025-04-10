export type User = {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
};

export type LoginContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
};
