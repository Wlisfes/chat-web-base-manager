<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useSelectService, useChunkService, useFormService } from '@/hooks'
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
        const { chunkOptions, fetchChunkService } = useChunkService(() => Service.httpBaseSrmRouteEnums(), {
            immediate: false
        })
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
                channelKeyIds: []
            },
            rules: {
                channelKeyIds: { type: 'array', required: true, min: 1, message: '请选择要绑定的通道', trigger: 'blur' }
            }
        })

        /**加载通道下拉和路由已绑定的通道**/
        async function fetchInitialization() {
            try {
                return await Promise.all([
                    Service.httpBaseSrmListRouteChannel({ routeKeyId: props.node.keyId }),
                    channelOptions.fetchRequest(),
                    fetchChunkService()
                ]).then(async ([{ data }]) => {
                    return await setForm({ channelKeyIds: (data ?? []).map((e: Omix) => e.channelKeyId) }).then(async () => {
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
                        channelKeyIds: formState.value.channelKeyIds
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
                    <form-base-column label="路由别名" required>
                        <form-base-input disabled v-model:value={formState.value.alias} />
                    </form-base-column>
                    <form-base-column label="路由类型" required>
                        <form-base-select
                            disabled
                            label-field="label"
                            label-value="value"
                            placeholder="请选择路由类型，创建后不可修改"
                            options={chunkOptions.value.routeTypeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column full label="通道" path="channelKeyIds">
                        <form-base-select
                            multiple
                            max-tag-count={999}
                            label-field="alias"
                            label-value="keyId"
                            placeholder="请选择路由要使用的通道"
                            loading={channelOptions.loading.value}
                            options={channelOptions.dataSource.value}
                            v-model:value={formState.value.channelKeyIds}
                        ></form-base-select>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
