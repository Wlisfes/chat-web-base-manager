<script lang="tsx">
import { defineComponent, Fragment, PropType } from 'vue'
import { fetchNotifyService } from '@/plugins'
import { useVModels } from '@vueuse/core'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSimbankQuoteContextInitialize',
    emits: ['update:formState'],
    props: {
        /**表单基础状态**/
        state: { type: Object as PropType<Omix>, default: () => ({}) },
        /**设置表单基础状态方法**/
        setState: { type: Function, required: true },
        /**设置表单对象方法**/
        setForm: { type: Function, required: true },
        /**验证表单方法**/
        fetchValidater: { type: Function, required: true },
        /**表单对象**/
        formState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**当前供应商信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**供应商下拉数据**/
        userOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**simbank 下拉数据**/
        simbankOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**MCC下拉数据**/
        mccOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState } = useVModels(props, emit)

        /**供应商变更**/
        async function fetchChangeSupplier(userKeyId: number, item: Omix) {
            return await props.setForm({ simbankKeyId: undefined, userName: item.name, currency: item.currency }).then(async () => {
                return await props.simbankOptions.fetchRequest()
            })
        }

        async function fetchSubmit() {
            return await props.setState({ loading: true }).then(async () => {
                return await props.fetchValidater().then(async (error: boolean) => {
                    if (error) {
                        return await props.setState({ loading: false })
                    }
                    try {
                        return await Service.httpBaseSrmInitSimbankQuoteDraft(formState.value).then(async ({ data }) => {
                            await props.setForm({ draftBatchId: data.draftBatchId })
                            return await props.setState({ loading: false, current: 2 })
                        })
                    } catch (err) {
                        return await props.setState({ loading: false }).then(async () => {
                            return await fetchNotifyService({ type: 'error', title: err.message })
                        })
                    }
                })
            })
        }

        return () => (
            <Fragment>
                <common-base-element
                    is-white
                    is-border
                    wrap="p-inline-14 p-bs-14 flex flex-col flex-1 p-14 overflow-hidden"
                    class-name="flex-1 flex flex-col p-inline-14 p-bs-14 b-rd-3 overflow-hidden"
                >
                    <common-business-header bar title="基本信息"></common-business-header>
                    <common-base-columns-template class="gap-x-14 m-bs-10" type="auto-fit" number={450}>
                        <form-base-column
                            label="供应商别名"
                            path="userKeyId"
                            rule={{ required: true, trigger: 'blur', type: 'number', message: '请选择报价供应商' }}
                        >
                            <form-base-select
                                filterable
                                label-field="showName"
                                label-value="keyId"
                                v-model:value={formState.value.userKeyId}
                                loading={props.userOptions.loading.value}
                                options={props.userOptions.dataSource.value}
                                on-change:value={fetchChangeSupplier}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column
                            label="选择 simbank"
                            path="simbankKeyId"
                            rule={{ required: true, trigger: 'blur', type: 'number', message: '请选择报价 simbank' }}
                        >
                            <form-base-select
                                filterable
                                label-field="showName"
                                label-value="keyId"
                                v-model:value={formState.value.simbankKeyId}
                                loading={props.simbankOptions.loading.value}
                                options={props.simbankOptions.dataSource.value}
                                on-change:value={(simbankKeyId: number, e: Omix) => props.setForm({ simbankAlias: e.alias ?? e.name })}
                            ></form-base-select>
                        </form-base-column>
                    </common-base-columns-template>
                    <common-base-element class="flex flex-col flex-1 gap-y-10 overflow-hidden">
                        <common-business-header bar title="配置报价方向"></common-business-header>
                        <form-base-column
                            class="flex-1 overflow-hidden"
                            path="countryKeyIds"
                            show-label={false}
                            rule={{ required: true, type: 'array', trigger: 'change', message: '请选择报价方向' }}
                        >
                            <common-base-wrapper class-name="inset-0 absolute" opacity={0} loading={props.state.initialize}>
                                <n-transfer
                                    class="h-full inset-0 position-absolute overflow-hidden"
                                    source-filterable
                                    target-filterable
                                    v-model:value={formState.value.countryKeyIds}
                                    options={props.mccOptions.dataSource.value}
                                ></n-transfer>
                            </common-base-wrapper>
                        </form-base-column>
                    </common-base-element>
                </common-base-element>
                <common-base-element is-white class="flex p-14 gap-x-14 justify-center items-center overflow-hidden">
                    <common-skeleton-block initialize={props.state.initialize}>
                        <n-button
                            class="min-w-160"
                            type="primary"
                            loading={props.state.loading}
                            disabled={props.state.loading || props.state.initialize}
                            onClick={fetchSubmit}
                        >
                            下一步：编辑报价
                        </n-button>
                    </common-skeleton-block>
                </common-base-element>
            </Fragment>
        )
    }
})
</script>
