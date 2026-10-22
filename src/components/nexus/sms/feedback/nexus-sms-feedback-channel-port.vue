<script lang="tsx">
import { defineComponent, PropType } from 'vue'
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
                portKeyIds: { type: 'array', required: true, min: 1, message: '请选择要绑定的端口', trigger: 'blur' }
            }
        })

        /**加载方向、归属人选项、可绑定端口和已绑定端口。**/
        async function fetchInitialization() {
            try {
                return await Promise.all([
                    Service.httpBaseSrmChannelResolver({ keyId: props.node.keyId }),
                    chengOptions.fetchRequest(),
                    countryOptions.fetchRequest(),
                    portOptions.fetchRequest()
                ]).then(async ([{ data }]) => {
                    return await setForm({ portKeyIds: (data.list ?? []).map((e: Omix) => e.portKeyId) }).then(async () => {
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
                    <form-base-column label="归属人" required>
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
                    <form-base-column label="方向" required>
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
