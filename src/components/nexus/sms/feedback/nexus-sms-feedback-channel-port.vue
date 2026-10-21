<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useChunkService, useState, pick } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/nexus/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackChannelPort',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**通道**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { state: dialog, setState: setDialog } = useState({ visible: true, loading: false, initialize: false })
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmChannelEnums(), { immediate: true })
        const portEnums = useChunkService(() => Service.httpBaseSrmSimbankPortEnums(), { immediate: true })
        const { formState, state, fetchRefresh } = useColumnService(
            (base, payload) =>
                Service.httpBaseSrmColumnChannelPort({ ...payload, ...pick(base, ['page', 'size']), channelKeyId: props.node.keyId }),
            {
                size: 20,
                formState: {
                    /**SIM/ICCID/设备名称或别名**/
                    name: undefined,
                    /**绑定状态**/
                    status: undefined
                },
                columns: [
                    { title: '所属设备', key: 'simbankKeyId', minWidth: 180 },
                    { title: '端口', key: 'port', width: 70 },
                    { title: 'SIM卡号', key: 'sim', width: 150 },
                    { title: '端口状态', key: 'portStatus', width: 90 },
                    { title: '激活', key: 'activateStatus', width: 80 },
                    { title: '设备在线', key: 'online', width: 90 },
                    { title: '权重', key: 'weight', width: 110 },
                    { title: '绑定状态', key: 'status', width: 90 },
                    { title: '操作', key: 'command', width: 80 }
                ]
            }
        )

        /**修改端口权重或绑定状态**/
        async function fetchUpdatePort(node: Omix, value: Omix) {
            try {
                await Service.httpBaseSrmUpdateChannelPort({ keyId: node.keyId, weight: node.weight, status: node.status, ...value })
                await fetchNotifyService({ title: '操作成功' })
                await emit('submit', { done: setDialog })
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            }
            return await fetchRefresh()
        }

        /**绑定端口**/
        async function fetchBindPort() {
            return await feedback.fetchNexusSmsChannelPortBind({
                title: `绑定端口：${props.node.alias}`,
                node: props.node,
                onSubmit: async () => {
                    await emit('submit', { done: setDialog })
                    return await fetchRefresh()
                }
            })
        }

        /**解绑端口**/
        async function fetchUnbindPort(node: Omix) {
            return await fetchDialogService({
                title: '解绑端口',
                content: `确认把【${node.portOptions?.port ?? node.portKeyId}】号端口从通道解绑吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmUnbindChannelPort({ keyIds: [node.keyId] })
                            return await done({ visible: false }).then(async () => {
                                await fetchNotifyService({ title: '操作成功' })
                                await emit('submit', { done: setDialog })
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

        /**权重输入框失焦时保存**/
        function fetchWeightBlur(node: Omix, event: FocusEvent) {
            const weight = Number((event.target as HTMLInputElement).value)
            if (Number.isInteger(weight) && weight >= 1 && weight <= 100 && weight !== node.weight) {
                return fetchUpdatePort(node, { weight })
            }
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={1000}
                show-footer={false}
                v-model:visible={dialog.visible}
                v-model:loading={dialog.loading}
                v-model:initialize={dialog.initialize}
                onCancel={() => setDialog({ visible: false })}
                onClose={() => emit('close', { done: setDialog })}
            >
                <div class="flex flex-col gap-12">
                    <div class="flex gap-12">
                        <form-base-input
                            clearable
                            class="flex-1"
                            placeholder="SIM/ICCID/设备名称或别名"
                            v-model:value={formState.value.name}
                            on-submit={() => fetchRefresh({ page: 1 })}
                        ></form-base-input>
                        <form-base-select
                            clearable
                            class="w-160!"
                            placeholder="绑定状态"
                            options={chunkOptions.value.portStatusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={() => fetchRefresh({ page: 1 })}
                        ></form-base-select>
                        <common-base-authorize key-name="chat:nexus:sms:channel:port">
                            <common-base-button type="primary" onClick={fetchBindPort}>
                                绑定端口
                            </common-base-button>
                        </common-base-authorize>
                    </div>
                    <common-database-table
                        flex-height={false}
                        limit={0}
                        bordered={false}
                        total={state.total}
                        columns={state.columns}
                        v-model:page={state.page}
                        v-model:size={state.size}
                        v-model:select={state.select}
                        v-model:data={state.dataSource}
                        v-model:loading={state.loading}
                        v-model:initialize={state.initialize}
                        on-update:page={(page: number) => fetchRefresh({ page })}
                        on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                    >
                        {{
                            col_simbankKeyId: (data: Omix) => (
                                <common-base-content
                                    value={[data.simbankOptions?.alias, data.simbankOptions?.name].filter(Boolean).join(' / ')}
                                ></common-base-content>
                            ),
                            col_port: (data: Omix) => <common-base-content value={data.portOptions?.port}></common-base-content>,
                            col_sim: (data: Omix) => <common-base-content value={data.portOptions?.sim}></common-base-content>,
                            col_portStatus: (data: Omix) => (
                                <common-base-chunk
                                    value={data.portOptions?.status}
                                    items={portEnums.chunkOptions.value.statusOptions}
                                ></common-base-chunk>
                            ),
                            col_activateStatus: (data: Omix) => (
                                <common-base-chunk
                                    value={data.portOptions?.activateStatus}
                                    items={portEnums.chunkOptions.value.activateStatusOptions}
                                ></common-base-chunk>
                            ),
                            col_online: (data: Omix) => (
                                <n-text type={data.simbankOptions?.online === 'online' ? 'success' : 'default'}>
                                    {data.simbankOptions?.online === 'online' ? '在线' : '离线'}
                                </n-text>
                            ),
                            col_weight: (data: Omix) => (
                                <n-input-number
                                    size="small"
                                    min={1}
                                    max={100}
                                    value={data.weight}
                                    onBlur={(event: FocusEvent) => fetchWeightBlur(data, event)}
                                ></n-input-number>
                            ),
                            col_status: (data: Omix) => (
                                <n-switch
                                    size="small"
                                    value={data.status === 'enable'}
                                    onUpdate:value={(value: boolean) => fetchUpdatePort(data, { status: value ? 'enable' : 'disable' })}
                                ></n-switch>
                            ),
                            col_command: (data: Omix) => (
                                <common-base-authorize key-name="chat:nexus:sms:channel:port">
                                    <common-base-button text type="error" title="解绑" onClick={() => fetchUnbindPort(data)}>
                                        解绑
                                    </common-base-button>
                                </common-base-authorize>
                            )
                        }}
                    </common-database-table>
                </div>
            </common-dialog-provider>
        )
    }
})
</script>
