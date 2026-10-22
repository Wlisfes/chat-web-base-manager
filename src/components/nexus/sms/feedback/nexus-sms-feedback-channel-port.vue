<script lang="tsx">
import { defineComponent, PropType, ref } from 'vue'
import { useSelectService, useFormService, pick } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
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
        /**端口列表下拉**/
        const portOptions = useSelectService(e => Service.httpBaseSrmSelectSimbankPort(pick(e, ['ownerUserUid', 'countryKeyId'])), {
            immediate: false,
            options: { countryKeyId: props.node.countryKeyId, ownerUserUid: props.node.ownerUserUid }
        })
        /**归属人下拉**/
        const chengOptions = useSelectService(() => Service.httpBaseSkylineSelectUser(), {
            immediate: false
        })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: false
        })
        /**已绑定端口**/
        const boundPorts = ref<Array<Omix>>([])
        const boundLoading = ref(false)
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**方向：来自通道，不可改**/
                countryKeyId: props.node.countryKeyId,
                /**归属人：来自通道，不可改**/
                ownerUserUid: props.node.ownerUserUid,
                /**新绑定的端口**/
                portKeyIds: []
            },
            rules: {
                portKeyIds: { type: 'array', required: true, min: 1, message: '请选择要绑定的端口', trigger: 'change' },
                ownerUserUid: { required: true, message: '归属人不能为空', trigger: 'change' },
                countryKeyId: { required: true, type: 'number', message: '方向不能为空', trigger: 'change' }
            }
        })

        /**查询通道已绑定的端口；列表项带端口和设备当前状态**/
        async function fetchBoundPorts() {
            boundLoading.value = true
            try {
                const { data } = await Service.httpBaseSrmColumnChannelPort({ channelKeyId: props.node.keyId, page: 1, size: 300 })
                boundPorts.value = data?.list ?? []
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            } finally {
                boundLoading.value = false
            }
        }

        /**加载方向、归属人选项、可绑定端口和已绑定端口。**/
        async function fetchInitialization() {
            const taskNames = [
                chengOptions.fetchRequest(),
                countryOptions.fetchRequest(),
                portOptions.fetchRequest(),
                fetchBoundPorts()
            ]
            try {
                return await Promise.all(taskNames).then(async () => {
                    return await setState({ initialize: false })
                })
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        /**绑定选中的端口。**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseSrmBindChannelPort({
                        channelKeyId: props.node.keyId,
                        portKeyIds: formState.value.portKeyIds
                    })
                    return await setState({ visible: false }).then(async () => {
                        await emit('submit', { done: setState })
                        return await fetchNotifyService({ title: `操作成功` })
                    })
                } catch (err) {
                    return await setState({ loading: false, disabled: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={800}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-base-container
                    size="medium"
                    ref={formRef}
                    rules={state.rules}
                    model={formState.value}
                    disabled={state.loading}
                    require-mark-placement="left"
                    base-columns-template
                    base-columns-template-props={{ class: 'gap-x-20', type: 'auto-fit', number: 320 }}
                >
                    <form-base-column label="归属人" path="ownerUserUid">
                        <form-base-select
                            disabled
                            label-value="uid"
                            label-field="showName"
                            placeholder="请选择归属人"
                            loading={chengOptions.loading.value}
                            options={chengOptions.dataSource.value}
                            v-model:value={formState.value.ownerUserUid}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="方向" path="countryKeyId">
                        <form-base-select
                            disabled
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择方向，创建后不可修改"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                        ></form-base-select>
                    </form-base-column>
                    {boundPorts.value.length > 0 && (
                        <form-base-column full label={`已绑定端口（${boundPorts.value.length}）`}>
                            <common-database-table
                                flex-height={false}
                                limit={0}
                                bordered={false}
                                pagination={false}
                                initialize={false}
                                loading={boundLoading.value}
                                data={boundPorts.value}
                                columns={[
                                    { title: '设备', key: 'simbankKeyId', minWidth: 180 },
                                    { title: '端口', key: 'portKeyId', width: 90 },
                                    { title: 'SIM卡号', key: 'sim', width: 150 },
                                    { title: 'ICCID', key: 'iccid', width: 200 },
                                    { title: '权重', key: 'weight', width: 90 },
                                    { title: '状态', key: 'status', width: 100 }
                                ]}
                            >
                                {{
                                    col_simbankKeyId: (data: Omix) => (
                                        <common-base-content
                                            value={[data.simbankOptions?.alias, data.simbankOptions?.name].filter(Boolean).join(' / ')}
                                        ></common-base-content>
                                    ),
                                    col_portKeyId: (data: Omix) => <n-text>{data.portOptions?.port ?? data.portKeyId}</n-text>,
                                    col_sim: (data: Omix) => (data.portOptions?.sim ? <n-text>{data.portOptions.sim}</n-text> : <n-text depth="3">-</n-text>),
                                    col_iccid: (data: Omix) =>
                                        data.portOptions?.iccid ? <n-text>{data.portOptions.iccid}</n-text> : <n-text depth="3">-</n-text>,
                                    col_weight: (data: Omix) => <n-text>{data.weight}</n-text>,
                                    col_status: (data: Omix) => <n-text>{data.status === 'enable' ? '启用' : '停用'}</n-text>
                                }}
                            </common-database-table>
                        </form-base-column>
                    )}
                    <form-base-column full label="新增端口" path="portKeyIds">
                        <form-base-select
                            multiple
                            max-tag-count={999}
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择要绑定的端口，可输入 SIM、IMEI、ICCID 搜索"
                            loading={portOptions.loading.value}
                            options={portOptions.dataSource.value}
                            v-model:value={formState.value.portKeyIds}
                        ></form-base-select>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
