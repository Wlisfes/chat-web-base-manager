<script lang="tsx">
import { defineComponent, ref, computed, nextTick, PropType, toRaw } from 'vue'
import { fetchWherer, isNotEmpty, isEmpty, isObject, isArray, fetchPlusNumber } from '@/utils'
import { DataTableColumn, PaginationInfo } from 'naive-ui'
import { useVModels, useElementSize } from '@vueuse/core'
import { useState } from '@/hooks'

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
        limit: { type: Number, default: 12 },
        /**分页数**/
        page: { type: Number, default: 1 },
        /**分页大小**/
        size: { type: Number, default: 50 },
        /**总条数**/
        total: { type: Number, default: 0 },
        /**初始化状态；为 true 时按列配置渲染骨架屏，不展示真实单元格和表单**/
        initialize: { type: Boolean, default: false },
        /**加载状态**/
        loading: { type: Boolean, default: true },
        /**开启分页**/
        pagination: { type: Boolean, default: true },
        /**分页框样式**/
        paginationClass: { type: String, default: '' },
        /**开启边框**/
        bordered: { type: Boolean, default: true },
        /**撑满父容器高度；关闭后按行内容撑开高度，用于父级没有固定高度的场景**/
        flexHeight: { type: Boolean, default: true },
        /**开启纵向虚拟滚动**/
        virtualScroll: { type: Boolean, default: false },
        /**开启横向虚拟滚动**/
        virtualScrollX: { type: Boolean, default: false },
        /**初始化骨架屏行数**/
        cols: { type: Number, default: 20 },
        /**虚拟滚动最小行高**/
        minRowHeight: { type: Number, default: 44 },
        /**骨架屏单元格高度**/
        colsRowHeight: { type: Number, default: 24 },
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
        /**分页条数选项**/
        pageSizes: { type: Array as PropType<Array<number>>, default: () => [20, 30, 50, 100] },
        /**开启复选框**/
        showSelect: { type: Boolean, default: false },
        /**开启列设置**/
        showSettings: { type: Boolean, default: false },
        /**开启操作列**/
        showCommand: { type: Boolean, default: false },
        /**开启序号显示**/
        showIndex: { type: Boolean, default: false },
        /**行样式类名**/
        rowClassName: { type: [String, Function] as PropType<string | ((data: Omix, index: number) => string)>, default: undefined }
    },
    setup(props, { emit, slots }) {
        const headerRef = ref<Omix<{ $el: HTMLElement }>>()
        const tableRef = ref<HTMLElement>()
        const { data, page, size, initialize, loading, select, customize } = useVModels(props)
        const { state } = useState({
            width: 86,
            // 提示框最大 640px，同时按视口收缩，避免内容过长时顶出屏幕；超出部分在提示框内滚动。
            TABLE_ELLIPSIS: {
                tooltip: {
                    scrollable: true,
                    style: { maxWidth: 'min(640px, 90vw)', maxHeight: 'min(640px, 45vh)', wordBreak: 'break-all' }
                }
            }
        })
        const rowKey = (e: Omix) => e.keyId
        const scrollbarProps = { size: 100, trigger: 'none' as const }
        const tableStyle = computed(() => ({
            flex: props.flexHeight ? 1 : undefined,
            '--n-opacity-loading': initialize.value ? 0 : 0.5
        }))
        /**撑满高度时参与父容器伸缩；按内容撑开时不收缩、不裁切**/
        const flexClass = computed(() => (props.flexHeight ? 'flex-1 overflow-hidden' : ''))
        const tableSize = useElementSize(tableRef)
        /**容器整数宽度，避免亚像素变化触发列重算**/
        const tableWidth = computed(() => Math.floor(tableSize.width.value))
        /**表头配置**/
        const faseColumns = computed(() => {
            return fetchColumnFlexWidth(
                fetchBaseColumns(fetchColumnsCustomize(props.columns))
                    .filter(item => item.disabled || (item.check ?? true))
                    .map(fetchColumnRender)
            )
        })
        /**最小滚动宽度**/
        const width = computed(() => {
            return faseColumns.value.reduce((a, b) => fetchPlusNumber(a, b.width ?? b.minWidth ?? 0), 0)
        })
        /**复选框选中id列表**/
        const faseSelect = computed(() => {
            return select.value.map(item => item.keyId)
        })
        /**分页条数选项；内置 size picker 无插槽，改为自行渲染以便套骨架屏**/
        const pageSizeOptions = computed(() => props.pageSizes.map(value => ({ label: `${value} / 页`, value })))
        const SKELETON_WIDTHS = ['62%', '78%', '54%', '70%', '66%']
        const skeletonRows = computed(() => Array.from({ length: Math.max(props.cols, 0) }, (_, index) => ({ keyId: index + 1 })))
        /**
         * 骨架条保持 22px。height 是单元格目标高度，先扣掉表格上下各 8px 内边距。
         * 剩余高度大于 22 时，多出的部分平分到骨架块的上下边距，这样行高才会真正变化。
         */
        function fetchSkeleton(content: string, width?: string, height = 24) {
            const block = height > 22 ? (height - 22) / 2 : undefined
            return (
                <common-skeleton-block block={block}>
                    <span class="inline-block h-22 line-height-22" style={{ width }}>
                        {content}
                    </span>
                </common-skeleton-block>
            )
        }
        const skeletonColumns = computed(() => {
            return faseColumns.value
                .filter(item => item.key !== 'settings')
                .map((item, index) => {
                    const source = props.columns.find(column => column.key === item.key)
                    const titleMap: Record<string, string> = { command: '操作', selection: '选' }
                    const title =
                        typeof source?.title === 'string' && source.title ? source.title : titleMap[String(item.key)] || '字段名称'
                    const width = source?.skeleton === 'form' ? undefined : SKELETON_WIDTHS[index % SKELETON_WIDTHS.length]
                    return {
                        key: item.key,
                        width: item.width,
                        minWidth: item.minWidth,
                        align: item.align,
                        fixed: item.fixed,
                        className: item.key === 'command' ? undefined : item.className,
                        title: () => fetchSkeleton(title),
                        render: () => fetchSkeleton(width ? title : '请选择', width, props.colsRowHeight)
                    }
                })
        })
        /**仅 minWidth 列平分剩余宽度，写入真实 width 保证不低于 minWidth**/
        function fetchColumnFlexWidth(columns: Array<Omix<DataTableColumn>>) {
            if (props.virtualScrollX) return columns
            const flexColumns = columns.filter(item => isEmpty(item.width) && isNotEmpty(item.minWidth))
            if (flexColumns.length === 0) return columns
            const minTotal = columns.reduce((total, item) => fetchPlusNumber(total, item.width ?? item.minWidth ?? 0), 0)
            // n-data-table 固定开启 bordered，左右各 1px 边框占用可视宽度，需扣除，否则内容比视口宽 2px 导致常驻横向滚动条
            const extra = Math.max(0, tableWidth.value - 2 - minTotal)
            const base = Math.floor(extra / flexColumns.length)
            const rest = extra - base * flexColumns.length
            flexColumns.forEach((item, index) => {
                item.width = fetchPlusNumber(item.minWidth, index === flexColumns.length - 1 ? base + rest : base)
            })
            return columns
        }
        /**绑定自定义列并配置原生轻量省略渲染**/
        function fetchColumnRender(base: Omix<DataTableColumn>) {
            const key = String(base.key ?? '')
            // 展开列、选择列由 naive-ui 渲染固定 40px，未声明宽度时补齐，避免弹性列宽计算漏算 40px 后出现横向溢出
            if (['selection', 'expand'].includes(String(base.type ?? '')) && isEmpty(base.width)) {
                base.width = 40
            }
            if (props.virtualScrollX && isEmpty(base.width)) {
                base.width = base.minWidth ?? 120
            }
            // 普通列默认单行省略；选择、展开、设置和操作列不参与。自定义插槽也走同一规则。
            if (!['selection', 'expand'].includes(String(base.type ?? '')) && !['settings', 'command'].includes(key)) {
                base.ellipsisComponent = base.ellipsisComponent ?? 'performant-ellipsis'
                if (isEmpty(base.ellipsis) || base.ellipsis === true) {
                    base.ellipsis = state.TABLE_ELLIPSIS
                }
            }
            /**开启序号配置**/
            if (['index'].includes(base.key) && props.showIndex) {
                base.render = (data: Omix, index: number) => index + 1
            }
            if (isNotEmpty(key) && isNotEmpty(slots[`col_${key}`])) {
                base.render = (data: Omix, index: number) => slots[`col_${key}`]?.(data, base, index) ?? <span>-</span>
            }
            return base
        }
        /**按自定义排版规则排序列**/
        function fetchColumnsCustomize(data: Array<Omix<DataTableColumn>>) {
            const source = toRaw(data)
            const rules = toRaw(customize.value)
            /**浅拷贝列配置，避免深度克隆响应式对象导致计算属性过度追踪**/
            if (rules.length === 0) {
                return source.map(item => ({ ...item }))
            }
            const columns = source.map(item => {
                const node = rules.find(c => (c.key ?? c.prop) === item.key)
                return node ? { ...item, check: node.check ?? item.check ?? true } : { ...item }
            })
            return columns.sort((a: Omix, b: Omix) => {
                const aIndex = rules.findIndex(c => (c.key ?? c.prop) === a.key)
                const bIndex = rules.findIndex(c => (c.key ?? c.prop) === b.key)
                return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
            })
        }
        /**默认操作列、设置列配置**/
        function fetchBaseColumns(data: Array<Omix<DataTableColumn>>) {
            const columns = data.slice()
            if (props.showSelect) {
                columns.unshift({ title: '选择框', key: 'selection', type: 'selection', fixed: 'left', width: 40, check: true })
            }
            if (props.showSettings && !props.showCommand) {
                columns.push({
                    key: 'settings',
                    fixed: 'right',
                    width: 40,
                    check: true,
                    render: () => null,
                    title: () => (
                        <common-database-table-settings
                            columns={props.columns}
                            v-model:customize={customize.value}
                            on-update:customize={(...args: Array<any>) => emit('-update:customize', ...args)}
                        ></common-database-table-settings>
                    )
                })
                if (props.virtualScrollX) return columns
                return columns.map((item, index) => {
                    if (index === columns.length - 2) {
                        item.colSpan = () => 2
                    }
                    return item
                })
            } else if (props.showCommand) {
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
                            {props.showSettings && (
                                <common-database-table-settings
                                    class-name="p-[var(--n-th-padding)]"
                                    columns={props.columns}
                                    v-model:customize={customize.value}
                                    on-update:customize={(...args: Array<any>) => emit('-update:customize', ...args)}
                                ></common-database-table-settings>
                            )}
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
        function fetchCellRender(value: any) {
            try {
                if (isEmpty(value)) {
                    return '-'
                }
                return isObject(value) || isArray(value) ? JSON.stringify(value) : value
            } catch (err) {
                return '-'
            }
        }

        return () => (
            <n-element
                class={`common-database-container flex flex-col ${flexClass.value}`}
                style={{ [`--common-limit-width`]: `${props.limit}px`, padding: 'var(--common-limit-width)' }}
            >
                <n-card
                    class={`flex flex-col ${flexClass.value}`}
                    content-class={`flex flex-col ${flexClass.value} p-0!`}
                    bordered={props.bordered}
                >
                    <n-element class={`common-database-table flex flex-col ${flexClass.value}`}>
                        {slots.default && (
                            <n-element ref={headerRef} class="flex flex-col line-height-22 overflow-hidden">
                                {slots.default && slots.default()}
                            </n-element>
                        )}
                        <div ref={tableRef} class={`common-database-table-container flex flex-col ${flexClass.value}`}>
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
                                flex-height={props.flexHeight}
                                size="small"
                                style={tableStyle.value}
                                row-key={rowKey}
                                row-class-name={initialize.value ? undefined : props.rowClassName}
                                loading={initialize.value ? false : loading.value}
                                min-row-height={props.virtualScroll ? props.minRowHeight : undefined}
                                scroll-x={width.value}
                                single-line={false}
                                virtual-scroll={props.virtualScroll}
                                virtual-scroll-x={props.virtualScroll && props.virtualScrollX}
                                virtual-scroll-header={props.virtualScroll && props.virtualScrollX}
                                data={initialize.value ? skeletonRows.value : data.value}
                                columns={initialize.value ? skeletonColumns.value : faseColumns.value}
                                checked-row-keys={faseSelect.value}
                                scrollbar-props={scrollbarProps}
                                render-cell={fetchCellRender}
                                on-update:checked-row-keys={fetchUpdateSelecter}
                            ></n-data-table>
                        </div>
                    </n-element>
                    {/* {props.pagination && initialize.value && (
                        <n-element class={`common-database-pagination flex justify-end items-center gap-8 ${props.paginationClass}`}>
                            {['共 0 条', '上一页', '1', '下一页', '50 / 页'].map(item => fetchSkeleton(item, undefined, 42))}
                        </n-element>
                    )} */}
                    {props.pagination && (
                        <n-element class={`common-database-pagination flex justify-end ${props.paginationClass}`}>
                            <n-pagination
                                page={page.value}
                                item-count={props.total}
                                page-size={size.value}
                                v-model:page={page.value}
                                page-sizes={props.pageSizes}
                                show-size-picker={false}
                                show-quick-jumper={props.showQuickJumper}
                                on-update:page={fetchUpdatePage}
                                on-update:page-size={fetchUpdateSize}
                            >
                                {{
                                    suffix: fetchWherer(props.showQuickJumper || props.showSizePicker, () => (
                                        <div class="flex items-center gap-8 overflow-hidden">
                                            {props.showQuickJumper && (
                                                <common-skeleton-block initialize={initialize.value}>
                                                    <span class="line-height-28">页</span>
                                                </common-skeleton-block>
                                            )}
                                            {props.showSizePicker && (
                                                <common-skeleton-block initialize={initialize.value}>
                                                    <n-select
                                                        size="small"
                                                        placeholder=""
                                                        value={size.value}
                                                        options={pageSizeOptions.value}
                                                        consistent-menu-width={false}
                                                        show-checkmark={false}
                                                        on-update:value={fetchUpdateSize}
                                                    ></n-select>
                                                </common-skeleton-block>
                                            )}
                                        </div>
                                    )),
                                    goto: () => (
                                        <common-skeleton-block initialize={initialize.value}>
                                            <span class="line-height-28">前往</span>
                                        </common-skeleton-block>
                                    ),
                                    prefix: () => (
                                        <common-skeleton-block initialize={initialize.value}>
                                            <span class="whitespace-nowrap line-height-28">{`共 ${props.total} 条`}</span>
                                        </common-skeleton-block>
                                    ),
                                    label: (data: Omix<{ node: number; active: boolean }>) => (
                                        <common-skeleton-block initialize={initialize.value}>
                                            <common-base-button size="small" secondary type={data.active ? 'primary' : undefined}>
                                                {data.node}
                                            </common-base-button>
                                        </common-skeleton-block>
                                    ),
                                    prev: (data: Omix<PaginationInfo>) => (
                                        <common-skeleton-block initialize={initialize.value}>
                                            <common-base-button size="small" secondary disabled={data.page <= 1}>
                                                上一页
                                            </common-base-button>
                                        </common-skeleton-block>
                                    ),
                                    next: (data: Omix<PaginationInfo>) => (
                                        <common-skeleton-block initialize={initialize.value}>
                                            <common-base-button size="small" secondary disabled={data.page >= data.pageCount}>
                                                下一页
                                            </common-base-button>
                                        </common-skeleton-block>
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
        :deep(.n-data-table-th.chunk-command) {
            padding: 0;
        }
        :deep(.n-data-table.n-data-table--flex-height:not(.n-data-table--single-line) .n-data-table-base-table-body) {
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
