import { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { getRandomId, getRandomInt } from '@lib/random';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { ReactNode } from 'react';
import type { User as AuthUser } from 'firebase/auth';
import type { WithFieldValue } from 'firebase/firestore';
import type { User } from '@lib/types/user';
import type { Bookmark } from '@lib/types/bookmark';
import type { Stats } from '@lib/types/stats';

type AuthContext = {
  user: User | null;
  error: Error | null;
  loading: boolean;
  isAdmin: boolean;
  randomSeed: string;
  userBookmarks: Bookmark[] | null;
  signOut: () => Promise<void>;
  connectWallet: () => Promise<void>;
};

export const AuthContext = createContext<AuthContext | null>(null);

type AuthContextProviderProps = {
  children: ReactNode;
};

export function AuthContextProvider({
  children
}: AuthContextProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<Bookmark[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const { publicKey, connect, disconnect } = useWallet();

  const connectWallet = async (): Promise<void> => {
    try {
      await connect();
      const walletAddress = publicKey?.toBase58();
      console.log('Connected wallet:', walletAddress);
    } catch (error) {
      setError(error as Error);
    }
  };

  const disconnectWallet = async (): Promise<void> => {
    try {
      await disconnect();
      console.log('Wallet disconnected');
    } catch (error) {
      setError(error as Error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      setUser({
        id: publicKey.toBase58(),
        username: publicKey.toBase58().slice(0, 10), // Temporary username
        photoURL: '/assets/twitter-avatar.jpg'
      });
    }
  }, [publicKey]);

  useEffect(() => {
    if (!user) return;

    const { id } = user;

    const unsubscribeUser = onSnapshot(doc(usersCollection, id), (doc) => {
      setUser(doc.data() as User);
    });

    const unsubscribeBookmarks = onSnapshot(
      userBookmarksCollection(id),
      (snapshot) => {
        const bookmarks = snapshot.docs.map((doc) => doc.data());
        setUserBookmarks(bookmarks);
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeBookmarks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isAdmin = user ? user.username === 'ccrsxx' : false;
  const randomSeed = useMemo(getRandomId, [user?.id]);

  const value: AuthContext = {
    user,
    error,
    loading,
    isAdmin,
    randomSeed,
    userBookmarks,
    signOut: disconnectWallet, // Replaced signOut with disconnectWallet
    connectWallet // Replaced signInWithGoogle with connectWallet
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContext {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error('useAuth must be used within an AuthContextProvider');

  return context;
}
