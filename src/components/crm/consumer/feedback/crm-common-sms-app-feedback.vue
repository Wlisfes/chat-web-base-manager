<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmCommonSmsAppFeedback',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**编辑操作详情数据**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**短信应用静态枚举**/
        const { chunkOptions } = useChunkService(e => Service.httpBaseCrmSmsAppEnums(), {
            immediate: true
        })
        /**表单实例**/
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            callback: () => setState({ initialize: false }),
            formState: {
                /**CRM 客户主键**/
                userKeyId: props.faseNode.keyId,
                /**短信应用类型：MRKT=营销短信，NTFY=通知短信，SOTP=验证码**/
                type: undefined,
                /**报告推送地址**/
                pushUrl: undefined,
                /**备注**/
                remark: undefined
            },
            rules: {
                type: { required: true, message: '请选择应用类型', trigger: 'blur' }
            }
        })

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseCrmCreateSmsApp(formState.value)
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
                            options={chunkOptions.value.typeOptions}
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
