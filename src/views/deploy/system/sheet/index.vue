<script lang="tsx">
import { defineComponent, h } from 'vue'
import { useColumnService, useSelectService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { SendFilled } from '@vicons/carbon'
import { isEmpty } from '@/utils'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemSheet',
    setup(props, ctx) {
        /**菜单树结构**/
        const sheetOptions = useSelectService(e => Service.httpBaseSystemSheetTreeStructure(), {
            callback: fetchReadyCallback,
            immediate: true,
            options: {
                selectedKeys: [] as Array<string>,
                expandedKeys: [] as Array<string>
            }
        })
        /**表格实例**/
        const { formRef, formState, state, chunkState, instState, instOptions, setForm, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSystemColumnSheet(payload),
            keyName: 'chatbok:deploy:system:sheet',
            immediate: false,
            chunkNames: {
                CHUNK_SHEET_STATUS: true,
                CHUNK_SHEET_CHUNK: true
            },
            formState: {
                pid: undefined, //父级ID
                name: undefined, //菜单名称
                keyName: undefined, //权限标识
                router: undefined, //菜单地址
                version: undefined //版本号
            },
            columns: [
                { title: '菜单名称', key: 'name', width: 150, disabled: true },
                { title: '图标', key: 'iconName', width: 100, align: 'center', className: 'p-block-0!', check: true },
                { title: '类型', key: 'chunk', width: 100, check: true },
                { title: '权限标识', key: 'keyName', minWidth: 200, check: true },
                { title: '路由地址', key: 'router', minWidth: 200, check: true },
                { title: '版本号', key: 'version', width: 100, align: 'center', check: true },
                { title: '排序号', key: 'sort', width: 100, align: 'center', check: true },
                { title: '状态', key: 'status', width: 100, align: 'center', check: true },
                { title: '创建人', key: 'createBy', width: 120, check: true },
                { title: '创建时间', key: 'createTime', width: 160, check: true },
                { title: '更新人', key: 'modifyBy', width: 120, check: true },
                { title: '更新时间', key: 'modifyTime', width: 160, check: true }
            ]
        })

        /**初始化回调**/
        async function fetchReadyCallback(data: Omix) {
            if (sheetOptions.selectedKeys.value.length > 0) {
                return false
            }
            const expandeds = data.dataSource.map((item: Omix) => item.keyId)
            const selecteds = expandeds.filter((e: Omix, index: number) => [0].includes(index))
            return await sheetOptions.setState({ selectedKeys: selecteds, expandedKeys: expandeds }).then(async (event: Omix) => {
                return await setForm({ pid: selecteds[0] ?? undefined }).then(async () => {
                    return await instOptions.fetchRequest()
                })
            })
        }

        /**左侧树展开变更回调**/
        async function fetchUpdateExpanded(keys: Array<string>) {
            return await sheetOptions.setState({ expandedKeys: keys as never })
        }

        /**左侧树选中变更回调**/
        async function fetchUpdateSelected(keys: Array<string>) {
            return await sheetOptions.setState({ selectedKeys: keys }).then(async () => {
                return await setForm({ pid: keys[0] as never }).then(() => {
                    return fetchRefresh({ page: 1, size: state.size })
                })
            })
        }

        /**新增菜单/按钮**/
        async function fetchDeploySheetCreate() {
            return await feedback.fetchDeploySystemSheet({
                title: '新增菜单/按钮',
                command: 'CREATE',
                async onSubmit() {
                    return await Promise.all([sheetOptions.fetchRequest(), fetchRefresh()])
                }
            })
        }

        /**编辑菜单、按钮**/
        async function fetchDeploySheetUpdate() {
            return await feedback.fetchDeploySystemSheet({
                title: '编辑菜单/按钮',
                command: 'UPDATE',
                node: state.select[0],
                async onSubmit() {
                    return await Promise.all([sheetOptions.fetchRequest(), fetchRefresh()])
                }
            })
        }

        /**克隆菜单、按钮**/
        async function fetchDeploySheetClone() {
            return await feedback.fetchDeploySystemSheet({
                title: '克隆菜单/按钮',
                command: 'CLONE',
                node: state.select[0],
                async onSubmit() {
                    return await Promise.all([sheetOptions.fetchRequest(), fetchRefresh()])
                }
            })
        }

        /**删除菜单/按钮**/
        async function fetchDeploySheetDelete() {
            const node = state.select[0]
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认删除菜单【${node.name}】吗？删除后将同时删除子菜单/按钮，且无法恢复！`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSystemDeleteSheet({ keyId: node.keyId })
                            await Promise.all([sheetOptions.fetchRequest(), fetchRefresh()])
                            return await done({ visible: false })
                        } catch (err) {
                            await done({ loading: false })
                            return await fetchNotifyService({ type: 'error', title: err.message })
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
                    content-class="flex flex-col flex-1 overflow-hidden! p-block-14 p-is-14"
                >
                    <n-card class="flex-1 overflow-hidden" content-class="flex flex-col flex-1 p-inline-0! p-block-14! overflow-hidden">
                        <common-element-wrapper opacity={0} loading={sheetOptions.state.loading}>
                            <n-scrollbar trigger="none" class="flex-1 overflow-hidden">
                                <n-element class="p-inline-14">
                                    <n-tree
                                        block-line
                                        cancelable={false}
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
                        </common-element-wrapper>
                    </n-card>
                </n-layout-sider>
                <n-layout class="bg-transparent" content-class="flex flex-col flex-1 p-14 gap-14 overflow-hidden">
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
                                <common-element-button type="primary" onClick={fetchDeploySheetCreate}>
                                    新增
                                </common-element-button>
                                <common-element-button
                                    dashed
                                    type="primary"
                                    disabled={instState.value.isUpdate}
                                    onClick={fetchDeploySheetUpdate}
                                >
                                    编辑
                                </common-element-button>
                                <common-element-button
                                    dashed
                                    type="primary"
                                    disabled={instState.value.isClone}
                                    onClick={fetchDeploySheetClone}
                                >
                                    克隆
                                </common-element-button>
                                <common-element-button
                                    dashed
                                    type="error"
                                    disabled={instState.value.isDelete}
                                    onClick={fetchDeploySheetDelete}
                                >
                                    删除
                                </common-element-button>
                            </common-database-search-function>
                            <common-database-search-column disabled prop="name" label="菜单名称">
                                <form-common-column-input
                                    clearable
                                    placeholder="请输入菜单名称"
                                    v-model:value={formState.value.name}
                                    on-submit={fetchRefresh}
                                ></form-common-column-input>
                            </common-database-search-column>
                            <common-database-search-column prop="keyName" label="权限标识">
                                <form-common-column-input
                                    clearable
                                    placeholder="请输入权限标识"
                                    v-model:value={formState.value.keyName}
                                    on-submit={fetchRefresh}
                                ></form-common-column-input>
                            </common-database-search-column>
                            <common-database-search-column prop="router" label="菜单地址">
                                <form-common-column-input
                                    clearable
                                    placeholder="请输入菜单地址"
                                    v-model:value={formState.value.router}
                                    on-submit={fetchRefresh}
                                ></form-common-column-input>
                            </common-database-search-column>
                            <common-database-search-column prop="version" label="版本号">
                                <form-common-column-input
                                    clearable
                                    placeholder="请输入版本号"
                                    v-model:value={formState.value.version}
                                    on-submit={fetchRefresh}
                                ></form-common-column-input>
                            </common-database-search-column>
                        </common-database-search>
                    </n-layout-header>
                    <n-layout-content class="flex flex-col flex-1 bg-transparent" content-class="flex flex-col flex-1">
                        <common-database-table
                            class="p-0!"
                            show-select
                            show-settings
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
                                col_iconName: (data: Omix) => (
                                    <div class="flex items-center justify-center">
                                        {isEmpty(data.iconName) ? (
                                            <span>-</span>
                                        ) : (
                                            <common-element-icon size={26} name={data.iconName}></common-element-icon>
                                        )}
                                    </div>
                                ),
                                col_createBy: (data: Omix) => (
                                    <common-database-table-user element="text" data={data.createByOptions}></common-database-table-user>
                                ),
                                col_modifyBy: (data: Omix) => (
                                    <common-database-table-user element="text" data={data.modifyByOptions}></common-database-table-user>
                                ),
                                col_chunk: (data: Omix) => (
                                    <common-database-table-chunk
                                        element="chunk"
                                        value={data.chunk}
                                        options={chunkState.CHUNK_SHEET_CHUNK}
                                    ></common-database-table-chunk>
                                ),
                                col_status: (data: Omix) => (
                                    <common-database-table-chunk
                                        element="chunk"
                                        value={data.status}
                                        options={chunkState.CHUNK_SHEET_STATUS}
                                    ></common-database-table-chunk>
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
