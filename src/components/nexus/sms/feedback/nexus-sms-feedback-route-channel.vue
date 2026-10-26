<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useSelectService, useFormService, omit, v4 } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
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
        /**通道下拉**/
        const channelOptions = useSelectService(() => Service.httpBaseSrmSelectChannel(), {
            immediate: false
        })
        const { formState, formRef, state, setState, setForm, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**路由别名**/
                alias: props.node.alias,
                /**路由类型：创建后不可修改**/
                type: props.node.type,
                /**已绑定的通道**/
                list: Array.from({ length: 1 }, () => fetchAdapter())
            }
        })

        /**绑定通道数据转换**/
        function fetchAdapter(item: Omix = {}) {
            return {
                uuid: v4(),
                keyId: item.keyId,
                channelKeyId: item.channelKeyId,
                status: item.status ?? 'enable',
                priority: item.priority,
                weight: item.weight
            }
        }

        /**加载通道下拉和路由已绑定的通道**/
        async function fetchInitialization() {
            try {
                return await Promise.all([
                    Service.httpBaseSrmRouteResolver({ keyId: props.node.keyId }),
                    channelOptions.fetchRequest()
                ]).then(async ([{ data }]) => {
                    return await setForm({ list: (data.channels ?? [{}]).map(fetchAdapter) }).then(async () => {
                        return await setState({ initialize: false })
                    })
                })
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        /**更新路由通道绑定**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseSrmBindRouteChannel({
                        routeKeyId: props.node.keyId,
                        channels: formState.value.list.map((item: Omix) => omit(item, ['uuid']))
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
                width={850}
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
                        <nexus-sms-route-channel-column
                            index={index}
                            key={item.uuid}
                            v-model:node={item}
                            fetch-adapter={fetchAdapter}
                            v-model:list={formState.value.list}
                            channel-options={channelOptions.dataSource.value}
                        ></nexus-sms-route-channel-column>
                    ))}
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
