<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, useSelectService, pick, stop } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/nexus/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSimbankPort',
    setup(props) {
        /**端口静态枚举、设备型号字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSrmSimbankPortEnums(), {
            immediate: true
        })
        /**归属供应商下拉**/
        const userOptions = useSelectService(e => Service.httpBaseSrmSelectUser(), {
            immediate: true
        })
        /**设备下拉**/
        const simbankOptions = useSelectService(e => Service.httpBaseSrmSelectSimbank({ name: e.keywords || undefined }), {
            immediate: true,
            transform: list => list.map(item => ({ ...item, label: `[${item.alias}] ${item.name}` }))
        })
        /**激活方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, router, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnSimbankPort({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:simbank:port',
                actions: [
                    { title: '启用/禁用', key: 'chat:nexus:simbank:port:status' },
                    { title: '插卡/拔卡', key: 'chat:nexus:simbank:port:insert' },
                    { title: '激活/释放', key: 'chat:nexus:simbank:port:activate' }
                ],
                formState: {
                    /**SIM/ICCID/IMEI/端口编号/设备名称/别名/MAC/设备ID**/
                    name: undefined,
                    /**所属设备**/
                    simbankKeyId: undefined,
                    /**归属供应商**/
                    userKeyId: undefined,
                    /**激活状态**/
                    activateStatus: undefined,
                    /**插卡状态**/
                    insertStatus: undefined,
                    /**端口状态**/
                    status: undefined,
                    /**激活方向**/
                    countryKeyId: undefined
                },
                columns: [
                    { title: '端口ID', key: 'keyId', width: 100, disabled: true },
                    { title: '端口编号', key: 'port', width: 100 },
                    { title: '所属设备', key: 'simbankKeyId', minWidth: 220, disabled: true },
                    { title: 'SIM卡号', key: 'sim', width: 160 },
                    { title: 'ICCID', key: 'iccid', width: 200 },
                    { title: 'IMEI', key: 'imei', width: 160 },
                    { title: '激活方向', key: 'countryKeyId', width: 220 },
                    { title: '激活状态', key: 'activateStatus', width: 100 },
                    { title: '插卡状态', key: 'insertStatus', width: 100 },
                    { title: '端口状态', key: 'status', width: 100 },
                    { title: '归属供应商', key: 'userKeyId', width: 200 },
                    { title: '归属人', key: 'ownerUserUid', width: 120 },
                    { title: '归属部门', key: 'ownerOrganizations', width: 160 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        /**跳转供应商详情**/
        async function fetchJumpContextSupplier(event: MouseEvent, data: Omix) {
            return await stop(event, async () => {
                return await router.push({
                    path: `/srm/supplier/context/${data.keyId}`,
                    state: { tabTitle: data.name }
                })
            })
        }

        /**端口展示名称**/
        function fetchPortLabel(node: Omix) {
            const device = [node.simbankOptions?.alias, node.simbankOptions?.name].filter(Boolean).join(' / ')
            return [device, `端口${node.port}`].filter(Boolean).join(' - ')
        }

        /**插入 SIM 卡**/
        async function fetchInsertNexusSimbankPort(node: Omix) {
            return await feedback.fetchNexusSimbankPortInsert({
                title: '插入SIM卡',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**激活 SIM 卡**/
        async function fetchActivateNexusSimbankPort(node: Omix) {
            return await feedback.fetchNexusSimbankPortActivate({
                title: '激活SIM卡',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**拔出 SIM 卡**/
        async function fetchRemoveNexusSimbankPort(node: Omix) {
            return await fetchDialogService({
                title: '拔出SIM卡',
                content: `确认拔出【${fetchPortLabel(node)}】吗？拔卡后将清除 SIM、ICCID、IMEI。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmSimbankPortRemove({ keyId: node.keyId })
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

        /**释放已激活端口**/
        async function fetchReleaseNexusSimbankPort(node: Omix) {
            return await fetchDialogService({
                title: '释放端口',
                content: `确认释放【${fetchPortLabel(node)}】吗？释放后将清除卡号、激活状态和激活方向。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmSimbankPortRelease({ keyId: node.keyId })
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

        /**启用、禁用端口**/
        async function fetchUpdateNexusSimbankPortStatus(node: Omix, status: string) {
            return await fetchDialogService({
                title: ['enable'].includes(status) ? '启用端口' : '禁用端口',
                content: `确认${['enable'].includes(status) ? '启用' : '禁用'}【${fetchPortLabel(node)}】吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmSimbankPortStatusUpdate({ keyId: node.keyId, status })
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
                    function={['search', 'restore', 'collapse', 'deploy']}
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
                    <common-database-search-column disabled prop="name" label="关键词">
                        <form-base-input
                            clearable
                            placeholder="SIM/ICCID/IMEI/端口/设备"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="simbankKeyId" label="所属设备">
                        <form-base-select
                            clearable
                            filterable
                            label-field="label"
                            label-value="keyId"
                            placeholder="请选择所属设备"
                            loading={simbankOptions.loading.value}
                            options={simbankOptions.dataSource.value}
                            v-model:value={formState.value.simbankKeyId}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
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
                    <common-database-search-column prop="activateStatus" label="激活状态">
                        <form-base-select
                            clearable
                            placeholder="请选择激活状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.activateStatusOptions}
                            v-model:value={formState.value.activateStatus}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="insertStatus" label="插卡状态">
                        <form-base-select
                            clearable
                            placeholder="请选择插卡状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.insertStatusOptions}
                            v-model:value={formState.value.insertStatus}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="端口状态">
                        <form-base-select
                            clearable
                            placeholder="请选择端口状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="countryKeyId" label="激活方向">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择激活方向"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
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
                        col_simbankKeyId: (data: Omix) => (
                            <common-base-content ellipsis value={data.simbankOptions?.name}>
                                {[data.simbankOptions?.alias, data.simbankOptions?.name].filter(Boolean).join(' / ')}
                            </common-base-content>
                        ),
                        col_activateStatus: (data: Omix) => (
                            <common-base-chunk
                                value={data.activateStatus}
                                items={chunkOptions.value.activateStatusOptions}
                            ></common-base-chunk>
                        ),
                        col_countryKeyId: (data: Omix) => {
                            const country = countryOptions.dataSource.value.find((item: Omix) => item.keyId === data.countryKeyId)
                            return <common-base-content value={country?.showName}></common-base-content>
                        },
                        col_insertStatus: (data: Omix) => (
                            <common-base-chunk value={data.insertStatus} items={chunkOptions.value.insertStatusOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_userKeyId: (data: Omix) => (
                            <common-base-content ellipsis value={data.simbankOptions?.userKeyIdOptions?.name}>
                                <n-text
                                    class="cursor-pointer"
                                    type="info"
                                    onClick={(e: MouseEvent) =>
                                        data.simbankOptions?.userKeyIdOptions?.keyId &&
                                        fetchJumpContextSupplier(e, data.simbankOptions.userKeyIdOptions)
                                    }
                                >
                                    {data.simbankOptions?.userKeyIdOptions?.name}
                                </n-text>
                            </common-base-content>
                        ),
                        col_ownerUserUid: (data: Omix) => {
                            return <common-base-user element="text" data={data.simbankOptions?.ownerUserUidOptions}></common-base-user>
                        },
                        col_ownerOrganizations: (data: Omix) => {
                            return (
                                <common-base-content value={data.simbankOptions?.ownerUserUidOptions?.organizations}></common-base-content>
                            )
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
                                    {['enable'].includes(data.status) ? (
                                        <common-base-button
                                            {...{ text: true, type: 'warning', title: '禁用', content: '禁用' }}
                                            onClick={() => fetchUpdateNexusSimbankPortStatus(data, 'disable')}
                                        />
                                    ) : (
                                        <common-base-button
                                            {...{ text: true, type: 'success', title: '启用', content: '启用' }}
                                            onClick={() => fetchUpdateNexusSimbankPortStatus(data, 'enable')}
                                        />
                                    )}
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[1].key}>
                                    {['inserted'].includes(data.insertStatus) ? (
                                        <common-base-button
                                            {...{ text: true, type: 'orange', title: '拔卡', content: '拔卡' }}
                                            onClick={() => fetchRemoveNexusSimbankPort(data)}
                                        />
                                    ) : (
                                        <common-base-button
                                            {...{ text: true, type: 'info', content: '插卡' }}
                                            title={['inactive'].includes(data.activateStatus) ? '激活端口后才能插卡' : '插卡'}
                                            disabled={['inactive'].includes(data.activateStatus)}
                                            onClick={() => fetchInsertNexusSimbankPort(data)}
                                        />
                                    )}
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[2].key}>
                                    {['inactive'].includes(data.activateStatus) ? (
                                        <common-base-button
                                            {...{ text: true, type: 'success', title: '激活', content: '激活' }}
                                            onClick={() => fetchActivateNexusSimbankPort(data)}
                                        />
                                    ) : (
                                        <common-base-button
                                            {...{ text: true, type: 'error', title: '释放', content: '释放' }}
                                            onClick={() => fetchReleaseNexusSimbankPort(data)}
                                        />
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
