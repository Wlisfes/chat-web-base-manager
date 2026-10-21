<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useSelectService, pick } from '@/hooks'
import { useState } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackChannelPortBind',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**通道**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { state: dialog, setState: setDialog } = useState({ visible: true, loading: false, initialize: false })
        /**设备下拉**/
        const simbankOptions = useSelectService(() => Service.httpBaseSrmSelectSimbank({}), {
            immediate: true,
            transform: list => list.map(item => ({ ...item, label: [item.alias, item.name].filter(Boolean).join(' / ') }))
        })
        /**未绑定端口列表**/
        const { formState, state, fetchRefresh } = useColumnService(
            (base, payload) =>
                Service.httpBaseSrmAvailableChannelPort({ ...payload, ...pick(base, ['page', 'size']), channelKeyId: props.node.keyId }),
            {
                size: 20,
                formState: {
                    /**设备**/
                    simbankKeyId: undefined
                },
                columns: [
                    { title: '端口ID', key: 'keyId', width: 100 },
                    { title: '所属设备', key: 'simbankKeyId', minWidth: 180 },
                    { title: '端口', key: 'port', width: 80 },
                    { title: 'SIM卡号', key: 'sim', width: 150 }
                ]
            }
        )

        /**提交绑定**/
        async function fetchSubmit() {
            if (state.select.length === 0) {
                return await fetchNotifyService({ type: 'warning', title: '请选择要绑定的端口' })
            }
            return await setDialog({ loading: true }).then(async () => {
                try {
                    const { data } = await Service.httpBaseSrmBindChannelPort({
                        channelKeyId: props.node.keyId,
                        portKeyIds: state.select.map((item: Omix) => item.keyId)
                    })
                    return await setDialog({ visible: false }).then(async () => {
                        await emit('submit', { done: setDialog })
                        return await fetchNotifyService({ title: `已绑定 ${data?.count ?? state.select.length} 个端口` })
                    })
                } catch (err) {
                    return await setDialog({ loading: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={860}
                v-model:visible={dialog.visible}
                v-model:loading={dialog.loading}
                v-model:initialize={dialog.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setDialog({ visible: false })}
                onClose={() => emit('close', { done: setDialog })}
            >
                <div class="flex flex-col gap-12">
                    <div class="flex gap-12">
                        <form-base-select
                            clearable
                            filterable
                            class="flex-1"
                            label-field="label"
                            label-value="keyId"
                            placeholder="按设备筛选"
                            loading={simbankOptions.loading.value}
                            options={simbankOptions.dataSource.value}
                            v-model:value={formState.value.simbankKeyId}
                            on-change:value={() => fetchRefresh({ page: 1 })}
                        ></form-base-select>
                    </div>
                    <n-text depth="3">只显示未绑定任何通道、已激活且激活方向与通道一致的端口，已选择 {state.select.length} 个。</n-text>
                    <common-database-table
                        show-select
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
                            col_simbankKeyId: (data: Omix) => {
                                const simbank = simbankOptions.dataSource.value.find((item: Omix) => item.keyId === data.simbankKeyId)
                                return <common-base-content value={simbank?.label ?? data.simbankKeyId}></common-base-content>
                            }
                        }}
                    </common-database-table>
                </div>
            </common-dialog-provider>
        )
    }
})
</script>
