<script lang="tsx">
import { defineComponent, PropType, h } from 'vue'
import { useBaseService } from '@/hooks'
import { EventType, fetchParentKeyIds } from '@/utils'
import { SendFilled } from '@vicons/carbon'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemRoleSheet',
    props: {
        /**通讯实例**/
        observer: { type: Object as PropType<EventType>, required: true },
        /**角色ID**/
        roleId: { type: Number as PropType<number> },
        /**菜单树数据**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, ctx) {
        /**角色关联菜单数据**/
        const { faseNode, faseState, setState, fetchInitialize, fetchRefresh } = useBaseService({
            request: () => Service.httpBaseSystemColumnRoleSheet({ roleId: props.roleId }),
            callback: fetchSheetCallback,
            immediate: true,
            options: {
                checkedKeys: [] as Array<number>,
                indeterminateKeys: [] as Array<number>,
                expandedKeys: [] as Array<number>
            }
        })
        /**监听结束事件**/
        props.observer.on('finish', async () => {
            return await setState({ loading: false, initialize: false })
        })
        /**监听刷新事件**/
        props.observer.on('refresh', async () => {
            return await setState({ initialize: true }).then(async () => {
                return await fetchInitialize()
            })
        })

        /**角色关联菜单回调：过滤非叶子节点，仅设置叶子节点为checked**/
        async function fetchSheetCallback(data: Omix) {
            const parentIds = fetchParentKeyIds(props.faseNode.list ?? [])
            const checkedKeys = (data.list ?? []).filter((id: number) => !parentIds.has(id))
            return await setState({ checkedKeys })
        }

        /**保存角色菜单权限**/
        async function fetchSubmit() {
            return await setState({ loading: true }).then(async () => {
                try {
                    await Service.httpBaseSystemUpdateRoleSheet({
                        roleId: props.roleId,
                        sheetIds: [...faseState.checkedKeys, ...faseState.indeterminateKeys]
                    })
                    return await setState({ loading: false }).then(async () => {
                        await fetchNotifyService({ title: '操作成功' })
                        return await fetchRefresh()
                    })
                } catch (err) {
                    return await setState({ loading: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        return () => (
            <common-element
                class="deploy-system-role-sheet h-full flex flex-col gap-14 overflow-hidden"
                style={{ 'border-radius': '0 0 var(--border-radius) var(--border-radius)' }}
            >
                <common-element is-white class="flex flex-col flex-1 p-block-14 overflow-hidden">
                    <common-element-wrapper
                        scrollbar
                        opacity={0}
                        loading={faseState.initialize}
                        scrollbar-props={{ contentClass: 'p-inline-14' }}
                    >
                        <n-tree
                            cascade
                            checkable
                            show-line
                            block-line
                            expand-on-click
                            selectable={false}
                            key-field="keyId"
                            label-field="name"
                            children-field="children"
                            checked-keys={faseState.checkedKeys}
                            expanded-keys={faseState.expandedKeys}
                            data={props.faseNode.list ?? []}
                            render-switcher-icon={() => h(SendFilled)}
                            on-update:checked-keys={(checkedKeys: Array<number>) => setState({ checkedKeys })}
                            on-update:indeterminate-keys={(indeterminateKeys: Array<number>) => setState({ indeterminateKeys })}
                            on-update:expanded-keys={(expandedKeys: Array<number>) => setState({ expandedKeys })}
                        />
                    </common-element-wrapper>
                </common-element>
                <common-element is-white class="b-rd-[var(--border-radius)] p-14 flex gap-12 overflow-hidden">
                    <common-element-button
                        class="min-w-80"
                        type="primary"
                        loading={faseState.loading}
                        disabled={faseState.loading || faseState.initialize}
                        onClick={fetchSubmit}
                    >
                        保存
                    </common-element-button>
                    <common-element-button class="min-w-80" type="warning" secondary onClick={() => fetchSheetCallback(faseNode.value)}>
                        重置
                    </common-element-button>
                </common-element>
            </common-element>
        )
    }
})
</script>
