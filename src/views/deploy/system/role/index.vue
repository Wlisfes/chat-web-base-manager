<script lang="tsx">
import { computed, defineComponent, h } from 'vue'
import { useBaseService, useSelectService } from '@/hooks'
import { fetchNormalizeTreeChildren, tree, stop, isNotEmpty, fetchCurrent } from '@/utils'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { SendFilled, Grid, Edit, Delete } from '@vicons/carbon'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemRole',
    setup(props, ctx) {
        /**菜单树数据**/
        const sheetOptions = useSelectService(e => Service.httpBaseAccountSheetTreeStructure(), {
            immediate: true,
            transform: fetchNormalizeTreeChildren
        })
        /**角色列表**/
        const { faseNode, faseState, setState, fetchRefresh } = useBaseService({
            request: () => Service.httpBaseAccountRoleConfiger(),
            callback: fetchReadyCallback,
            immediate: true,
            options: {
                tabName: 'user',
                selectedKeys: [] as Array<number>,
                expandedKeys: [] as Array<number>,
                actions: [
                    { title: '编辑角色', key: 'chat:deploy:system:role:update' },
                    { title: '删除角色', key: 'chat:deploy:system:role:delete' }
                ]
            }
        })
        /**岗位角色树数据，移除叶子节点的空 children，避免显示无效展开图标。*/
        const treeRoles = computed(() => fetchNormalizeTreeChildren(faseNode.value.tree ?? []))
        /**当前选中的角色或岗位角色节点**/
        const faseOptions = computed<Omix>(() => {
            const selectedKey = faseState.selectedKeys[0]
            const itemNode = fetchCurrent(faseNode.value.list ?? [], (e: Omix) => e.keyId == selectedKey)
            if (isNotEmpty(itemNode.keyId)) {
                return itemNode
            }
            return tree.findNode(treeRoles.value, (e: Omix) => e.keyId == selectedKey) ?? {}
        })

        /**初始化回调**/
        async function fetchReadyCallback(data: Omix) {
            if ((data.list ?? []).length === 0 || faseState.selectedKeys.length > 0) {
                return await setState({ expandedKeys: [], selectedKeys: undefined })
            }
            return await setState({ expandedKeys: [], selectedKeys: [data.list[0].keyId] })
        }

        /**左侧树展开变更回调**/
        async function fetchUpdateExpanded(keys: Array<number>) {
            return await setState({ expandedKeys: keys })
        }

        /**左侧树选中变更回调**/
        async function fetchUpdateSelected(keys: Array<number>) {
            return await setState({ selectedKeys: keys })
        }

        /**拖拽排序更新**/
        async function fetchUpdateRoleSort() {
            try {
                const list = (faseNode.value.list ?? []).map((item: Omix, index: number) => ({
                    keyId: item.keyId,
                    sort: (index + 1) * 10
                }))
                await Promise.all(list.map((item: Omix) => Service.httpBaseAccountUpdateRole(item)))
                return await fetchNotifyService({ title: '操作成功' })
            } catch (err) {
                return await fetchNotifyService({ type: 'error', title: err.message })
            }
        }

        /**新增岗位角色**/
        async function fetchCreateDeploySystemRole() {
            return await feedback.fetchDeploySystemRole({
                title: '新增岗位角色',
                command: 'CREATE',
                onSubmit: () => fetchRefresh()
            })
        }

        /**编辑岗位角色**/
        async function fetchUpdateDeploySystemRole(event: MouseEvent, node: Omix = {}) {
            return await stop(event).then(async () => {
                return await feedback.fetchDeploySystemRole({
                    node,
                    title: '编辑岗位角色',
                    command: 'UPDATE',
                    onSubmit: () => fetchRefresh()
                })
            })
        }

        /**删除岗位角色**/
        async function fetchDeleteDeploySystemRole(event: MouseEvent, node: Omix) {
            return await stop(event).then(async () => {
                return await fetchDialogService({
                    title: '提示',
                    type: 'warning',
                    content: `确认删除角色【${node.name}】吗？删除后无法恢复！`,
                    async onSubmit(done: Function) {
                        return await done({ loading: true }).then(async () => {
                            try {
                                await Service.httpBaseAccountDeleteRole({ keyId: node.keyId })
                                return await done({ visible: false }).then(async () => {
                                    await fetchNotifyService({ title: '操作成功' })
                                    return await fetchRefresh()
                                })
                            } catch (err) {
                                return await done({ loading: false }).then(async () => {
                                    return await fetchNotifyService({ type: 'error', title: err.message })
                                })
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
                    content-class="flex flex-col flex-1 overflow-hidden! p-block-12 p-is-12"
                >
                    <n-card class="flex-1 overflow-hidden" content-class="flex flex-col flex-1 p-0! overflow-hidden">
                        <common-base-wrapper scrollbar opacity={0} loading={faseState.initialize}>
                            <n-element class="flex flex-col gap-10 overflow-hidden">
                                <div class="flex flex-col p-inline-14 overflow-hidden">
                                    <div class="flex items-center justify-between p-block-12 overflow-hidden">
                                        <n-h4 class="line-height-21 m-0">通用角色</n-h4>
                                        <common-base-authorize key-name="chat:deploy:system:role:create">
                                            <common-base-button text type="primary" onClick={fetchCreateDeploySystemRole}>
                                                新增角色
                                            </common-base-button>
                                        </common-base-authorize>
                                    </div>
                                    {(faseNode.value.list ?? []).length > 0 && (
                                        <n-radio-group
                                            class="chunk-block flex flex-col overflow-hidden"
                                            value={faseState.selectedKeys[0]}
                                            on-update:value={(keyId: number) => fetchUpdateSelected([keyId])}
                                        >
                                            <common-base-draggable
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
                                                        <common-base-authorize
                                                            element
                                                            key-name={faseState.actions.map(item => item.key)}
                                                            class-name="flex items-center p-inline-7 gap-x-7 overflow-hidden"
                                                        >
                                                            <common-base-authorize key-name={faseState.actions[0].key}>
                                                                <common-base-button
                                                                    title={faseState.actions[0].title}
                                                                    type="info"
                                                                    text
                                                                    icon-size={16}
                                                                    icon={Edit}
                                                                    onClick={(e: MouseEvent) => fetchUpdateDeploySystemRole(e, item)}
                                                                ></common-base-button>
                                                            </common-base-authorize>
                                                            <common-base-authorize key-name={faseState.actions[1].key}>
                                                                <common-base-button
                                                                    title={faseState.actions[1].title}
                                                                    type="error"
                                                                    text
                                                                    icon-size={16}
                                                                    icon={Delete}
                                                                    onClick={(e: MouseEvent) => fetchDeleteDeploySystemRole(e, item)}
                                                                ></common-base-button>
                                                            </common-base-authorize>
                                                        </common-base-authorize>
                                                    </n-radio>
                                                ))}
                                            </common-base-draggable>
                                        </n-radio-group>
                                    )}
                                </div>
                                <div class="flex flex-col p-inline-14 overflow-hidden">
                                    <n-h4 class="line-height-21 m-0 p-block-14">岗位角色</n-h4>
                                    <n-tree
                                        block-line
                                        cancelable={false}
                                        key-field="nodeId"
                                        label-field="name"
                                        children-field="children"
                                        selected-keys={faseState.selectedKeys}
                                        expanded-keys={faseState.expandedKeys}
                                        data={treeRoles.value}
                                        render-switcher-icon={() => h(SendFilled)}
                                        on-update:selected-keys={fetchUpdateSelected}
                                        on-update:expanded-keys={fetchUpdateExpanded}
                                    />
                                </div>
                            </n-element>
                        </common-base-wrapper>
                    </n-card>
                </n-layout-sider>
                <n-layout class="bg-transparent" content-class="flex flex-col flex-1 p-12 overflow-hidden">
                    <n-tabs
                        animated
                        type="line"
                        default-value="user"
                        tab-class="p-block-12!"
                        tabs-padding={14}
                        class="common-base-tabser inset-absolute h-full overflow-hidden "
                        v-model:value={faseState.tabName}
                    >
                        <n-tab-pane name="user" tab="关联用户" display-directive="show">
                            <deploy-system-role-user
                                key={faseOptions.value.keyId}
                                fase-options={faseOptions.value}
                            ></deploy-system-role-user>
                        </n-tab-pane>
                        <n-tab-pane name="sheet" tab="关联权限" display-directive="show:lazy">
                            <deploy-system-role-sheet
                                key={faseOptions.value.keyId}
                                sheet-options={sheetOptions.dataSource.value}
                                fase-options={faseOptions.value}
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
