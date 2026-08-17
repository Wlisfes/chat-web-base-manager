<script lang="tsx">
import { defineComponent, watch, PropType, Fragment } from 'vue'
import { useVModels, useCurrentElement, useElementSize } from '@vueuse/core'

export default defineComponent({
    name: 'CommonDatabaseTableVisibility',
    emits: ['update:data', 'update:width'],
    props: {
        /**列设置**/
        showSettings: { type: Boolean, default: false },
        /**自定义宽度**/
        width: { type: Number, default: 48 },
        /**表数据列表**/
        data: { type: Array as PropType<Array<Omix>>, default: () => [] }
    },
    setup(props, { emit, slots }) {
        const { data, width } = useVModels(props, emit)
        const element = useElementSize(useCurrentElement<HTMLElement>())

        watch(() => element.width.value, fetchCurrentWatcher, { immediate: true })
        function fetchCurrentWatcher() {
            if (props.showSettings) {
                return (width.value = Math.max(86, Math.max(48, element.width.value + 16)))
            }
            return (width.value = Math.max(86, element.width.value + 16))
        }

        return () => (
            <div class="absolute top-200% common-database-table-visibility" style={{ visibility: 'hidden' }}>
                {data.value.length > 0 && <Fragment>{data.value.map(item => (slots.default ? slots.default(item) : null))}</Fragment>}
            </div>
        )
    }
})
</script>
