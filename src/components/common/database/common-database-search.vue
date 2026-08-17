<script lang="tsx">
import { defineComponent, ref, computed, nextTick, Fragment, PropType, CSSProperties } from 'vue'
import { useVModels, useCurrentElement, useElementSize } from '@vueuse/core'
import { Search, DownToBottom, UpToTop } from '@vicons/carbon'
import { fetchWherer, isObject } from '@/utils'
import { FormInst } from 'naive-ui'

export default defineComponent({
    name: 'CommonDatabaseSearch',
    emits: [
        'update:when',
        '-update:when',
        'update:database',
        '-update:database',
        'update:loading',
        '-update:loading',
        'update:formState',
        '-update:formState',
        '-submit',
        '-restore'
    ],
    props: {
        /**操作功能**/
        function: { type: Array as PropType<Array<'search' | 'restore' | 'collapse' | 'deploy' | 'abstract'>>, default: () => [] },
        /**操作功能根节点样式**/
        functionClass: { type: String, default: '' },
        /**移除对边圆角**/
        square: { type: Array as PropType<Array<'l-t' | 'l-b' | 'r-t' | 'r-b'>>, default: () => [] },
        /**收缩最小显示行**/
        line: { type: Number, default: 0 },
        /**边距值**/
        limit: { type: Number, default: 14 },
        /**折叠收缩配置**/
        when: { type: Boolean, default: true },
        /**开启边框**/
        bordered: { type: Boolean, default: true },
        /**开启边框**/
        loading: { type: Boolean, default: false },
        /**表单对象**/
        formState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**文案描述宽度**/
        labelWidth: { type: Number, default: 80 },
        /**搜索栏字段自定义排版规则**/
        database: { type: Array as PropType<Array<Omix>>, default: () => [] }
    },
    setup(props, { emit, expose, slots }) {
        const element = useCurrentElement<HTMLElement>()
        const formOptions = ref<Omix>({})
        const formRef = ref({} as Omix<FormInst>)
        const { width } = useElementSize(element)
        const { when, loading, formState, database } = useVModels(props, emit)
        /**最小折叠高度**/
        const height = computed(() => fetchWherer(Boolean(props.line), 10 + 32 * props.line + (props.line - 1) * 10, 0))
        /**表单样式**/
        const formClass = computed(() => ({
            'common-database-formstate': true,
            'p-be-12': when.value || (database.value.length > 0 && database.value.some(item => item.check)),
            'formstate-collapse': width.value < 674
        }))
        /**圆角样式**/
        const cardStyle = computed<CSSProperties>(() => {
            const leftTopRadius = props.square.includes('l-t') ? '0px' : 'var(--n-border-radius)'
            const leftBottomRadius = props.square.includes('l-b') ? '0px' : 'var(--n-border-radius)'
            const rightTopRadius = props.square.includes('r-t') ? '0px' : 'var(--n-border-radius)'
            const rightBottomRadius = props.square.includes('r-b') ? '0px' : 'var(--n-border-radius)'
            return {
                borderRadius: `${leftTopRadius} ${rightTopRadius} ${rightBottomRadius} ${leftBottomRadius}`
            }
        })
        /**展开、收起**/
        async function fetchClickUpdate() {
            return await nextTick(() => (when.value = !when.value))
        }
        /**节点判断过滤**/
        function fetchColumnCheck(vnode: Array<Omix>, names: Array<string>) {
            return vnode.filter(node => {
                return isObject<Omix>(node.type) ? names.includes(node.type.name) : false
            })
        }
        /**表单字段节点判断过滤**/
        function fetchColumnCheckForms<T extends Omix>(vnode: Array<T>): Array<T> {
            const columns = vnode.map(node => {
                node.props.database = database.value
                return node
            })
            return columns.sort((a, b) => {
                const aIndex = database.value.findIndex(item => item.prop === (a.prop ?? a.props.prop))
                const bIndex = database.value.findIndex(item => item.prop === (b.prop ?? b.props.prop))
                return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
            })
        }
        /**操作功能节点判断过滤**/
        function fetchColumnCheckFunctions<T extends Omix>(vnode: Array<T>): Array<T> {
            if (isObject<Omix>(vnode[0]?.props) && vnode[0]?.props.abstract) {
                return (vnode[0]?.children?.default?.() ?? []).flat(1).map((node: Omix) => {
                    return node
                })
            }
            return vnode
        }
        /**子节点分类**/
        function fetchColumnTransaction(vnode: Array<Omix>) {
            return {
                vnode,
                columns: fetchColumnCheckForms(fetchColumnCheck(vnode, ['CommonDatabaseSearchColumn'])),
                functions: fetchColumnCheckFunctions(fetchColumnCheck(vnode, ['CommonDatabaseSearchFunction']))
            }
        }

        /**导出配置**/
        expose(formOptions.value)

        return () => {
            const { columns, functions } = fetchColumnTransaction((slots.default?.() ?? []) as Array<Omix>)

            return (
                <div class="common-database-search flex flex-col overflow-hidden" style={{ [`--common-limit-width`]: `${props.limit}px` }}>
                    <n-card
                        class="flex flex-col overflow-hidden"
                        style={cardStyle.value}
                        content-style={{ padding: `var(--common-limit-width)` }}
                        bordered={props.bordered}
                    >
                        {columns.length > 0 && (
                            <common-element-collapse base-height={height.value} v-model:when={when.value}>
                                <form-common-container
                                    ref={formRef}
                                    class={formClass.value}
                                    label-placement="left"
                                    model={formState.value}
                                    label-width={props.labelWidth}
                                >
                                    <Fragment>{columns}</Fragment>
                                </form-common-container>
                            </common-element-collapse>
                        )}
                        {props.function.length + functions.length > 0 && (
                            <n-element class={`flex flex-wrap gap-10 ${props.functionClass}`}>
                                {functions.length > 0 && (
                                    <Fragment>
                                        {functions}
                                        {props.function.includes('abstract') && (
                                            <n-divider vertical class="h-[var(--height-medium)]! m-0!" />
                                        )}
                                    </Fragment>
                                )}
                                {props.function.includes('search') && (
                                    <common-element-button
                                        class="min-w-80"
                                        type="primary"
                                        secondary
                                        icon={Search}
                                        loading={loading.value}
                                        disabled={loading.value}
                                        onClick={(e: MouseEvent) => emit('-submit', formState.value)}
                                    >
                                        查询
                                    </common-element-button>
                                )}
                                {props.function.includes('restore') && columns.length > 0 && (
                                    <common-element-button class="min-w-80" onClick={() => emit('-restore')}>
                                        重置
                                    </common-element-button>
                                )}
                                {props.function.includes('collapse') && columns.length > 0 && (
                                    <common-element-button
                                        class="min-w-80"
                                        icon={when.value ? UpToTop : DownToBottom}
                                        onClick={fetchClickUpdate}
                                    >
                                        {when.value ? '收起' : '展开'}
                                    </common-element-button>
                                )}
                                {props.function.includes('deploy') && columns.length > 0 && (
                                    <common-database-search-settings
                                        columns={columns}
                                        v-model:database={database.value}
                                        on-update:database={(...args: Array<any>) => emit('-update:database', ...args)}
                                    ></common-database-search-settings>
                                )}
                            </n-element>
                        )}
                    </n-card>
                </div>
            )
        }
    }
})
</script>

<style lang="scss" scoped>
.common-database-search {
    position: relative;
    padding-inline-start: var(--common-limit-width);
    padding-inline-end: var(--common-limit-width);
    padding-block-start: var(--common-limit-width);
}
.common-database-formstate {
    gap: 10px;
    display: grid;
    grid-auto-flow: row dense;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    &.formstate-collapse :deep(.common-database-search-column.grid-col-span-2) {
        grid-column: span 1 / span 1 !important;
    }
}
</style>
