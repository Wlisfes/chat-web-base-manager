<script lang="tsx">
import { defineComponent, h } from 'vue'
import { useBaseService } from '@/hooks'
import { stop, isEmpty } from '@/utils'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { SendFilled, Grid } from '@vicons/carbon'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemRole',
    setup(props, ctx) {
        /**菜单树数据**/
        const treeOptions = useBaseService({
            request: () => Service.httpBaseSystemSheetTreeStructure(),
            immediate: true
        })
        /**角色列表**/
        const { faseNode, faseState, observer, setState, fetchRefresh } = useBaseService({
            request: Service.httpBaseSystemColumnRole,
            callback: fetchReadyCallback,
            immediate: true,
            options: {
                tabName: 'account',
                selectedKeys: [] as Array<number>,
                expandedKeys: [] as Array<number>
            }
        })
        /**初始化回调**/
        async function fetchReadyCallback(data: Omix) {
            if ((data.list ?? []).length === 0 || faseState.selectedKeys.length > 0) {
                return observer.value.emit('finish', {})
            }
            return await setState({ expandedKeys: [], selectedKeys: [data.list[0].keyId] }).then(async state => {
                return observer.value.emit('refresh', { roleId: state.selectedKeys[0] })
            })
        }
        /**左侧树展开变更回调**/
        async function fetchUpdateExpanded(keys: Array<number>) {
            return await setState({ expandedKeys: keys })
        }
        /**左侧树选中变更回调**/
        async function fetchUpdateSelected(keys: Array<number>) {
            return await setState({ selectedKeys: keys }).then(async state => {
                return observer.value.emit('refresh', { roleId: state.selectedKeys[0] })
            })
        }
        /**拖拽排序更新**/
        async function fetchUpdateRoleSort() {
            try {
                const list = (faseNode.value.list ?? []).map((item: Omix, index: number) => ({
                    keyId: item.keyId,
                    sort: (index + 1) * 10
                }))
                await Service.httpBaseSystemUpdateRoleSort({ list })
                return await fetchNotifyService({ title: '操作成功' })
            } catch (err) {
                return await fetchNotifyService({ type: 'error', title: err.message })
            }
        }
        /**新增、编辑岗位角色**/
        async function fetchDeployUpdateSystemRole(event: MouseEvent, node: Omix = {}) {
            return await stop(event).then(async () => {
                if (isEmpty(node.keyId)) {
                    return await feedback.fetchDeploySystemRole({
                        title: '新增岗位角色',
                        command: 'CREATE',
                        onSubmit: fetchRefresh
                    })
                }
                return await feedback.fetchDeploySystemRole({
                    node,
                    title: '编辑岗位角色',
                    command: 'UPDATE',
                    onSubmit: fetchRefresh
                })
            })
        }
        /**删除岗位角色**/
        async function fetchDeployDeleteSystemRole(event: MouseEvent, node: Omix) {
            return await stop(event).then(async () => {
                return await fetchDialogService({
                    title: '提示',
                    type: 'warning',
                    content: `确认删除角色【${node.name}】吗？删除后无法恢复！`,
                    async onSubmit(done: Function) {
                        return await done({ loading: true }).then(async () => {
                            try {
                                await Service.httpBaseSystemDeleteRole({ keyId: node.keyId })
                                await fetchRefresh()
                                return await done({ visible: false })
                            } catch (err) {
                                await done({ loading: false })
                                return await fetchNotifyService({ type: 'error', title: err.message })
                            }
                        })
                    }
                })
            })
        }

        return () => (
            <n-layout has-sider position="absolute" class="flex flex-col bg-transparent" content-class="flex-1 overflow-hidden">
                <n-layout-sider
                    width={280}
                    collapsed-width={0}
                    show-collapsed-content={false}
                    class="flex flex-col bg-transparent"
                    content-class="flex flex-col flex-1 overflow-hidden! p-block-14 p-is-14"
                >
                    <n-card class="flex-1 overflow-hidden" content-class="flex flex-col flex-1 p-0! overflow-hidden">
                        <common-element-wrapper scrollbar opacity={0} loading={faseState.initialize}>
                            <n-element class="flex flex-col gap-10 overflow-hidden">
                                <div class="flex flex-col p-inline-14 overflow-hidden">
                                    <div class="flex items-center justify-between p-block-12 overflow-hidden">
                                        <n-h4 class="line-height-21 m-0">岗位角色</n-h4>
                                        <common-element-button
                                            text
                                            type="primary"
                                            onClick={(event: MouseEvent) => fetchDeployUpdateSystemRole(event)}
                                        >
                                            新增角色
                                        </common-element-button>
                                    </div>
                                    {(faseNode.value.list ?? []).length > 0 && (
                                        <n-radio-group
                                            class="chunk-block flex flex-col overflow-hidden"
                                            value={faseState.selectedKeys[0]}
                                            on-update:value={(keyId: number) => fetchUpdateSelected([keyId])}
                                        >
                                            <common-element-draggable
                                                class="flex flex-col overflow-hidden"
                                                handle=".cursor-move"
                                                animation={200}
                                                v-model={faseNode.value.list}
                                                onUpdate={fetchUpdateRoleSort}
                                            >
                                                {(faseNode.value.list ?? []).map((item: Omix) => (
                                                    <n-radio class="chunk-block-element" key={item.keyId} value={item.keyId}>
                                                        <div class="flex items-center p-inline-7 cursor-move overflow-hidden">
                                                            <n-icon size={16} color="var(--primary-color)">
                                                                <Grid />
                                                            </n-icon>
                                                        </div>
                                                        <n-ellipsis tooltip={false} class="flex-1 overflow-hidden">
                                                            <n-text>{item.name}</n-text>
                                                        </n-ellipsis>
                                                        <div class="flex items-center p-inline-7 overflow-hidden" title="编辑角色">
                                                            <common-element-button
                                                                text
                                                                icon-size={16}
                                                                icon="nest-settings"
                                                                onClick={(e: MouseEvent) => fetchDeployUpdateSystemRole(e, item)}
                                                            ></common-element-button>
                                                        </div>
                                                        <div class="flex items-center p-inline-7 overflow-hidden" title="删除角色">
                                                            <common-element-button
                                                                text
                                                                icon-size={16}
                                                                type="error"
                                                                icon="nest-delete"
                                                                onClick={(e: MouseEvent) => fetchDeployDeleteSystemRole(e, item)}
                                                            ></common-element-button>
                                                        </div>
                                                    </n-radio>
                                                ))}
                                            </common-element-draggable>
                                        </n-radio-group>
                                    )}
                                </div>
                                <div class="flex flex-col p-inline-14 overflow-hidden">
                                    <n-h4 class="line-height-21 m-0 p-block-14">部门角色</n-h4>
                                    <n-tree
                                        block-line
                                        cancelable={false}
                                        key-field="nodeId"
                                        label-field="name"
                                        children-field="children"
                                        selected-keys={faseState.selectedKeys}
                                        expanded-keys={faseState.expandedKeys}
                                        data={faseNode.value.dept ?? []}
                                        render-switcher-icon={() => h(SendFilled)}
                                        on-update:selected-keys={fetchUpdateSelected}
                                        on-update:expanded-keys={fetchUpdateExpanded}
                                    />
                                </div>
                            </n-element>
                        </common-element-wrapper>
                    </n-card>
                </n-layout-sider>
                <n-layout class="bg-transparent" content-class="flex flex-col flex-1 p-14 overflow-hidden">
                    <n-tabs
                        animated
                        type="line"
                        default-value="account"
                        tab-class="p-block-12!"
                        tabs-padding={14}
                        class="common-element-tabser inset-absolute h-full overflow-hidden "
                        v-model:value={faseState.tabName}
                    >
                        <n-tab-pane name="account" tab="关联账号" display-directive="show">
                            <deploy-system-role-account
                                observer={observer.value}
                                role-id={faseState.selectedKeys[0]}
                            ></deploy-system-role-account>
                        </n-tab-pane>
                        <n-tab-pane name="sheet" tab="关联权限" display-directive="show:lazy">
                            <deploy-system-role-sheet
                                observer={observer.value}
                                fase-node={treeOptions.faseNode.value}
                                role-id={faseState.selectedKeys[0]}
                            ></deploy-system-role-sheet>
                        </n-tab-pane>
                    </n-tabs>
                </n-layout>
            </n-layout>
        )
    }
})
</script>

<style lang="scss" scoped>
.chunk-block.n-radio-group {
    --chunk-block-height: 36px;
    --chunk-block-line-height: 30px;
    position: relative;
    :deep(.n-radio__dot-wrapper) {
        display: none;
    }
    :deep(.n-radio__label) {
        width: 100%;
        display: flex;
        padding-inline-start: 0;
        padding-inline-end: 0;
        height: var(--chunk-block-line-height);
        line-height: var(--chunk-block-line-height);
        border-radius: var(--border-radius-small);
        transition: background-color 0.3s var(--n-bezier);
    }
    :deep(.chunk-block-element) {
        height: var(--chunk-block-height);
        padding-block-start: 3px;
        padding-block-end: 3px;
        box-sizing: border-box;
        &:hover .n-radio__label {
            background-color: var(--hover-color);
        }
        &:has(.n-radio__dot--checked) .n-radio__label {
            background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
        }
    }
}
</style>
