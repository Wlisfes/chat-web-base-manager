<script lang="tsx">
import { defineComponent, PropType, h } from 'vue'
import { fetchNotifyService } from '@/plugins'
import { SendFilled } from '@vicons/carbon'
import { fetchParentKeyIds } from '@/utils'
import { useBaseService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemRoleSheet',
    props: {
        /**角色信息**/
        faseOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**菜单树数据。接口直接返回数组，不是分页结果包装对象。*/
        sheetOptions: { type: Array as PropType<Array<Omix>>, default: () => [] }
    },
    setup(props, ctx) {
        /**角色关联菜单数据**/
        const { faseNode, faseState, setState, fetchRefresh } = useBaseService({
            request: () => Service.httpBaseAccountRoleResolver({ keyId: props.faseOptions.keyId }),
            callback: fetchSheetCallback,
            immediate: true,
            options: {
                checkedKeys: [] as Array<number>,
                indeterminateKeys: [] as Array<number>,
                expandedKeys: [] as Array<number>
            }
        })

        /**角色关联菜单回调：过滤非叶子节点，仅设置叶子节点为checked**/
        async function fetchSheetCallback(data: Omix) {
            const parentIds = fetchParentKeyIds(props.sheetOptions ?? [])
            const checkedKeys = (data.sheetKeyIds ?? []).filter((id: number) => !parentIds.has(id))
            return await setState({ checkedKeys })
        }

        /**保存角色菜单权限**/
        async function fetchSubmit() {
            return await setState({ loading: true }).then(async () => {
                try {
                    await Service.httpBaseAccountUpdateRoleSheet({
                        keyId: props.faseOptions.keyId,
                        sheetKeyIds: [...faseState.checkedKeys, ...faseState.indeterminateKeys]
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
            <common-base-element
                class="deploy-system-role-sheet h-full flex flex-col gap-14 overflow-hidden"
                style={{ 'border-radius': '0 0 var(--border-radius) var(--border-radius)' }}
            >
                <common-base-element is-white class="flex flex-col flex-1 p-block-14 overflow-hidden">
                    <common-base-wrapper
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
                            data={props.sheetOptions}
                            render-switcher-icon={() => h(SendFilled)}
                            on-update:checked-keys={(checkedKeys: Array<number>) => setState({ checkedKeys })}
                            on-update:indeterminate-keys={(indeterminateKeys: Array<number>) => setState({ indeterminateKeys })}
                            on-update:expanded-keys={(expandedKeys: Array<number>) => setState({ expandedKeys })}
                        />
                    </common-base-wrapper>
                </common-base-element>
                <common-base-authorize key-name="chat:deploy:system:role:update">
                    <common-base-element is-white class="b-rd-[var(--border-radius)] p-14 flex gap-12 overflow-hidden">
                        <common-base-button
                            class="min-w-80"
                            type="primary"
                            loading={faseState.loading}
                            disabled={faseState.loading || faseState.initialize}
                            onClick={fetchSubmit}
                        >
                            保存
                        </common-base-button>
                        <common-base-button
                            class="min-w-80"
                            type="warning"
                            secondary
                            disabled={faseState.loading || faseState.initialize}
                            onClick={() => fetchSheetCallback(faseNode.value)}
                        >
                            重置
                        </common-base-button>
                    </common-base-element>
                </common-base-authorize>
            </common-base-element>
        )
    }
})
</script>
