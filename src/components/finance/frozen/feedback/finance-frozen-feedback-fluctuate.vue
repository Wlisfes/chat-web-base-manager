<script lang="tsx">
import { defineComponent, computed, PropType } from 'vue'
import { useFormService, useChunkService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceFrozenFeedbackFluctuate',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**需要调价的短信基础价格列表**/
        items: { type: Array as PropType<Array<Omix>>, default: () => [] }
    },
    setup(props, { emit }) {
        /**国家/地区下拉数据**/
        const countryOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: false
        })
        /**调价方式静态枚举**/
        const { chunkOptions, chunkState, fetchChunkService } = useChunkService(e => Service.httpBaseFinanceFrozenSmsEnums(), {
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**国家/地区**/
                countryKeyIds: props.items.map(e => e.countryKeyId),
                /**调价方式：increase_number、increase_percent、decrease_number、decrease_percent，取值来自后端 modeOptions**/
                mode: undefined,
                /**上行调整值**/
                upValue: 0,
                /**下行调整值**/
                downValue: 0
            },
            rules: {
                countryKeyIds: { type: 'array', required: true, min: 1, message: '请选择国家/地区', trigger: 'blur' },
                mode: { required: true, message: '请选择调价方式', trigger: 'blur' },
                upValue: { type: 'number', required: true, message: '请输入上行调整值', trigger: 'blur' },
                downValue: { type: 'number', required: true, message: '请输入下行调整值', trigger: 'blur' }
            }
        })
        /**当前调价方式是否按金额调整（*_number），否则按百分比（*_percent）**/
        const isAmount = computed(() => String(formState.value.mode ?? '').endsWith('_number'))
        /**当前调价方式是否为下调（decrease_*）**/
        const isDecrease = computed(() => String(formState.value.mode ?? '').startsWith('decrease_'))
        /**当前调价方式文案，来自后端枚举**/
        const label = computed(() => {
            return (chunkOptions.value.modeOptions ?? []).find((item: Omix) => item.value === formState.value.mode)?.label ?? '调整'
        })
        /**调整值输入配置：金额保留 6 位小数，百分比保留 2 位小数；下调百分比最多 100**/
        const inputOptions = computed(() => {
            if (isAmount.value) {
                return { step: 0.000001, precision: 6, unit: 'USD', max: undefined }
            }
            return { step: 0.01, precision: 2, unit: '%', max: isDecrease.value ? 100 : undefined }
        })

        /**初始化枚举和国家/地区下拉**/
        async function fetchInitialization() {
            return await Promise.all([fetchChunkService(), countryOptions.fetchRequest()]).then(async () => {
                return await setState({ initialize: false })
            })
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    const { data } = await Service.httpBaseFinanceFluctuateFrozenSms({
                        countryKeyIds: formState.value.countryKeyIds,
                        mode: formState.value.mode,
                        upValue: formState.value.upValue,
                        downValue: formState.value.downValue
                    })
                    return await setState({ visible: false }).then(async () => {
                        await emit('submit', { done: setState })
                        return await fetchNotifyService({
                            title: `已${label.value} ${data?.count ?? formState.value.countryKeyIds.length} 个国家/地区的基础价格`
                        })
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
                scrollbar
                width={560}
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
                    <form-base-column label="国家/地区" path="countryKeyIds">
                        <form-base-select
                            multiple
                            filterable
                            label-value="keyId"
                            label-field="showName"
                            placeholder="请选择国家/地区"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyIds}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="调价方式" path="mode">
                        <form-base-select
                            placeholder="请选择调价方式"
                            label-value="value"
                            label-field="label"
                            loading={chunkState.loading}
                            options={chunkOptions.value.modeOptions}
                            v-model:value={formState.value.mode}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="上行调整" path="upValue">
                        <form-base-number-input
                            min={0}
                            show-button={false}
                            max={inputOptions.value.max}
                            step={inputOptions.value.step}
                            precision={inputOptions.value.precision}
                            suffix={<span>{inputOptions.value.unit}</span>}
                            v-model:value={formState.value.upValue}
                            placeholder="请输入上行调整值，不调整填 0"
                        ></form-base-number-input>
                    </form-base-column>
                    <form-base-column label="下行调整" path="downValue">
                        <form-base-number-input
                            min={0}
                            show-button={false}
                            max={inputOptions.value.max}
                            step={inputOptions.value.step}
                            precision={inputOptions.value.precision}
                            suffix={<span>{inputOptions.value.unit}</span>}
                            v-model:value={formState.value.downValue}
                            placeholder="请输入下行调整值，不调整填 0"
                        ></form-base-number-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
