<script lang="tsx">
import { defineComponent, PropType, ref, computed, onMounted } from 'vue'
import { useChunkService, useState } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRouteChannel',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**路由**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { state: dialog, setState: setDialog } = useState({ visible: true, loading: false, initialize: false })
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmChannelEnums(), { immediate: true })
        const routeEnums = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        /**路由下的通道**/
        const dataSource = ref<Array<Omix>>([])
        const loading = ref(false)
        /**全部通道**/
        const channels = ref<Array<Omix>>([])
        /**待加入的通道**/
        const channelKeyId = ref<number>()
        /**可加入的通道：方向和类型与路由一致，且未加入**/
        const channelOptions = computed(() => {
            const joined = new Set(dataSource.value.map(item => item.channelKeyId))
            return channels.value
                .filter(item => item.countryKeyId === props.node.countryKeyId && item.type === props.node.type && !joined.has(item.keyId))
                .map(item => ({ ...item, disabled: false }))
        })
        const columns = [
            { title: '通道别名', key: 'alias', minWidth: 180 },
            { title: '通道状态', key: 'channelStatus', width: 100 },
            { title: '启用端口', key: 'enablePortCount', width: 90 },
            { title: '优先级', key: 'priority', width: 120 },
            { title: '权重', key: 'weight', width: 120 },
            { title: '同级占比', key: 'ratio', width: 90 },
            { title: '状态', key: 'status', width: 80 },
            { title: '操作', key: 'command', width: 80 }
        ]

        onMounted(async () => {
            await Promise.all([fetchRefresh(), fetchChannels()])
        })

        /**查询全部通道**/
        async function fetchChannels() {
            try {
                const { data } = await Service.httpBaseSrmSelectChannel()
                channels.value = data ?? []
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            }
        }

        /**刷新路由通道**/
        async function fetchRefresh() {
            loading.value = true
            try {
                const { data } = await Service.httpBaseSrmListRouteChannel({ routeKeyId: props.node.keyId })
                dataSource.value = data ?? []
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            } finally {
                loading.value = false
            }
        }

        /**加入通道：默认主通道，权重 100**/
        async function fetchCreate() {
            if (!channelKeyId.value) return await fetchNotifyService({ type: 'warning', title: '请选择通道' })
            try {
                await Service.httpBaseSrmCreateRouteChannel({ routeKeyId: props.node.keyId, channelKeyId: channelKeyId.value })
                channelKeyId.value = undefined
                await fetchNotifyService({ title: '操作成功' })
                await emit('submit', { done: setDialog })
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            }
            return await fetchRefresh()
        }

        /**修改优先级、权重或状态**/
        async function fetchUpdate(node: Omix, value: Omix) {
            try {
                await Service.httpBaseSrmUpdateRouteChannel({
                    keyId: node.keyId,
                    priority: node.priority,
                    weight: node.weight,
                    status: node.status,
                    ...value
                })
                await emit('submit', { done: setDialog })
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            }
            return await fetchRefresh()
        }

        /**数字输入失焦后保存**/
        async function fetchNumberBlur(node: Omix, key: 'priority' | 'weight', max: number, event: FocusEvent) {
            const value = Number((event.target as HTMLInputElement).value)
            if (Number.isInteger(value) && value >= 1 && value <= max && value !== node[key]) {
                return await fetchUpdate(node, { [key]: value })
            }
        }

        /**移除通道**/
        async function fetchDelete(node: Omix) {
            return await fetchDialogService({
                title: '移除通道',
                content: `确认把通道【${node.channelOptions?.alias ?? node.channelKeyId}】从路由移除吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmDeleteRouteChannel({ keyId: node.keyId })
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

        return () => (
            <common-dialog-provider
                title={props.title}
                width={960}
                show-footer={false}
                v-model:visible={dialog.visible}
                v-model:loading={dialog.loading}
                v-model:initialize={dialog.initialize}
                onCancel={() => setDialog({ visible: false })}
                onClose={() => emit('close', { done: setDialog })}
            >
                <div class="flex flex-col gap-12">
                    <common-base-authorize key-name="chat:nexus:sms:route:channel">
                        <div class="flex gap-12">
                            <form-base-select
                                clearable
                                filterable
                                class="flex-1"
                                label-field="alias"
                                label-value="keyId"
                                placeholder="选择同方向、同类型的通道加入路由"
                                options={channelOptions.value}
                                v-model:value={channelKeyId.value}
                            ></form-base-select>
                            <common-base-button type="primary" onClick={fetchCreate}>
                                加入通道
                            </common-base-button>
                        </div>
                    </common-base-authorize>
                    <n-text depth="3">
                        优先级 1 为主通道，数字越大越靠后；同优先级按权重分流，该级没有可用通道时降级到下一优先级，全部不可用进入待分配。
                    </n-text>
                    <common-database-table
                        flex-height={false}
                        limit={0}
                        bordered={false}
                        pagination={false}
                        columns={columns}
                        data={dataSource.value}
                        loading={loading.value}
                        initialize={false}
                    >
                        {{
                            col_alias: (data: Omix) => <common-base-content value={data.channelOptions?.alias}></common-base-content>,
                            col_channelStatus: (data: Omix) => (
                                <common-base-chunk
                                    bordered
                                    value={data.channelOptions?.status}
                                    items={chunkOptions.value.statusOptions}
                                ></common-base-chunk>
                            ),
                            col_enablePortCount: (data: Omix) => (
                                <n-text type={data.channelOptions?.enablePortCount > 0 ? 'default' : 'warning'}>
                                    {data.channelOptions?.enablePortCount ?? 0}
                                </n-text>
                            ),
                            col_priority: (data: Omix) => (
                                <n-input-number
                                    size="small"
                                    min={1}
                                    max={9}
                                    value={data.priority}
                                    onBlur={(event: FocusEvent) => fetchNumberBlur(data, 'priority', 9, event)}
                                ></n-input-number>
                            ),
                            col_weight: (data: Omix) => (
                                <n-input-number
                                    size="small"
                                    min={1}
                                    max={10000}
                                    value={data.weight}
                                    onBlur={(event: FocusEvent) => fetchNumberBlur(data, 'weight', 10000, event)}
                                ></n-input-number>
                            ),
                            col_ratio: (data: Omix) => (
                                <n-text type={data.active ? 'default' : 'warning'}>{data.active ? `${data.ratio}%` : '不可用'}</n-text>
                            ),
                            col_status: (data: Omix) => (
                                <n-switch
                                    size="small"
                                    value={data.status === 'enable'}
                                    onUpdate:value={(value: boolean) => fetchUpdate(data, { status: value ? 'enable' : 'disable' })}
                                ></n-switch>
                            ),
                            col_command: (data: Omix) => (
                                <common-base-authorize key-name="chat:nexus:sms:route:channel">
                                    <common-base-button text type="error" title="移除" onClick={() => fetchDelete(data)}>
                                        移除
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
