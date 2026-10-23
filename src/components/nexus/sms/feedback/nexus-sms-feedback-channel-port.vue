<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useSelectService, useFormService, useChunkService, pick, omit, v4 } from '@/hooks'
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
        /**通道静态枚举**/
        const { chunkOptions, fetchChunkService } = useChunkService(() => Service.httpBaseSrmChannelEnums(), {
            immediate: false
        })
        /**端口列表下拉**/
        const simbankPortOptions = useSelectService(e => Service.httpBaseSrmSelectSimbankPort(pick(e, ['ownerUserUid', 'countryKeyId'])), {
            immediate: false,
            options: { countryKeyId: props.node.countryKeyId, ownerUserUid: props.node.ownerUserUid }
        })
        const { formState, formRef, state, setState, setForm, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**方向：来自通道，不可改**/
                countryKeyId: props.node.countryKeyId,
                /**归属人：来自通道，不可改**/
                ownerUserUid: props.node.ownerUserUid,
                /**绑定端口列表**/
                list: props.node.list ?? Array.from({ length: 1 }, () => fetchAdapter())
            }
        })

        /**绑定端口数据转换**/
        function fetchAdapter(item: Omix = {}) {
            return {
                uuid: v4(),
                keyId: item.keyId,
                portKeyId: item.portKeyId,
                status: item.status ?? 'enable',
                weight: item.weight
            }
        }

        /**加载方向、归属人选项、可绑定端口和已绑定端口。**/
        async function fetchInitialization() {
            try {
                return await Promise.all([
                    Service.httpBaseSrmChannelResolver({ keyId: props.node.keyId }),
                    simbankPortOptions.fetchRequest(),
                    fetchChunkService()
                ]).then(async ([{ data }]) => {
                    return await setForm({ list: (data.list ?? [{}]).map(fetchAdapter) }).then(async () => {
                        return await setState({ initialize: false })
                    })
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
                        list: formState.value.list.map((item: Omix) => omit(item, ['uuid']))
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
                width={750}
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
                >
                    {formState.value.list.map((item: Omix, index: number) => (
                        <nexus-sms-channel-port-column
                            index={index}
                            key={item.uuid}
                            v-model:node={item}
                            fetch-adapter={fetchAdapter}
                            chunk-options={chunkOptions}
                            v-model:list={formState.value.list}
                            simbank-port-options={simbankPortOptions.dataSource.value}
                        ></nexus-sms-channel-port-column>
                    ))}
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
