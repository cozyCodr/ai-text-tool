/**
 * Environment variable normalizer for different React frameworks
 * Supports Next.js, Vite, Create React App, and generic setups
 */

/**
 * Get client-side environment variable across different frameworks
 * @param key - The environment variable key (without framework prefix)
 * @returns The environment variable value or undefined
 *
 * @example
 * // For OPENAI_API_KEY, will check:
 * // - NEXT_PUBLIC_OPENAI_API_KEY (Next.js)
 * // - VITE_OPENAI_API_KEY (Vite)
 * // - REACT_APP_OPENAI_API_KEY (Create React App)
 * // - OPENAI_API_KEY (fallback)
 * // - window.env.OPENAI_API_KEY (runtime config)
 * const apiKey = getClientSideEnvVar('OPENAI_API_KEY');
 */
export function getClientSideEnvVar(key: string): string | undefined {
  // Next.js convention: NEXT_PUBLIC_*
  if (process.env[`NEXT_PUBLIC_${key}`]) {
    return process.env[`NEXT_PUBLIC_${key}`];
  }

  // Vite convention: VITE_*
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[`VITE_${key}`]) {
    return (import.meta as any).env[`VITE_${key}`];
  }

  // Create React App convention: REACT_APP_*
  if (process.env[`REACT_APP_${key}`]) {
    return process.env[`REACT_APP_${key}`];
  }

  // Fallback: check if variable exists without prefix
  if (process.env[key]) {
    return process.env[key];
  }

  // Check window object for runtime config (common in some setups)
  if (typeof window !== "undefined" && (window as any).env?.[key]) {
    return (window as any).env[key];
  }

  return undefined;
}

/**
 * Get multiple environment variables at once
 * @param keys - Array of environment variable keys
 * @returns Object mapping keys to their values
 *
 * @example
 * const { OPENAI_API_KEY, API_URL } = getEnvVars(['OPENAI_API_KEY', 'API_URL']);
 */
export function getEnvVars(keys: string[]): Record<string, string | undefined> {
  return keys.reduce((acc, key) => {
    acc[key] = getClientSideEnvVar(key);
    return acc;
  }, {} as Record<string, string | undefined>);
}

/**
 * Check if an environment variable exists
 * @param key - The environment variable key
 * @returns true if the variable exists and is not empty
 */
export function hasEnvVar(key: string): boolean {
  const value = getClientSideEnvVar(key);
  return value !== undefined && value !== "";
}
