<script lang="tsx">
import { defineComponent, ref, computed, nextTick, PropType } from 'vue'
import { fetchWherer, isNotEmpty, isEmpty, isObject, isArray, fetchPlusNumber } from '@/utils'
import { DataTableColumn, PaginationInfo } from 'naive-ui'
import { useVModels } from '@vueuse/core'
import { useState } from '@/hooks'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
    name: 'CommonDatabaseTable',
    emits: [
        'update:page',
        '-update:page',
        'update:size',
        '-update:size',
        'update:initialize',
        '-update:initialize',
        'update:loading',
        '-update:loading',
        'update:data',
        '-update:data',
        'update:select',
        '-update:select',
        'update:customize',
        '-update:customize'
    ],
    props: {
        /**边距值**/
        limit: { type: Number, default: 14 },
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
        /**被选中的行的对象列表**/
        select: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**表头配置自定义排版规则**/
        customize: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**表数据列表**/
        data: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**表头配置**/
        columns: { type: Array as PropType<Array<Omix<DataTableColumn>>>, default: () => [] },
        /**分页跳转**/
        showQuickJumper: { type: Boolean, default: false },
        /**分页条数列表**/
        showSizePicker: { type: Boolean, default: true },
        /**开启复选框**/
        showSelect: { type: Boolean, default: false },
        /**开启列设置**/
        showSettings: { type: Boolean, default: false },
        /**开启操作列**/
        showCommand: { type: Boolean, default: false }
    },
    setup(props, { emit, slots }) {
        const headerRef = ref<Omix<{ $el: HTMLElement }>>()
        const tableRef = ref<HTMLElement>()
        const { data, page, size, initialize, loading, select, customize } = useVModels(props)
        const { state } = useState({ width: 86 })
        /**最小滚动宽度**/
        const width = computed(() => {
            return fetchBaseColumns(props.columns).reduce((a, b) => fetchPlusNumber(a, b.width ?? b.minWidth ?? 0), 0)
        })
        /**复选框选中id列表**/
        const faseSelect = computed(() => {
            return select.value.map(item => item.keyId)
        })
        /**表头配置**/
        const faseColumns = computed(() => {
            return fetchBaseColumns(fetchColumnsCustomize(props.columns)).filter(item => item.disabled || (item.check ?? true))
        })
        /**按自定义排版规则排序列**/
        function fetchColumnsCustomize(data: Array<Omix<DataTableColumn>>) {
            if (customize.value.length === 0) return data
            const columns = cloneDeep(data).map(item => {
                const node = customize.value.find(c => (c.key ?? c.prop) === item.key)
                if (node) item.check = node.check ?? item.check ?? true
                return item
            })
            return columns.sort((a, b) => {
                const aIndex = customize.value.findIndex(c => (c.key ?? c.prop) === a.key)
                const bIndex = customize.value.findIndex(c => (c.key ?? c.prop) === b.key)
                return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
            })
        }
        /**默认操作列、设置列配置**/
        function fetchBaseColumns(data: Array<Omix<DataTableColumn>>) {
            const columns = cloneDeep(data)
            if (props.showSelect) {
                columns.unshift({ title: '选择框', key: 'selection', type: 'selection', fixed: 'left', width: 40, check: true })
            }
            if (props.showSettings && !props.showCommand) {
                columns.push({
                    key: 'settings',
                    fixed: 'right',
                    width: 40,
                    check: true,
                    title: () => (
                        <common-database-table-settings
                            columns={props.columns}
                            v-model:customize={customize.value}
                            on-update:customize={(...args: Array<any>) => emit('-update:customize', ...args)}
                        ></common-database-table-settings>
                    )
                })
                return columns.map((item, index) => {
                    if (index === columns.length - 2) {
                        item.colSpan = () => 2
                    }
                    return item
                })
            } else if (props.showSettings && props.showCommand) {
                columns.push({
                    key: 'command',
                    fixed: 'right',
                    check: true,
                    width: Math.max(48, state.width),
                    className: 'chunk-command',
                    title: () => (
                        <div class="common-database-table-command flex items-center overflow-hidden">
                            <div class="flex-1 p-[var(--n-th-padding)] overflow-hidden">
                                <n-ellipsis tooltip={false}>操作</n-ellipsis>
                            </div>
                            <common-database-table-settings
                                class="p-[var(--n-th-padding)]"
                                columns={props.columns}
                                v-model:customize={customize.value}
                                on-update:customize={(...args: Array<any>) => emit('-update:customize', ...args)}
                            ></common-database-table-settings>
                        </div>
                    )
                })
            }
            return columns
        }
        /**选择列事件**/
        async function fetchUpdateSelecter(keys: Array<string>, data: Array<Omix>) {
            return await nextTick(() => (select.value = data)).then(async () => {
                await emit('update:select', select.value)
                return await emit('-update:select', select.value)
            })
        }
        /**分页page变更**/
        async function fetchUpdatePage(value: number) {
            return await nextTick(() => (page.value = value)).then(async () => {
                await emit('update:page', page.value)
                return await emit('-update:page', page.value)
            })
        }
        /**分页size变更**/
        async function fetchUpdateSize(value: number) {
            return await nextTick(() => (size.value = value)).then(async () => {
                await emit('update:size', size.value)
                return await emit('-update:size', size.value)
            })
        }
        /**节点渲染**/
        function fetchCellRender(value: any, data: Omix, base: Omix<DataTableColumn>) {
            if (isNotEmpty(base.key) && isNotEmpty(slots[`col_${base.key}`])) {
                return slots[`col_${base.key}`]?.(data, base) ?? <span>-</span>
            } else if (isEmpty(value)) {
                return <span>-</span>
            }
            try {
                if (['performant-ellipsis'].includes(base.ellipsisComponent ?? 'ellipsis')) {
                    return (
                        <n-performant-ellipsis tooltip={{ scrollable: true, style: { maxWidth: '640px', maxHeight: '640px' } }}>
                            {isObject(value) || isArray(value) ? JSON.stringify(value) : value}
                        </n-performant-ellipsis>
                    )
                }
                return (
                    <n-ellipsis tooltip={{ scrollable: true, style: { maxWidth: '640px', maxHeight: '640px' } }}>
                        {isObject(value) || isArray(value) ? JSON.stringify(value) : value}
                    </n-ellipsis>
                )
            } catch (err) {
                return <span>-</span>
            }
        }

        return () => (
            <n-element
                class="common-database-container flex flex-col flex-1 overflow-hidden"
                style={{ [`--common-limit-width`]: `${props.limit}px`, padding: 'var(--common-limit-width)' }}
            >
                <n-card
                    class="flex flex-col flex-1 overflow-hidden"
                    content-class="flex flex-col flex-1 overflow-hidden p-0!"
                    bordered={props.bordered}
                >
                    <n-element class="common-database-table flex flex-col flex-1 overflow-hidden">
                        {slots.default && (
                            <n-element ref={headerRef} class="flex flex-col line-height-22 overflow-hidden">
                                {slots.default && slots.default()}
                            </n-element>
                        )}
                        <div ref={tableRef} class="common-database-table-container flex flex-col flex-1 overflow-hidden">
                            {props.showCommand && data.value.length > 0 && (
                                <common-database-table-visibility
                                    show-settings={props.showSettings}
                                    v-model:data={data.value}
                                    v-model:width={state.width}
                                >
                                    {{ default: slots.col_command }}
                                </common-database-table-visibility>
                            )}
                            <n-data-table
                                remote
                                bordered
                                flex-height
                                size="small"
                                style={{ flex: 1, '--n-opacity-loading': initialize.value ? 0 : 0.5 }}
                                row-key={(e: Omix) => e.keyId}
                                loading={loading.value}
                                scroll-x={width.value}
                                single-line={false}
                                data={data.value}
                                columns={faseColumns.value}
                                checked-row-keys={faseSelect.value}
                                scrollbar-props={{ size: 100, trigger: 'none' }}
                                render-cell={fetchCellRender}
                                on-update:checked-row-keys={fetchUpdateSelecter}
                            ></n-data-table>
                        </div>
                    </n-element>
                    {props.pagination && (
                        <n-element class={`common-database-pagination flex justify-end ${props.paginationClass}`}>
                            <n-pagination
                                page={page.value}
                                item-count={props.total}
                                page-size={size.value}
                                v-model:page={page.value}
                                page-sizes={[20, 30, 50, 100, 200, 300]}
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
                                        <common-element-button size="small" secondary type={data.active ? 'primary' : undefined}>
                                            {data.node}
                                        </common-element-button>
                                    ),
                                    prev: (data: Omix<PaginationInfo>) => (
                                        <common-element-button size="small" secondary disabled={data.page <= 1}>
                                            上一页
                                        </common-element-button>
                                    ),
                                    next: (data: Omix<PaginationInfo>) => (
                                        <common-element-button size="small" secondary disabled={data.page >= data.pageCount}>
                                            下一页
                                        </common-element-button>
                                    )
                                }}
                            </n-pagination>
                        </n-element>
                    )}
                </n-card>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.common-database-container {
    position: relative;
    padding: var(--common-limit-width);
    .n-element.common-database-table {
        padding: var(--common-limit-width);
        overflow: hidden;
        :deep(.n-data-table-loading-wrapper) {
            font-size: 48px;
        }
        :deep(.n-data-table-td):has(.n-data-table-expand-trigger) {
            display: flex;
            align-items: center;
        }
        :deep(.n-data-table-th.chunk-command) {
            padding: 0;
        }
        :deep(.n-data-table:not(.n-data-table--single-line) .n-data-table-base-table-body) {
            .n-scrollbar-container:has(~ .n-scrollbar-rail.n-scrollbar-rail--vertical--right.n-scrollbar-rail--disabled) {
                .n-data-table-tbody > tr:last-child > td {
                    border-bottom: 1px solid var(--n-merged-border-color);
                }
            }
        }
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
