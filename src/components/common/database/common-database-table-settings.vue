<script lang="tsx">
import { defineComponent, computed, nextTick, onBeforeMount, PropType } from 'vue'
import { stop, fetchDelay, fetchHandler } from '@/utils'
import { useVModels } from '@vueuse/core'
import { Grid } from '@vicons/carbon'
import { useState } from '@/hooks'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
    name: 'CommonDatabaseTableSettings',
    emits: ['update:customize', '-update:customize'],
    props: {
        /**列数据**/
        columns: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**表头配置自定义排版规则**/
        customize: { type: Array as PropType<Array<Omix>>, default: () => [] }
    },
    setup(props, { emit }) {
        const { customize } = useVModels(props, emit)
        const { state, setState } = useState({ visible: false, checked: true, click: false, columns: [] as Array<Omix> })
        /**是否全选**/
        const checkedAll = computed(() => state.columns.every(item => item.check))
        /**是否半选**/
        const indeterminate = computed(() => {
            return state.columns.every(item => item.check) ? false : state.columns.some(item => item.check)
        })
        /**初始化**/
        onBeforeMount(fetchInitialize)
        async function fetchInitialize() {
            const allColumns = (props.columns ?? []).map(item => ({
                key: item.key,
                prop: item.key,
                title: typeof item.title === 'function' ? item.key : item.title,
                disabled: item.disabled ?? false,
                check: item.disabled ? true : (item.check ?? true)
            }))
            let columns: Array<Omix> = []
            if (customize.value.length > 0) {
                /**保留已有排序顺序并合并新字段**/
                const mapped = customize.value.map(db => {
                    const dbKey = db.key ?? db.prop
                    const col = allColumns.find(c => c.key === dbKey)
                    return col ? { ...col, check: col.disabled ? true : (db.check ?? col.check) } : null
                })
                const ordered = mapped.filter(Boolean) as Array<Omix>
                const newCols = allColumns.filter(c => !customize.value.find(db => (db.key ?? db.prop) === c.key))
                columns = [...ordered, ...newCols]
            } else {
                columns = allColumns
            }
            return await setState({ columns: cloneDeep(columns) }).then(() => {
                return (customize.value = state.columns)
            })
        }
        /**全选状态变更**/
        async function fetchUpdate(checked: boolean) {
            return await setState({ checked }).then(async () => {
                const columns = state.columns.map(item => ({ ...item, check: item.disabled ? true : checked }))
                return await setState({ columns }).then(fetchSyncCustomize)
            })
        }
        /**字段状态变更**/
        async function fetchChnage(checked: boolean, node: Omix) {
            return await nextTick(() => (node.check = checked)).then(async () => {
                return await setState({ checked: checkedAll.value }).then(fetchSyncCustomize)
            })
        }
        /**实时同步排版规则到父组件**/
        async function fetchSyncCustomize() {
            return await nextTick(() => (customize.value = cloneDeep(state.columns)))
        }
        /**重置排版规则**/
        async function fetchReset() {
            const columns = (props.columns ?? []).map(item => ({
                key: item.key,
                prop: item.key,
                title: typeof item.title === 'function' ? item.key : item.title,
                disabled: item.disabled ?? false,
                check: true
            }))
            return await setState({ columns: cloneDeep(columns), checked: true }).then(fetchSyncCustomize)
        }
        /**拖动排序变更后实时生效**/
        async function fetchDragUpdate() {
            return await fetchSyncCustomize()
        }
        /**异步关闭设置组件**/
        async function fetchClickoutside() {
            return await setState({ visible: false, click: true }).then(async () => {
                await nextTick(() => (customize.value = cloneDeep(state.columns)))
                return await fetchDelay(0).then(async () => {
                    return await setState({ click: false }).then(() => {
                        return emit('-update:customize', customize.value)
                    })
                })
            })
        }
        /**开启设置组件**/
        async function fetchState(event: MouseEvent) {
            return await stop(event).then(async () => {
                return await fetchHandler(!state.visible && !state.click, async () => {
                    await fetchInitialize()
                    return await setState({ visible: true, checked: checkedAll.value })
                })
            })
        }

        return () => {
            return (
                <common-element-popover
                    placement="bottom-end"
                    style={{ padding: '0px' }}
                    v-model:visible={state.visible}
                    on-clickoutside={fetchClickoutside}
                >
                    {{
                        trigger: () => (
                            <div class="common-database-table-settings flex items-center justify-center">
                                <common-element-button
                                    style={{ '--n-icon-size': '22px' }}
                                    text
                                    icon={<common-element-icon size={20} name="nest-settings"></common-element-icon>}
                                    onClick={fetchState}
                                ></common-element-button>
                            </div>
                        ),
                        default: () => (
                            <n-element class="common-database-table-settings-popover flex flex-col overflow-hidden">
                                <div class="flex items-center justify-between p-inline-14 p-block-10">
                                    <n-checkbox
                                        focusable={false}
                                        indeterminate={indeterminate.value}
                                        v-model:checked={state.checked}
                                        on-update:checked={fetchUpdate}
                                    >
                                        全选
                                    </n-checkbox>
                                    <common-element-button text onClick={fetchReset}>
                                        重置
                                    </common-element-button>
                                </div>
                                <n-scrollbar class="max-h-450 overflow-hidden select-none">
                                    <common-element-draggable
                                        class="w-220 flex flex-col p-be-6 overflow-hidden"
                                        handle=".cursor-move"
                                        animation={200}
                                        v-model={state.columns}
                                        onUpdate={fetchDragUpdate}
                                    >
                                        {state.columns.map(item => (
                                            <n-element
                                                key={item.key}
                                                class="chunk-column flex items-center overflow-hidden p-ie-14 cursor-pointer"
                                            >
                                                <div class="flex p-block-10 p-inline-12 cursor-move">
                                                    <n-icon size={20} color="var(--primary-color)">
                                                        <Grid />
                                                    </n-icon>
                                                </div>
                                                <n-checkbox
                                                    focusable={false}
                                                    disabled={item.disabled}
                                                    v-model:checked={item.check}
                                                    on-update:checked={(c: boolean) => fetchChnage(c, item)}
                                                >
                                                    <div
                                                        title={item.title}
                                                        class="absolute inset-0 overflow-hidden whitespace-nowrap text-ellipsis"
                                                    >
                                                        {item.title}
                                                    </div>
                                                </n-checkbox>
                                            </n-element>
                                        ))}
                                    </common-element-draggable>
                                </n-scrollbar>
                            </n-element>
                        )
                    }}
                </common-element-popover>
            )
        }
    }
})
</script>

<style lang="scss" scoped>
.common-database-table-settings-popover {
    position: relative;
    :deep(.common-element-draggable) > .chunk-column {
        position: relative;
        transition: background-color 0.3s var(--n-bezier);
        &:hover {
            background-color: var(--button-color-2-hover);
        }
        .n-checkbox {
            --n-label-padding: 0px;
            align-items: center;
            display: flex;
            gap: 10px;
            flex: 1;
            .n-checkbox__label {
                position: relative;
                overflow: hidden;
                height: 24px;
                flex: 1;
            }
        }
    }
}
</style>
