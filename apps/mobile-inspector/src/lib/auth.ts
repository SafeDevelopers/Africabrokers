import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@afribrok_inspector_auth';
const DISCOVERY_URL = process.env.EXPO_PUBLIC_KEYCLOAK_DISCOVERY || 
                     'https://keycloak.example.com/auth/realms/afribrok/.well-known/openid-configuration';

export interface AuthUser {
  id: string;
  role: 'inspector' | 'regulator' | 'admin';
  tenantId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

/**
 * Initialize Keycloak OIDC authentication
 */
export async function initializeAuth(): Promise<AuthUser | null> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const auth: AuthUser = JSON.parse(stored);
      
      // Check if token is expired
      if (auth.expiresAt && Date.now() < auth.expiresAt) {
        return auth;
      }
      
      // Try to refresh token if expired
      if (auth.refreshToken) {
        try {
          const refreshed = await refreshAccessToken(auth.refreshToken);
          if (refreshed) {
            return refreshed;
          }
        } catch (e) {
          // Refresh failed, clear auth
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    return null;
  }
}

/**
 * Sign in with Keycloak OIDC
 */
export async function signIn(): Promise<AuthUser> {
  try {
    // Generate code verifier for PKCE
    const codeVerifier = await Crypto.randomUUID();
    
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'afribrokinspector',
      path: 'auth/callback',
    });

    const discovery = await AuthSession.fetchDiscoveryAsync(DISCOVERY_URL);
    
    // Generate code challenge from verifier
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
    );
    
    const request = new AuthSession.AuthRequest({
      clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'mobile-inspector',
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      codeChallenge,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      usePKCE: true,
    });

    const result = await request.promptAsync(discovery);

    if (result.type === 'success') {
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'mobile-inspector',
          code: result.params.code,
          extraParams: {},
          redirectUri,
        },
        discovery,
      );

      // Get user info
      const userInfo = await fetch(`${discovery.userinfoEndpoint}`, {
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
        },
      }).then(res => res.json());

      const auth: AuthUser = {
        id: userInfo.sub,
        role: userInfo.roles?.includes('inspector') ? 'inspector' : 
              userInfo.roles?.includes('regulator') ? 'regulator' : 'admin',
        tenantId: userInfo.tenantId || 'ethiopia-addis',
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken,
        expiresAt: Date.now() + (tokenResult.expiresIn * 1000),
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      return auth;
    } else {
      throw new Error('Authentication cancelled or failed');
    }
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthUser | null> {
  try {
    const discovery = await AuthSession.fetchDiscoveryAsync(DISCOVERY_URL);
    
    const response = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'mobile-inspector',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const tokenResult = await response.json();

    // Get current auth to preserve user info
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const currentAuth: AuthUser = JSON.parse(stored);

    const auth: AuthUser = {
      ...currentAuth,
      accessToken: tokenResult.access_token,
      refreshToken: tokenResult.refresh_token || currentAuth.refreshToken,
      expiresAt: Date.now() + (tokenResult.expires_in * 1000),
    };

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    return auth;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Get current auth user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return initializeAuth();
}

