<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { cloneDeep } from 'lodash-es'
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
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseFinanceFrozenSmsResolver,
            formState: {
                /**国家/地区主键**/
                countryKeyId: props.node.countryKeyId,
                /**国家/地区编码**/
                code: undefined,
                /**移动国家代码**/
                mcc: undefined,
                /**上行短信价格**/
                upUsd: undefined,
                /**下行短信价格**/
                downUsd: undefined,
                /**备注**/
                remark: undefined
            },
            rules: {
                countryKeyId: { type: 'number', required: true, message: '请选择国家/地区', trigger: 'blur' },
                upUsd: { type: 'number', required: true, message: '请输入上行短信价格', trigger: 'blur' },
                downUsd: { type: 'number', required: true, message: '请输入下行短信价格', trigger: 'blur' }
            }
        })

        /**短信基础价格详情**/
        async function fetchBaseFinanceFrozenSmsResolver() {
            const taskNames: Array<Promise<Omix>> = [countryOptions.fetchRequest()]
            if (['CREATE'].includes(props.command)) {
                return await Promise.all(taskNames).then(async () => {
                    return await setState({ initialize: false })
                })
            } else {
                taskNames.unshift(Service.httpBaseFinanceFrozenSmsResolver({ keyId: props.node.keyId }))
            }
            return await Promise.all(taskNames).then(async ([{ data }]) => {
                try {
                    const upUsd = data.upUsd / 1000000
                    const downUsd = data.downUsd / 1000000
                    return await setForm(fetchReste({ ...data, upUsd, downUsd })).then(async () => {
                        return await setState({ initialize: false })
                    })
                } catch (err) {
                    return await setState({ initialize: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    const formOptions: Omix = Object.assign(cloneDeep(formState.value), {
                        upUsd: Math.round((formState.value.upUsd ?? 0) * 1000000),
                        downUsd: Math.round((formState.value.downUsd ?? 0) * 1000000)
                    })
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseFinanceCreateFrozenSms(formOptions)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseFinanceUpdateFrozenSms({ ...formOptions, keyId: props.node.keyId })
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
                            on-change:value={(keyId: string, e: Omix) => setForm({ code: e.code, mcc: e.mcc })}
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
