<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, useSelectService, pick, stop } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/nexus/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSimbankManager',
    setup(props) {
        /**设备静态枚举、设备型号字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSrmSimbankEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_SRM_SIMBANK_MODEL'],
            immediate: true
        })
        /**归属供应商下拉**/
        const userOptions = useSelectService(e => Service.httpBaseSrmSelectUser(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, router, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnSimbank({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:simbank:manager',
                actions: [
                    { title: '编辑', key: 'chat:nexus:simbank:manager:update' },
                    { title: '启用/禁用', key: 'chat:nexus:simbank:manager:status' }
                ],
                formState: {
                    /**设备型号**/
                    model: undefined,
                    /**归属供应商**/
                    userKeyId: undefined,
                    /**设备状态**/
                    status: undefined,
                    /**在线状态**/
                    online: undefined
                },
                columns: [
                    { title: '设备ID', key: 'keyId', width: 100, disabled: true },
                    { title: '设备名称', key: 'name', minWidth: 200, disabled: true },
                    { title: '设备别名', key: 'alias', width: 160 },
                    { title: 'MAC地址', key: 'mac', width: 160 },
                    { title: '在线状态', key: 'online', width: 100 },
                    { title: '设备状态', key: 'status', width: 100 },
                    { title: '设备型号', key: 'model', width: 100 },
                    { title: '端口数', key: 'total', width: 100 },
                    { title: '归属供应商', key: 'userKeyId', width: 200 },
                    { title: '归属人', key: 'ownerUserUid', width: 120 },
                    { title: '归属部门', key: 'ownerOrganizations', width: 160 },
                    { title: '创建人', key: 'createBy', width: 120, check: false },
                    { title: '创建时间', key: 'createTime', width: 160, check: false },
                    { title: '更新人', key: 'modifyBy', width: 120, check: false },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        /**跳转客户详情**/
        async function fetchJumpContextSupplier(event: MouseEvent, data: Omix) {
            return await stop(event, async () => {
                return await router.push({
                    path: `/srm/supplier/context/${data.keyId}`,
                    state: { tabTitle: data.name }
                })
            })
        }

        /**新增设备**/
        async function fetchCreateNexusSimbankManager() {
            return await feedback.fetchNexusSimbankManager({
                title: '新增设备',
                command: 'CREATE',
                onSubmit: () => fetchRefresh()
            })
        }

        /**编辑设备**/
        async function fetchUpdateNexusSimbankManager(node: Omix) {
            return await feedback.fetchNexusSimbankManager({
                title: '编辑设备',
                command: 'UPDATE',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**启用、禁用设备**/
        async function fetchUpdateNexusSimbankStatus(node: Omix, status: string) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认${['enable'].includes(status) ? '启用' : '禁用'}设备【${node.name}】吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmSimbankStatusUpdate({ keyId: node.keyId, status })
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
        }

        return () => (
            <layout-common-container initialize={state.initialize}>
                <common-database-search
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy', 'abstract']}
                    ref={formRef}
                    label-width={85}
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
                        <common-base-authorize key-name="chat:nexus:simbank:manager:create">
                            <common-base-button class="min-w-80" type="primary" onClick={fetchCreateNexusSimbankManager}>
                                新增
                            </common-base-button>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column prop="userKeyId" label="归属供应商">
                        <form-base-select
                            clearable
                            filterable
                            label-field="name"
                            label-value="keyId"
                            placeholder="请选择归属供应商"
                            loading={userOptions.loading.value}
                            options={userOptions.dataSource.value}
                            v-model:value={formState.value.userKeyId}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="model" label="设备型号">
                        <form-base-select
                            clearable
                            label-field="label"
                            label-value="value"
                            placeholder="请选择设备型号"
                            loading={chunkState.loading}
                            options={chunkState.CHUNK_SRM_SIMBANK_MODEL.options}
                            v-model:value={formState.value.model}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="设备状态">
                        <form-base-select
                            clearable
                            placeholder="请选择设备状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="online" label="在线状态">
                        <form-base-select
                            clearable
                            placeholder="请选择在线状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.onlineOptions}
                            v-model:value={formState.value.online}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-settings
                    show-command={instState.value.showCommand}
                    limit={state.limit}
                    total={state.total}
                    columns={state.columns}
                    v-model:page={state.page}
                    v-model:size={state.size}
                    v-model:select={state.select}
                    v-model:data={state.dataSource}
                    v-model:loading={state.loading}
                    v-model:initialize={state.initialize}
                    v-model:customize={state.customize}
                    on-update:customize={instOptions.fetchUpdateCustomize}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                >
                    {{
                        col_model: (data: Omix) => (
                            <common-base-chunk value={data.model} items={chunkState.CHUNK_SRM_SIMBANK_MODEL.options}></common-base-chunk>
                        ),
                        col_online: (data: Omix) => (
                            <common-base-chunk value={data.online} items={chunkOptions.value.onlineOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_userKeyId: (data: Omix) => (
                            <common-base-content ellipsis value={data.userKeyIdOptions?.name}>
                                <n-text
                                    class="cursor-pointer"
                                    type="info"
                                    onClick={(e: MouseEvent) => fetchJumpContextSupplier(e, data.userKeyIdOptions)}
                                >
                                    {data.userKeyIdOptions?.name}
                                </n-text>
                            </common-base-content>
                        ),
                        col_ownerUserUid: (data: Omix) => {
                            return <common-base-user element="text" data={data.ownerUserUidOptions}></common-base-user>
                        },
                        col_ownerOrganizations: (data: Omix) => {
                            return <common-base-content value={data.ownerUserUidOptions?.organizations}></common-base-content>
                        },
                        col_createBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.createByOptions}></common-base-user>
                        },
                        col_modifyBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.modifyByOptions}></common-base-user>
                        },
                        col_command: (data: Omix) => (
                            <common-base-element abstract class="flex items-center gap-x-10 overflow-hidden">
                                <common-base-authorize key-name={state.actions[0].key}>
                                    <common-base-button text title="编辑" type="info" onClick={() => fetchUpdateNexusSimbankManager(data)}>
                                        编辑
                                    </common-base-button>
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[1].key}>
                                    {['enable'].includes(data.status) ? (
                                        <common-base-button
                                            text
                                            title="禁用"
                                            type="error"
                                            onClick={() => fetchUpdateNexusSimbankStatus(data, 'disable')}
                                        >
                                            禁用
                                        </common-base-button>
                                    ) : (
                                        <common-base-button
                                            text
                                            title="启用"
                                            type="success"
                                            onClick={() => fetchUpdateNexusSimbankStatus(data, 'enable')}
                                        >
                                            启用
                                        </common-base-button>
                                    )}
                                </common-base-authorize>
                            </common-base-element>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
