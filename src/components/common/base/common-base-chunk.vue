<script lang="tsx">
import { computed, defineComponent, PropType, CSSProperties } from 'vue'
import { isEmpty, isCommonBaseChunkType, fetchChunkOption, fetchChunkType, fetchChunkColor, CommonBaseChunkType } from '@/utils'
import { useProvider } from '@/hooks'

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
            validator: (value: string) => isCommonBaseChunkType(value)
        }
    },
    setup(props, { slots }) {
        const { inverted, vars } = useProvider()
        /**优先使用枚举选项的颜色类型，其次回退到显式传入的 type**/
        const chunkType = computed(() => fetchChunkType(props.value, props.items, props.type))
        /**优先展示枚举选项的中文名称，其次回退到原始值**/
        const chunkLabel = computed(() => {
            if (isEmpty(props.value)) {
                return props.empty
            }
            return fetchChunkOption(props.value, props.items)?.label ?? props.value ?? '-'
        })
        const chunkStyle = computed<CSSProperties>(() => {
            return {
                '--n-height': '24px',
                '--n-font-size': '14px',
                '--chunk-color': fetchChunkColor(chunkType.value, vars.value, inverted.value)
            } as CSSProperties
        })
        const chunkClass = computed(() => ['common-base-chunk', `is-${chunkType.value}`, `is-${props.mode}`])

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
.common-base-chunk {
    &.is-text {
        padding: 0;
        background-color: transparent;
        color: var(--chunk-color);
    }
    &.is-chunk {
        --n-text-color: var(--chunk-color) !important;
        --n-color: color-mix(in srgb, var(--chunk-color) 12%, transparent) !important;
        --n-border: 1px solid color-mix(in srgb, var(--chunk-color) 30%, transparent) !important;
    }
}
</style>
