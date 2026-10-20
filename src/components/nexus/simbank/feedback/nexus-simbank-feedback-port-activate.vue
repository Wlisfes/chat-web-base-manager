<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSimbankFeedbackPortActivate',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**端口信息**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const countryOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: true
        })
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            initialize: false,
            formState: {
                countryKeyId: props.node.countryKeyId
            },
            rules: {
                countryKeyId: { required: true, type: 'number', message: '请选择激活方向', trigger: 'blur' }
            }
        })

        /**提交激活**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseSrmSimbankPortActivate({
                        keyId: props.node.keyId,
                        countryKeyId: formState.value.countryKeyId
                    })
                    return await setState({ visible: false }).then(async () => {
                        await emit('submit', { done: setState })
                        return await fetchNotifyService({ title: '操作成功' })
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
                width={480}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={countryOptions.initialize.value}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-base-container require-mark-placement="left" size="medium" ref={formRef} model={formState.value} rules={state.rules}>
                    <form-base-column label="激活方向" path="countryKeyId">
                        <form-base-select
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择激活方向"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                        ></form-base-select>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
