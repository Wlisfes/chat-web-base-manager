<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsApplicationFeedback',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作指令**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**表单实例**/
        const { formState, formRef, state, chunkState, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: initializeSmsApplication,
            chunkNames: { CHUNK_CONSUMER_SMS_TYPE: true },
            formState: {
                consumerKeyId: props.node.consumerKeyId,
                type: props.node.type,
                pushUrl: props.node.pushUrl,
                remark: props.node.remark
            },
            rules: {
                type: { required: true, message: '请选择应用类型', trigger: 'change' }
            }
        })

        /**详情初始化**/
        async function initializeSmsApplication() {
            try {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                return await setForm(fetchReste(props.node)).then(async () => {
                    return await setState({ initialize: false })
                })
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseCrmCreateSmsApplication(formState.value)
                    }
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
                width={500}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-base-container
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <form-base-column label="应用类型" path="type">
                        <form-base-select
                            placeholder="请选择应用类型"
                            options={chunkState.CHUNK_CONSUMER_SMS_TYPE}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="推送地址" path="pushUrl">
                        <form-base-input
                            maxlength={1024}
                            placeholder="请输入报告推送地址"
                            v-model:value={formState.value.pushUrl}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="备注" path="remark">
                        <n-input
                            type="textarea"
                            maxlength={1024}
                            show-count
                            placeholder="请输入备注"
                            v-model:value={formState.value.remark}
                            autosize={{ minRows: 3, maxRows: 6 }}
                        />
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
