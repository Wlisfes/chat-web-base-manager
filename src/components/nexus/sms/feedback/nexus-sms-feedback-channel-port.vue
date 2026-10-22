<script lang="tsx">
import { defineComponent, PropType, ref } from 'vue'
import { useSelectService, useFormService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
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
        /**归属人下拉**/
        const chengOptions = useSelectService(() => Service.httpBaseSkylineSelectUser(), {
            immediate: false
        })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: false
        })
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**方向：来自通道，不可改**/
                countryKeyId: props.node.countryKeyId,
                /**归属人：来自通道，不可改**/
                ownerUserUid: props.node.ownerUserUid,
                /**待绑定端口**/
                portKeyIds: []
            },
            rules: {}
        })

        const portOptions = ref<Array<Omix>>([])
        const portLoading = ref(false)

        /**按通道方向和归属人查询可绑定端口。**/
        async function fetchPorts() {
            if (!formState.value.countryKeyId || !formState.value.ownerUserUid) return
            portLoading.value = true
            try {
                const { data } = await Service.httpBaseSrmSelectChannelPort({
                    countryKeyId: formState.value.countryKeyId,
                    ownerUserUid: formState.value.ownerUserUid,
                    page: 1,
                    size: 200
                })
                portOptions.value = data?.list ?? []
            } finally {
                portLoading.value = false
            }
        }

        /**加载方向、归属人选项，并按通道限定条件查询端口。**/
        async function fetchInitialization() {
            try {
                await Promise.all([chengOptions.fetchRequest(), countryOptions.fetchRequest(), fetchPorts()])
                return await setState({ initialize: false })
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        /**绑定选中的端口。**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) return await setState({ loading: false, disabled: false })
                if (!formState.value.portKeyIds?.length) {
                    return await setState({ loading: false, disabled: false }).then(async () => {
                        return await fetchNotifyService({ type: 'warning', title: '请选择端口' })
                    })
                }
                try {
                    const { data } = await Service.httpBaseSrmBindChannelPort({
                        channelKeyId: props.node.keyId,
                        portKeyIds: formState.value.portKeyIds
                    })
                    return await setState({ visible: false }).then(async () => {
                        await emit('submit', { done: setState })
                        return await fetchNotifyService({ title: `已绑定 ${data?.count ?? formState.value.portKeyIds.length} 个端口` })
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
                    <form-base-column full label="端口" path="portKeyIds">
                        <form-base-select
                            multiple
                            filterable
                            label-field="label"
                            label-value="keyId"
                            placeholder="请选择端口"
                            loading={portLoading.value}
                            options={portOptions.value}
                            v-model:value={formState.value.portKeyIds}
                        ></form-base-select>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
