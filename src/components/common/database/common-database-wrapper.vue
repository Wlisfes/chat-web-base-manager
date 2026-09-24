<script lang="tsx">
import { defineComponent, nextTick, PropType } from 'vue'
import { fetchWherer } from '@/utils'
import { PaginationInfo } from 'naive-ui'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'CommonDatabaseWrapper',
    emits: [
        'update:page',
        '-update:page',
        'update:size',
        '-update:size',
        'update:initialize',
        '-update:initialize',
        'update:loading',
        '-update:loading'
    ],
    props: {
        /**边距值**/
        limit: { type: Number, default: 12 },
        /**分页数**/
        page: { type: Number, default: 1 },
        /**分页大小**/
        size: { type: Number, default: 50 },
        /**总条数**/
        total: { type: Number, default: 0 },
        /**初始化状态**/
        initialize: { type: Boolean, default: true },
        /**加载状态**/
        loading: { type: Boolean, default: true },
        /**开启分页**/
        pagination: { type: Boolean, default: true },
        /**分页框样式**/
        paginationClass: { type: String, default: '' },
        /**开启边框**/
        bordered: { type: Boolean, default: true },
        /**分页跳转**/
        showQuickJumper: { type: Boolean, default: false },
        /**分页条数列表**/
        showSizePicker: { type: Boolean, default: true },
        /**分页条数选项**/
        pageSizes: { type: Array as PropType<Array<number>>, default: () => [20, 30, 50, 100] }
    },
    setup(props, { emit, slots }) {
        const { page, size, initialize, loading } = useVModels(props)

        /**分页page变更**/
        async function fetchUpdatePage(value: number) {
            return await nextTick(() => (page.value = value)).then(async () => {
                return await Promise.all([emit('update:page', page.value), emit('-update:page', page.value)])
            })
        }

        /**分页size变更**/
        async function fetchUpdateSize(value: number) {
            return await nextTick(() => (size.value = value)).then(async () => {
                return await Promise.all([emit('update:size', size.value), emit('-update:size', size.value)])
            })
        }

        return () => (
            <n-element
                class="common-database-wrapper flex flex-col flex-1 overflow-hidden"
                style={{ [`--common-limit-width`]: `${props.limit}px` }}
            >
                <div class="common-database-absolute flex flex-col absolute inset-0 overflow-hidden">
                    <n-card
                        class="flex flex-col flex-1 overflow-hidden"
                        content-class="flex flex-col flex-1 overflow-hidden p-0!"
                        bordered={props.bordered}
                    >
                        <div class="flex flex-col flex-1 overflow-hidden p-block-[var(--common-limit-width)]">
                            <common-base-wrapper
                                scrollbar
                                scrollbar-props={{ contentClass: 'p-inline-[var(--common-limit-width)]' }}
                                v-model:loading={loading.value}
                                v-model:initialize={initialize.value}
                            >
                                {slots.default && slots.default()}
                            </common-base-wrapper>
                        </div>
                        {props.pagination && (
                            <n-element class={`common-database-pagination flex justify-end ${props.paginationClass}`}>
                                <n-pagination
                                    page={page.value}
                                    item-count={props.total}
                                    page-size={size.value}
                                    v-model:page={page.value}
                                    page-sizes={props.pageSizes}
                                    show-size-picker={props.showSizePicker}
                                    show-quick-jumper={props.showQuickJumper}
                                    on-update:page={fetchUpdatePage}
                                    on-update:page-size={fetchUpdateSize}
                                >
                                    {{
                                        suffix: fetchWherer(props.showQuickJumper, () => <span>页</span>),
                                        goto: () => <span>前往</span>,
                                        prefix: () => <span class="whitespace-nowrap">{`共 ${props.total} 条`}</span>,
                                        label: (data: Omix<{ node: number; active: boolean }>) => (
                                            <common-base-button size="small" secondary type={data.active ? 'primary' : undefined}>
                                                {data.node}
                                            </common-base-button>
                                        ),
                                        prev: (data: Omix<PaginationInfo>) => (
                                            <common-base-button size="small" secondary disabled={data.page <= 1}>
                                                上一页
                                            </common-base-button>
                                        ),
                                        next: (data: Omix<PaginationInfo>) => (
                                            <common-base-button size="small" secondary disabled={data.page >= data.pageCount}>
                                                下一页
                                            </common-base-button>
                                        )
                                    }}
                                </n-pagination>
                            </n-element>
                        )}
                    </n-card>
                </div>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.common-database-wrapper {
    position: relative;
    .common-database-absolute {
        padding: var(--common-limit-width);
        overflow: hidden;
    }
    .n-element.common-database-pagination {
        transition: border-color 0.3s var(--n-bezier);
        padding: 0 var(--common-limit-width) var(--common-limit-width);
        overflow: hidden;
        :deep(.n-pagination > .n-pagination-item) {
            border: none;
            padding: 0;
        }
    }
}
</style>
