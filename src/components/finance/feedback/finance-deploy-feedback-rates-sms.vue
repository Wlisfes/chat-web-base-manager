<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceDeployFeedbackRatesSms',
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
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseFinanceRatesSmsResolver,
            formState: {
                code: props.node.code, // 国家/地区编码
                mcc: props.node.mcc, // 移动国家代码
                upUsd: props.node.upUsd !== undefined ? props.node.upUsd / 1000000 : undefined, // 上行短信价格
                downUsd: props.node.downUsd !== undefined ? props.node.downUsd / 1000000 : undefined, // 下行短信价格
                remark: props.node.remark // 备注
            },
            rules: {
                code: { required: true, message: '请输入国家/地区编码', trigger: 'blur' },
                mcc: { required: true, message: '请输入移动国家代码', trigger: 'blur' },
                upUsd: { type: 'number', required: true, message: '请输入上行短信价格', trigger: 'blur' },
                downUsd: { type: 'number', required: true, message: '请输入下行短信价格', trigger: 'blur' }
            }
        })

        /**详情**/
        async function fetchBaseFinanceRatesSmsResolver() {
            try {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                const resetData = {
                    ...fetchReste(props.node),
                    upUsd: props.node.upUsd !== undefined ? props.node.upUsd / 1000000 : undefined,
                    downUsd: props.node.downUsd !== undefined ? props.node.downUsd / 1000000 : undefined
                }
                return await setForm(resetData).then(async () => {
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
                    const submitData = {
                        ...formState.value,
                        upUsd: Math.round((formState.value.upUsd ?? 0) * 1000000),
                        downUsd: Math.round((formState.value.downUsd ?? 0) * 1000000)
                    }

                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseFinanceCreateBasicSmsRate(submitData)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseFinanceUpdateBasicSmsRate({ ...submitData, keyId: props.node.keyId })
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
                width={540}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
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
                    <form-common-column label="国家/地区编码" path="code">
                        <form-common-column-input
                            maxlength={10}
                            placeholder="请输入国家/地区编码"
                            v-model:value={formState.value.code}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="移动国家代码" path="mcc">
                        <form-common-column-input
                            maxlength={4}
                            placeholder="请输入移动国家代码 (MCC)"
                            v-model:value={formState.value.mcc}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="上行短信价格" path="upUsd">
                        <n-input-number
                            v-model:value={formState.value.upUsd}
                            placeholder="请输入上行短信价格 (USD)"
                            min={0}
                            step={0.000001}
                            precision={6}
                            style={{ width: '100%' }}
                        />
                    </form-common-column>
                    <form-common-column label="下行短信价格" path="downUsd">
                        <n-input-number
                            v-model:value={formState.value.downUsd}
                            placeholder="请输入下行短信价格 (USD)"
                            min={0}
                            step={0.000001}
                            precision={6}
                            style={{ width: '100%' }}
                        />
                    </form-common-column>
                    <form-common-column label="备注" path="remark">
                        <n-input
                            type="textarea"
                            maxlength={1024}
                            show-count
                            placeholder="请输入备注"
                            v-model:value={formState.value.remark}
                            autosize={{ minRows: 3, maxRows: 6 }}
                        />
                    </form-common-column>
                </form-common-container>
            </common-dialog-provider>
        )
    }
})
</script>
