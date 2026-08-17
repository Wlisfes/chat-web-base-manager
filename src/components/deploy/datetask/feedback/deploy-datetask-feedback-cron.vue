<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeployDatetaskFeedbackCron',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**表单实例**/
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            formState: {
                cron: props.node.cron
            },
            rules: {
                cron: { required: true, message: '请输入Cron表达式', trigger: 'blur' }
            }
        })

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseSystemUpdateDatetaskCron({ taskId: props.node.taskId, cron: formState.value.cron })
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
                width={540}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-common-container
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <form-common-column label="任务名称">
                        <form-common-column-input disabled value={props.node.taskName}></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="处理器标识">
                        <form-common-column-input disabled value={props.node.handler}></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="Cron表达式" path="cron">
                        <form-common-column-input
                            maxlength={64}
                            placeholder="请输入Cron表达式，例如：0 0 8 * * *"
                            v-model:value={formState.value.cron}
                        ></form-common-column-input>
                    </form-common-column>
                </form-common-container>
            </common-dialog-provider>
        )
    }
})
</script>
