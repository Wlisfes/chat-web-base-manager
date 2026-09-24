<script lang="tsx">
import { computed, defineComponent, PropType, CSSProperties } from 'vue'
import { useProvider } from '@/hooks'
import { isEmpty, isString } from '@/utils'

/**Naive UI 主题类型，提取主题色后用 CSS 变量覆盖，不走 n-tag 自带 type。*/
export const NAIVE_CHUNK_TYPES = ['primary', 'info', 'success', 'warning', 'error'] as const

/**通用标签类型，覆盖状态、分类和业务枚举等常见场景。*/
export const COMMON_BASE_CHUNK_TYPES = [
    'default',
    ...NAIVE_CHUNK_TYPES,
    'red',
    'orange',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
    'pink',
    'volcano'
] as const

export type NaiveChunkType = (typeof NAIVE_CHUNK_TYPES)[number]
export type CommonBaseChunkType = (typeof COMMON_BASE_CHUNK_TYPES)[number]

const NAIVE_COLOR_KEYS: Record<NaiveChunkType, 'primaryColor' | 'infoColor' | 'successColor' | 'warningColor' | 'errorColor'> = {
    primary: 'primaryColor',
    info: 'infoColor',
    success: 'successColor',
    warning: 'warningColor',
    error: 'errorColor'
}

function isNaiveChunkType(type: string): type is NaiveChunkType {
    return (NAIVE_CHUNK_TYPES as readonly string[]).includes(type)
}

export default defineComponent({
    name: 'CommonBaseChunk',
    props: {
        /**渲染模式：标签或纯文本**/
        mode: { type: String as PropType<'chunk' | 'text'>, default: 'chunk' },
        /**是否显示边框，对应 n-tag 的 bordered**/
        bordered: { type: Boolean, default: false },
        /**显示内容**/
        value: { type: [Number, String] },
        /**value为空时显示内容**/
        empty: { type: [Number, String], default: '-' },
        /**枚举选项列表，按 value 匹配出 label 与 type**/
        items: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**颜色类型，Naive 主题色或自定义色板**/
        type: {
            type: String as PropType<CommonBaseChunkType>,
            default: 'default',
            validator: (value: string) => COMMON_BASE_CHUNK_TYPES.includes(value as CommonBaseChunkType)
        }
    },
    setup(props, { slots }) {
        const { inverted, vars } = useProvider()
        /**按 value 命中的枚举选项；items 未传或未命中时为 undefined**/
        const chunkOption = computed(() => {
            if (isEmpty(props.value)) {
                return undefined
            }
            return props.items.find(item => String(item.value) === String(props.value))
        })
        /**优先使用枚举选项的颜色类型，其次回退到显式传入的 type**/
        const chunkType = computed<CommonBaseChunkType>(() => {
            const type = chunkOption.value?.type
            if (isString(type) && COMMON_BASE_CHUNK_TYPES.includes(type as CommonBaseChunkType)) {
                return type as CommonBaseChunkType
            }
            return props.type
        })
        /**优先展示枚举选项的中文名称，其次回退到原始值**/
        const chunkLabel = computed(() => {
            if (isEmpty(props.value)) {
                return props.empty
            }
            return chunkOption.value?.label ?? props.value ?? '-'
        })
        const naiveType = computed(() => (isNaiveChunkType(chunkType.value) ? chunkType.value : undefined))
        const chunkStyle = computed<CSSProperties | undefined>(() => {
            const baseStyle = { '--n-height': '24px', '--n-font-size': '14px' }
            if (!naiveType.value) {
                return baseStyle
            }
            return {
                ...baseStyle,
                '--chunk-color': vars.value[NAIVE_COLOR_KEYS[naiveType.value]]
            } as CSSProperties
        })
        const chunkClass = computed(() => [
            'common-base-chunk',
            `is-${chunkType.value}`,
            `is-${props.mode}`,
            { 'is-dark': inverted.value, 'is-fill': true }
        ])

        return () => {
            if (['chunk'].includes(props.mode)) {
                return (
                    <n-tag class={chunkClass.value} style={chunkStyle.value} bordered={props.bordered} type="default">
                        {slots.default ? slots.default() : chunkLabel.value}
                    </n-tag>
                )
            }
            return (
                <n-text class={chunkClass.value} style={chunkStyle.value}>
                    {slots.default ? slots.default() : chunkLabel.value}
                </n-text>
            )
        }
    }
})
</script>

<style lang="scss" scoped>
$chunk-colors: (
    'default': (
        #333639,
        #ffffffd1
    ),
    'red': (
        #ed4014,
        #f87171
    ),
    'volcano': (
        #c2410c,
        #fb923c
    ),
    'orange': (
        #ea580c,
        #fdba74
    ),
    'lime': (
        #4d7c0f,
        #263311
    ),
    'green': (
        #15803d,
        #4ade80
    ),
    'cyan': (
        #0e7490,
        #22d3ee
    ),
    'blue': (
        #1d4ed8,
        #60a5fa
    ),
    'geekblue': (
        #3730a3,
        #818cf8
    ),
    'purple': (
        #6b21a8,
        #c084fc
    ),
    'pink': (
        #db2777,
        #f9a8d4
    )
);

.common-base-chunk {
    &.is-text {
        padding: 0;
        background-color: transparent;
        color: var(--chunk-color);
    }
    &.is-fill {
        --n-text-color: var(--chunk-color) !important;
        --n-color: color-mix(in srgb, var(--chunk-color) 12%, transparent) !important;
        --n-border: 1px solid color-mix(in srgb, var(--chunk-color) 30%, transparent) !important;
    }
}

@each $name, $colors in $chunk-colors {
    .common-base-chunk.is-#{$name} {
        --chunk-color: #{nth($colors, 1)};
    }
    .common-base-chunk.is-#{$name}.is-dark {
        --chunk-color: #{nth($colors, 2)};
    }
}
</style>
