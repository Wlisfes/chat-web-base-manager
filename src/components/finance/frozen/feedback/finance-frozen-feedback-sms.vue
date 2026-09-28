<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceFrozenFeedbackSms',
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
        /**国家/地区下拉数据**/
        const countryOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: true
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseFinanceFrozenSmsResolver,
            formState: {
                countryKeyId: props.node.countryOptions?.keyId, // 国家/地区主键
                code: props.node.code, // 国家/地区编码
                mcc: props.node.mcc, // 移动国家代码
                upUsd: props.node.upUsd !== undefined ? props.node.upUsd / 1000000 : undefined, // 上行短信价格
                downUsd: props.node.downUsd !== undefined ? props.node.downUsd / 1000000 : undefined, // 下行短信价格
                remark: props.node.remark // 备注
            },
            rules: {
                countryKeyId: { type: 'number', required: true, message: '请选择国家/地区', trigger: 'blur' },
                upUsd: { type: 'number', required: true, message: '请输入上行短信价格', trigger: 'blur' },
                downUsd: { type: 'number', required: true, message: '请输入下行短信价格', trigger: 'blur' }
            }
        })

        /**详情**/
        async function fetchBaseFinanceFrozenSmsResolver() {
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

        /**选择国家/地区带出编码和MCC**/
        async function fetchUpdateCountry(value: number, option: Omix) {
            return await setForm({ code: option?.code, mcc: option?.mcc })
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    const { countryKeyId, ...body } = formState.value
                    const submitData = {
                        ...body,
                        upUsd: Math.round((formState.value.upUsd ?? 0) * 1000000),
                        downUsd: Math.round((formState.value.downUsd ?? 0) * 1000000)
                    }

                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseFinanceCreateFrozenSms(submitData)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseFinanceUpdateFrozenSms({ ...submitData, keyId: props.node.keyId })
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
                width={640}
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
                    <form-base-column label="国家/地区" path="countryKeyId">
                        <form-base-select
                            filterable
                            placeholder="请选择国家/地区"
                            label-value="keyId"
                            label-field="showName"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                            on-change:value={fetchUpdateCountry}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="移动国家代码" path="mcc" required>
                        <form-base-input
                            disabled
                            placeholder="选择国家/地区后自动带出"
                            v-model:value={formState.value.mcc}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="上行短信价格" path="upUsd">
                        <form-base-number-input
                            v-model:value={formState.value.upUsd}
                            placeholder="请输入上行短信价格 (USD)"
                            min={0}
                            step={0.000001}
                            precision={6}
                        ></form-base-number-input>
                    </form-base-column>
                    <form-base-column label="下行短信价格" path="downUsd">
                        <form-base-number-input
                            v-model:value={formState.value.downUsd}
                            placeholder="请输入下行短信价格 (USD)"
                            min={0}
                            step={0.000001}
                            precision={6}
                        ></form-base-number-input>
                    </form-base-column>
                    <form-base-column label="备注" path="remark">
                        <form-base-input
                            type="textarea"
                            maxlength={1024}
                            show-count
                            placeholder="请输入备注"
                            v-model:value={formState.value.remark}
                            autosize={{ minRows: 3, maxRows: 6 }}
                        ></form-base-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
