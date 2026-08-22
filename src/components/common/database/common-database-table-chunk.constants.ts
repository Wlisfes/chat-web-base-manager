import type { TagProps } from 'naive-ui'

export const COMMON_DATABASE_TAG_COLOR_NAMES = [
    'slate',
    'gray',
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
    'brown'
] as const

export type CommonDatabaseTagColor = (typeof COMMON_DATABASE_TAG_COLOR_NAMES)[number]

type CommonDatabaseTagPalette = {
    rgb: string
    lightText: string
    darkText: string
}

export const COMMON_DATABASE_TAG_PALETTES: Record<CommonDatabaseTagColor, CommonDatabaseTagPalette> = {
    slate: { rgb: '100, 116, 139', lightText: '#334155', darkText: '#e2e8f0' },
    gray: { rgb: '107, 114, 128', lightText: '#374151', darkText: '#e5e7eb' },
    red: { rgb: '239, 68, 68', lightText: '#b91c1c', darkText: '#fecaca' },
    orange: { rgb: '249, 115, 22', lightText: '#c2410c', darkText: '#fed7aa' },
    amber: { rgb: '245, 158, 11', lightText: '#b45309', darkText: '#fde68a' },
    yellow: { rgb: '234, 179, 8', lightText: '#a16207', darkText: '#fef08a' },
    lime: { rgb: '132, 204, 22', lightText: '#4d7c0f', darkText: '#d9f99d' },
    green: { rgb: '34, 197, 94', lightText: '#15803d', darkText: '#bbf7d0' },
    emerald: { rgb: '16, 185, 129', lightText: '#047857', darkText: '#a7f3d0' },
    teal: { rgb: '20, 184, 166', lightText: '#0f766e', darkText: '#99f6e4' },
    cyan: { rgb: '6, 182, 212', lightText: '#0e7490', darkText: '#a5f3fc' },
    sky: { rgb: '14, 165, 233', lightText: '#0369a1', darkText: '#bae6fd' },
    blue: { rgb: '59, 130, 246', lightText: '#1d4ed8', darkText: '#bfdbfe' },
    indigo: { rgb: '99, 102, 241', lightText: '#4338ca', darkText: '#c7d2fe' },
    violet: { rgb: '139, 92, 246', lightText: '#6d28d9', darkText: '#ddd6fe' },
    purple: { rgb: '168, 85, 247', lightText: '#7e22ce', darkText: '#e9d5ff' },
    fuchsia: { rgb: '217, 70, 239', lightText: '#a21caf', darkText: '#f5d0fe' },
    pink: { rgb: '236, 72, 153', lightText: '#be185d', darkText: '#fbcfe8' },
    rose: { rgb: '244, 63, 94', lightText: '#be123c', darkText: '#fecdd3' },
    brown: { rgb: '180, 83, 9', lightText: '#92400e', darkText: '#fed7aa' }
}

export function createCommonDatabaseTagColor(color: CommonDatabaseTagColor, dark: boolean): NonNullable<TagProps['color']> {
    const palette = COMMON_DATABASE_TAG_PALETTES[color]
    return {
        color: `rgba(${palette.rgb}, ${dark ? 0.2 : 0.1})`,
        borderColor: `rgba(${palette.rgb}, ${dark ? 0.52 : 0.34})`,
        textColor: dark ? palette.darkText : palette.lightText
    }
}
