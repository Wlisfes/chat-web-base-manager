/**Naive UI 主题类型，颜色取自当前主题变量。*/
export const NAIVE_CHUNK_TYPES = ['primary', 'info', 'success', 'warning', 'error'] as const

/**自定义色板：[亮色主题颜色, 暗色主题颜色]。*/
export const CUSTOM_CHUNK_COLORS = {
    default: ['#333639', '#ffffffd1'],
    red: ['#ed4014', '#f87171'],
    volcano: ['#c2410c', '#fb923c'],
    orange: ['#ea580c', '#fdba74'],
    lime: ['#4d7c0f', '#263311'],
    green: ['#15803d', '#4ade80'],
    cyan: ['#0e7490', '#22d3ee'],
    blue: ['#1d4ed8', '#60a5fa'],
    geekblue: ['#3730a3', '#818cf8'],
    purple: ['#6b21a8', '#c084fc'],
    pink: ['#db2777', '#f9a8d4']
} as const

export type NaiveChunkType = (typeof NAIVE_CHUNK_TYPES)[number]
export type CustomChunkType = keyof typeof CUSTOM_CHUNK_COLORS
export type CommonBaseChunkType = NaiveChunkType | CustomChunkType

/**通用颜色类型，覆盖状态、分类和业务枚举等常见场景；枚举接口返回的 type 使用这里的取值。*/
export const COMMON_BASE_CHUNK_TYPES = [...NAIVE_CHUNK_TYPES, ...(Object.keys(CUSTOM_CHUNK_COLORS) as CustomChunkType[])]

/**Naive 主题类型对应的主题变量名。*/
const NAIVE_COLOR_KEYS: Record<NaiveChunkType, 'primaryColor' | 'infoColor' | 'successColor' | 'warningColor' | 'errorColor'> = {
    primary: 'primaryColor',
    info: 'infoColor',
    success: 'successColor',
    warning: 'warningColor',
    error: 'errorColor'
}

/**是否为 Naive UI 主题类型。*/
export function isNaiveChunkType(type: unknown): type is NaiveChunkType {
    return (NAIVE_CHUNK_TYPES as readonly unknown[]).includes(type)
}

/**是否为通用颜色类型。*/
export function isCommonBaseChunkType(type: unknown): type is CommonBaseChunkType {
    return (COMMON_BASE_CHUNK_TYPES as readonly unknown[]).includes(type)
}

/**按 value 匹配枚举选项；value 为空或未命中时返回 undefined。*/
export function fetchChunkOption(value: unknown, items: Array<Omix> = []): Omix | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined
    }
    return items.find(item => String(item.value) === String(value))
}

/**解析颜色类型：优先使用枚举选项的 type，无效时回退到显式传入的 type。*/
export function fetchChunkType(value: unknown, items: Array<Omix> = [], fallback: CommonBaseChunkType = 'default'): CommonBaseChunkType {
    const type = fetchChunkOption(value, items)?.type
    return isCommonBaseChunkType(type) ? type : fallback
}

/**读取颜色类型对应的实际颜色；Naive 主题类型取主题变量，自定义色板按亮暗主题取值。*/
export function fetchChunkColor(type: CommonBaseChunkType, vars: Omix, inverted: boolean): string {
    if (isNaiveChunkType(type)) {
        return vars[NAIVE_COLOR_KEYS[type]]
    }
    return CUSTOM_CHUNK_COLORS[type][inverted ? 1 : 0]
}
