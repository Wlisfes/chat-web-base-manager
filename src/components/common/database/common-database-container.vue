<script lang="tsx">
import { defineComponent, computed, CSSProperties, Fragment } from 'vue'
import { useCurrentElement, useElementSize, useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'CommonDatabaseContainer',
    emits: ['update:initialize', 'update:loading'],
    props: {
        /**初始化**/
        initialize: { type: Boolean, default: true },
        /**是否为表格嵌入容器**/
        elementTable: { type: Boolean, default: true },
        /**loading状态**/
        loading: { type: Boolean, default: true }
    },
    setup(props, { emit, slots }) {
        const { loading, initialize } = useVModels(props, emit)
        const { width, height } = useElementSize(useCurrentElement())
        const element = computed<CSSProperties>(() => ({
            '--common-database-opacity': initialize.value ? 0 : 0.2,
            '--common-database-element-width': Math.floor(width.value) + 'px',
            '--common-database-element-height': Math.floor(height.value) + 'px'
        }))

        return () => (
            <div
                class="common-database-container flex flex-col flex-1 overflow-hidden bg-transition bg-[var(--table-color)]"
                style={element.value}
            >
                {props.elementTable ? (
                    <Fragment>{slots.default && slots.default({ width, height })}</Fragment>
                ) : (
                    <n-spin size={54} show={loading.value}>
                        {slots.default && slots.default({ width, height })}
                    </n-spin>
                )}
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.common-database-container {
    --n-opacity-spinning: var(--common-database-opacity);
    position: relative;
    :deep(.n-spin-container),
    :deep(.n-spin-content) {
        display: flex;
        flex-direction: column;
        flex: 1;
    }
    :deep(.n-data-table.common-database-table) {
        --n-loading-size: 54px;
        --n-opacity-loading: var(--n-opacity-spinning);
        width: var(--common-database-element-width);
        height: var(--common-database-element-height);
    }
}
</style>
