/**
 * @pdv-jgm/design-system
 * Official Color Tokens
 * 
 * DESIGN RULES:
 * 1. Semantic Colors (Success, Warning, Error) are STRICTLY FUNCTIONAL.
 *    - DO NOT use them for branding or decorative elements.
 * 2. Branding Colors:
 *    - Primary (#a0e261): Main brand identity. Valid on Dark.
 *    - Dark (#010502): Structural elements, text on Primary.
 *    - Background (#fffdfc): Main surface.
 * 
 * FALLBACK STRATEGY (PDV):
 * - If this package fails to load or for critical error screens where dynamic theming might fail:
 * - Use the following hardcoded hex values:
 *   - Error: #c62828
 *   - Background: #ffffff (Pure White - differs from Brand Background #fffdfc to indicate "Safe Mode" or "System Fallback")
 *   - Text: #000000
 */

export const COLORS = {
    brand: {
        primary: '#a0e261', // Green
        dark: '#010502', // Structural Dark
        background: '#fffdfc', // Off-white
    },
    semantic: {
        // DECISION: Uses a darker green (#2e7d32) than Brand Primary (#a0e261) to ensure WCAG AA contrast on light backgrounds.
        // Brand Primary is too light for text/icons on white.
        success: '#2e7d32',
        warning: '#f5b942', // Standard Warning
        error: '#c62828', // Standard Error
        disabled: '#6b6f6d', // Gray/Disabled
    },
    text: {
        onPrimary: '#010502', // Dark on Brand Green
        onBackground: '#010502', // Dark on Light Background
        onDark: '#fffdfc', // Light on Dark
    }
} as const;

export type ColorTokens = typeof COLORS;
