<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, pick } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/nexus/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsChannel',
    setup(props) {
        /**通道静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(() => Service.httpBaseSrmChannelEnums(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, router, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnChannel({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:sms:channel',
                actions: [
                    { title: '编辑', key: 'chat:nexus:sms:channel:update' },
                    { title: '端口', key: 'chat:nexus:sms:channel:port' },
                    { title: '启用/停用', key: 'chat:nexus:sms:channel:status' },
                    { title: '删除', key: 'chat:nexus:sms:channel:delete' }
                ],
                formState: {
                    /**通道别名**/
                    alias: undefined,
                    /**通道类型**/
                    type: undefined,
                    /**通道状态**/
                    status: undefined
                },
                columns: [
                    { title: '通道ID', key: 'keyId', width: 120, disabled: true },
                    { title: '通道别名', key: 'alias', width: 180, disabled: true },
                    { title: '通道名称', key: 'name', minWidth: 180, disabled: true },
                    { title: '通道类型', key: 'type', minWidth: 120 },
                    { title: '归属人', key: 'ownerUserUid', minWidth: 120 },
                    { title: '通道状态', key: 'status', minWidth: 120 },
                    { title: '端口', key: 'portCount', minWidth: 120 },
                    { title: '引用路由', key: 'routeCount', minWidth: 120 },
                    { title: '发送间隔', key: 'sendInterval', minWidth: 120 },
                    { title: '最大重试', key: 'maxRetry', minWidth: 120 },
                    { title: '备注', key: 'remark', width: 200, check: false },
                    { title: '创建人', key: 'createBy', width: 120, check: false },
                    { title: '创建时间', key: 'createTime', width: 160, check: false },
                    { title: '更新人', key: 'modifyBy', width: 120, check: false },
                    { title: '更新时间', key: 'modifyTime', width: 160, check: false }
                ]
            }
        )

        /**新增通道**/
        async function fetchCreateChannel() {
            return await feedback.fetchNexusSmsChannel({
                title: '新增通道',
                command: 'CREATE',
                onSubmit: fetchRefresh
            })
        }

        /**编辑通道**/
        async function fetchUpdateChannel(node: Omix) {
            return await feedback.fetchNexusSmsChannel({
                title: '编辑通道',
                command: 'UPDATE',
                node,
                onSubmit: fetchRefresh
            })
        }

        /**通道端口管理**/
        async function fetchChannelPort(node: Omix) {
            return await feedback.fetchNexusSmsChannelPort({
                title: `通道端口：${node.alias}`,
                node,
                onSubmit: fetchRefresh
            })
        }

        /**确认后执行操作并刷新列表**/
        async function fetchConfirm(title: string, content: string, handler: () => Promise<unknown>) {
            return await fetchDialogService({
                title,
                content,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await handler()
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

        /**启用、停用通道**/
        async function fetchUpdateStatus(node: Omix, status: string) {
            return await fetchConfirm(
                status === 'enable' ? '启用通道' : '停用通道',
                status === 'enable'
                    ? `确认启用通道【${node.alias}】吗？启用后可被路由选中接收该方向的短信。`
                    : `确认停用通道【${node.alias}】吗？停用后不再消费，已排队的短信保留在通道队列。`,
                () => Service.httpBaseSrmChannelStatusUpdate({ keyId: node.keyId, status })
            )
        }

        /**删除通道**/
        async function fetchDeleteChannel(node: Omix) {
            return await fetchConfirm('删除通道', `确认删除通道【${node.alias}】吗？需先停用、从路由移除并解绑全部端口。`, () =>
                Service.httpBaseSrmDeleteChannel({ keyId: node.keyId })
            )
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
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-authorize key-name="chat:nexus:sms:channel:create">
                            <common-base-button class="min-w-80" type="primary" onClick={fetchCreateChannel}>
                                新增
                            </common-base-button>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="alias" label="通道别名">
                        <form-base-input
                            clearable
                            placeholder="请输入通道别名"
                            v-model:value={formState.value.alias}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>

                    <common-database-search-column prop="type" label="通道类型">
                        <form-base-select
                            clearable
                            placeholder="请选择通道类型"
                            loading={chunkState.loading}
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="通道状态">
                        <form-base-select
                            clearable
                            placeholder="请选择通道状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
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
                        col_portCount: (data: Omix) => {
                            return <common-base-content value={data.portCount}>{data.portCount}</common-base-content>
                        },

                        col_type: (data: Omix) => (
                            <common-base-chunk value={data.type} items={chunkOptions.value.typeOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_ownerUserUid: (data: Omix) => (
                            <common-base-user element="text" data={data.ownerUserUidOptions}></common-base-user>
                        ),
                        col_sendInterval: (data: Omix) => (
                            <common-base-content value={`${data.sendInterval ?? 0} ms`}>
                                {`${data.sendInterval ?? 0} ms`}
                            </common-base-content>
                        ),
                        col_createBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.createByOptions}></common-base-user>
                        },
                        col_modifyBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.modifyByOptions}></common-base-user>
                        },
                        col_command: (data: Omix) => (
                            <common-base-element abstract class="flex items-center gap-x-10 overflow-hidden">
                                <common-base-authorize key-name={state.actions[0].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'info', title: '编辑', content: '编辑' }}
                                        onClick={() => fetchUpdateChannel(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[1].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'primary', title: '端口', content: '端口' }}
                                        onClick={() => fetchChannelPort(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[2].key}>
                                    {data.status === 'enable' ? (
                                        <common-base-button
                                            {...{ text: true, type: 'warning', title: '停用', content: '停用' }}
                                            onClick={() => fetchUpdateStatus(data, 'disable')}
                                        />
                                    ) : (
                                        <common-base-button
                                            {...{ text: true, type: 'success', title: '启用', content: '启用' }}
                                            onClick={() => fetchUpdateStatus(data, 'enable')}
                                        />
                                    )}
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[3].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'error', content: '删除' }}
                                        title={data.status === 'enable' ? '请先停用通道' : '删除'}
                                        disabled={data.status === 'enable'}
                                        onClick={() => fetchDeleteChannel(data)}
                                    />
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
