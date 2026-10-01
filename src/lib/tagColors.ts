export const PRESET_TAG_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#64748B', // Slate
];

export interface TagStyle {
    bg: string;
    border: string;
    text: string;
    dot: string;
}

/**
 * Generates modern pastel tint, border, dot, and readable text colors
 * for a tag to look sleek on both light and dark backgrounds.
 */
export function getTagColorStyles(hexColor: string = '#3B82F6'): TagStyle {
    const cleanHex = hexColor.replace('#', '');
    const fullHex = cleanHex.length === 3
        ? cleanHex.split('').map(c => c + c).join('')
        : cleanHex;

    const r = parseInt(fullHex.substring(0, 2), 16) || 59;
    const g = parseInt(fullHex.substring(2, 4), 16) || 130;
    const b = parseInt(fullHex.substring(4, 6), 16) || 246;

    // Darkened text for light mode (WCAG AA compliant contrast)
    const darken = (val: number) => Math.max(0, Math.floor(val * 0.62));
    const textColor = `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;

    return {
        bg: `rgba(${r}, ${g}, ${b}, 0.12)`,
        border: `rgba(${r}, ${g}, ${b}, 0.28)`,
        text: textColor,
        dot: `rgb(${r}, ${g}, ${b})`,
    };
}
