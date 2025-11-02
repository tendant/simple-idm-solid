/**
 * Theme configuration types
 */

export interface ThemeConfig {
  colors?: {
    primary?: string;
    error?: string;
    success?: string;
    warning?: string;
  };
  radius?: 'square' | 'rounded' | 'pill';
  spacing?: 'compact' | 'comfortable' | 'spacious';
}

export interface ThemeColors {
  primary: string;
  error: string;
  success: string;
  warning: string;
}
