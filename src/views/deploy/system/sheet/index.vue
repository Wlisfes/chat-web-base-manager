<script lang="tsx">
import { defineComponent, h } from 'vue'
import { useColumnService, useSelectService, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { SendFilled } from '@vicons/carbon'
import { isEmpty, fetchNormalizeTreeChildren } from '@/utils'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemSheet',
    setup(props, ctx) {
        /**菜单静态枚举**/
        const { chunkOptions } = useChunkService(e => Service.httpBaseAccountSheetEnums(), {
            immediate: true
        })
        /**菜单树结构**/
        const sheetOptions = useSelectService(e => Service.httpBaseAccountSheetTreeStructure(), {
            transform: fetchNormalizeTreeChildren,
            immediate: true,
            options: {
                selectedKeys: [] as Array<number>,
                expandedKeys: [] as Array<number>
            }
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, setForm, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseAccountColumnSheet({ ...payload, page: base.page, size: base.size }),
            {
                keyName: 'chat:deploy:system:sheet',
                actions: [
                    { title: '新增', key: 'chat:deploy:system:sheet:create' },
                    { title: '编辑', key: 'chat:deploy:system:sheet:update' },
                    { title: '删除', key: 'chat:deploy:system:sheet:delete' }
                ],
                formState: {
                    /**父级ID**/
                    parentKeyId: undefined as unknown as number,
                    /**菜单名称**/
                    name: undefined,
                    /**权限标识**/
                    permissionCode: undefined,
                    /**菜单地址**/
                    path: undefined
                },
                columns: [
                    { title: '图标', key: 'icon', width: 60, disabled: true, align: 'center', className: 'p-block-0!' },
                    { title: '菜单名称', key: 'name', width: 150, disabled: true },
                    { title: '类型', key: 'type', width: 100 },
                    { title: '排序号', key: 'sort', width: 100 },
                    { title: '状态', key: 'status', width: 100 },
                    { title: '显示状态', key: 'visible', width: 100 },
                    { title: '权限标识', key: 'permissionCode', minWidth: 200 },
                    { title: '路由地址', key: 'path', minWidth: 200 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        /**左侧树展开变更回调**/
        async function fetchUpdateExpanded(keys: Array<number>) {
            return await sheetOptions.setState({ expandedKeys: keys })
        }

        /**左侧树选中变更回调**/
        async function fetchUpdateSelected(keys: Array<number>) {
            return await sheetOptions.setState({ selectedKeys: keys }).then(async () => {
                return await setForm({ parentKeyId: keys[0] }).then(() => {
                    return fetchRefresh({ page: 1, size: state.size })
                })
            })
        }

        /**新增菜单/按钮**/
        async function fetchCreateDeploySheet() {
            return await feedback.fetchDeploySystemSheet({
                title: '新增菜单/按钮',
                command: 'CREATE',
                async onSubmit() {
                    return await Promise.all([sheetOptions.fetchRequest(), fetchRefresh()])
                }
            })
        }

        /**编辑菜单、按钮**/
        async function fetchUpdateDeploySheet(node: Omix) {
            return await feedback.fetchDeploySystemSheet({
                title: '编辑菜单/按钮',
                command: 'UPDATE',
                node,
                async onSubmit() {
                    return await Promise.all([sheetOptions.fetchRequest(), fetchRefresh()])
                }
            })
        }

        /**克隆菜单、按钮**/
        async function fetchCloneDeploySheet(node: Omix) {
            return await feedback.fetchDeploySystemSheet({
                title: '克隆菜单/按钮',
                command: 'CLONE',
                node,
                async onSubmit() {
                    return await Promise.all([sheetOptions.fetchRequest(), fetchRefresh()])
                }
            })
        }

        /**删除菜单/按钮**/
        async function fetchDeleteDeploySheet(node: Omix) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认删除菜单【${node.name}】吗？删除后将同时删除子菜单/按钮，且无法恢复！`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseAccountDeleteSheet({ keyId: node.keyId })
                            return await done({ visible: false }).then(async () => {
                                await fetchNotifyService({ title: '操作成功' })
                                return await Promise.all([sheetOptions.fetchRequest(), fetchRefresh()])
                            })
                        } catch (err) {
                            return await done({ loading: false }).then(async () => {
                                return await fetchNotifyService({ type: 'error', title: err.message })
                            })
                        }
                    })
                }
            })
        }

        return () => (
            <n-layout has-sider class="flex flex-col bg-transparent" content-class="flex-1 overflow-hidden">
                <n-layout-sider
                    width={280}
                    collapsed-width={0}
                    show-collapsed-content={false}
                    class="flex flex-col bg-transparent"
                    content-class="flex flex-col flex-1 overflow-hidden! p-block-12 p-is-12"
                >
                    <n-card class="flex-1 overflow-hidden" content-class="flex flex-col flex-1 p-inline-0! p-block-14! overflow-hidden">
                        <common-base-wrapper opacity={0} loading={sheetOptions.state.loading}>
                            <n-scrollbar trigger="none" class="flex-1 overflow-hidden">
                                <n-element class="p-inline-14">
                                    <n-tree
                                        block-line
                                        key-field="keyId"
                                        label-field="name"
                                        children-field="children"
                                        pattern={sheetOptions.state.pattern}
                                        selected-keys={sheetOptions.state.selectedKeys}
                                        expanded-keys={sheetOptions.state.expandedKeys}
                                        data={sheetOptions.dataSource.value}
                                        render-switcher-icon={() => h(SendFilled)}
                                        on-update:selected-keys={fetchUpdateSelected}
                                        on-update:expanded-keys={fetchUpdateExpanded}
                                        filter={(vague: string, node: Omix) => node.name.includes(vague)}
                                    />
                                </n-element>
                            </n-scrollbar>
                        </common-base-wrapper>
                    </n-card>
                </n-layout-sider>
                <n-layout class="bg-transparent" content-class="flex flex-col flex-1 p-12 gap-12 overflow-hidden">
                    <n-layout-header class="bg-transparent">
                        <common-database-search
                            class="p-0!"
                            function-class="justify-end"
                            function={['search', 'restore', 'collapse', 'deploy', 'abstract']}
                            ref={formRef}
                            limit={state.limit}
                            v-model:loading={state.loading}
                            v-model:when={state.when}
                            v-model:database={state.database}
                            v-model:formState={formState.value}
                            on-update:database={instOptions.fetchUpdateDatabase}
                            on-restore={instOptions.fetchRestore}
                            on-submit={instOptions.fetchRequest}
                        >
                            <common-database-search-function abstract class="flex gap-col-10">
                                <common-base-authorize key-name={state.actions[0].key}>
                                    <common-base-button type="primary" onClick={fetchCreateDeploySheet}>
                                        新增
                                    </common-base-button>
                                </common-base-authorize>
                            </common-database-search-function>
                            <common-database-search-column disabled prop="name" label="菜单名称">
                                <form-base-input
                                    clearable
                                    placeholder="请输入菜单名称"
                                    v-model:value={formState.value.name}
                                    on-submit={fetchRefresh}
                                ></form-base-input>
                            </common-database-search-column>
                            <common-database-search-column prop="permissionCode" label="权限标识">
                                <form-base-input
                                    clearable
                                    placeholder="请输入权限标识"
                                    v-model:value={formState.value.permissionCode}
                                    on-submit={fetchRefresh}
                                ></form-base-input>
                            </common-database-search-column>
                            <common-database-search-column prop="path" label="菜单地址">
                                <form-base-input
                                    clearable
                                    placeholder="请输入菜单地址"
                                    v-model:value={formState.value.path}
                                    on-submit={fetchRefresh}
                                ></form-base-input>
                            </common-database-search-column>
                        </common-database-search>
                    </n-layout-header>
                    <n-layout-content class="flex flex-col flex-1 bg-transparent" content-class="flex flex-col flex-1">
                        <common-database-table
                            class="p-0!"
                            show-command
                            show-settings
                            page-sizes={[20, 30, 50, 100]}
                            limit={state.limit}
                            total={state.total}
                            columns={state.columns}
                            v-model:page={state.page}
                            v-model:size={state.size}
                            v-model:select={state.select}
                            v-model:loading={state.loading}
                            v-model:data={state.dataSource}
                            v-model:customize={state.customize}
                            on-update:customize={instOptions.fetchUpdateCustomize}
                            on-update:page={(page: number) => fetchRefresh({ page })}
                            on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                        >
                            {{
                                col_icon: (data: Omix) => (
                                    <div class="flex items-center justify-center">
                                        {isEmpty(data.icon) ? (
                                            <span>-</span>
                                        ) : (
                                            <common-base-icon size={26} name={data.icon}></common-base-icon>
                                        )}
                                    </div>
                                ),
                                col_type: (data: Omix) => (
                                    <common-base-chunk
                                        bordered
                                        value={data.type}
                                        items={chunkOptions.value.typeOptions}
                                    ></common-base-chunk>
                                ),
                                col_status: (data: Omix) => (
                                    <common-base-chunk
                                        bordered
                                        value={data.status}
                                        items={chunkOptions.value.statusOptions}
                                    ></common-base-chunk>
                                ),
                                col_visible: (data: Omix) => (
                                    <common-base-chunk
                                        bordered
                                        value={data.visible}
                                        items={chunkOptions.value.visibleOptions}
                                    ></common-base-chunk>
                                ),
                                col_command: (data: Omix) => (
                                    <common-base-authorize
                                        element
                                        empty="-"
                                        key-name={state.actions.map((item: Omix) => item.key)}
                                        class-name="flex items-center gap-x-10 overflow-hidden"
                                    >
                                        <common-base-authorize key-name={state.actions[0].key}>
                                            <common-base-button
                                                text
                                                title="克隆"
                                                type="primary"
                                                onClick={(e: MouseEvent) => fetchCloneDeploySheet(data)}
                                            >
                                                克隆
                                            </common-base-button>
                                        </common-base-authorize>
                                        <common-base-authorize key-name={state.actions[1].key}>
                                            <common-base-button
                                                text
                                                title="编辑"
                                                type="info"
                                                onClick={(e: MouseEvent) => fetchUpdateDeploySheet(data)}
                                            >
                                                编辑
                                            </common-base-button>
                                        </common-base-authorize>
                                        <common-base-authorize key-name={state.actions[2].key}>
                                            <common-base-button
                                                text
                                                title="删除"
                                                type="error"
                                                onClick={(e: MouseEvent) => fetchDeleteDeploySheet(data)}
                                            >
                                                删除
                                            </common-base-button>
                                        </common-base-authorize>
                                    </common-base-authorize>
                                )
                            }}
                        </common-database-table>
                    </n-layout-content>
                </n-layout>
            </n-layout>
        )
    }
})
</script>
