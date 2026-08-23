<script lang="tsx">
import { defineComponent, Fragment, PropType } from 'vue'
import { useVModels } from '@vueuse/core'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteInitialize',
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
        /**客户下拉数据**/
        consumerOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**应用下拉数据**/
        appOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**MCC下拉数据**/
        mccOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState } = useVModels(props, emit)

        /**客户类型变更**/
        async function fetchChangeConsumer(consumerKeyId: number, item: Omix) {
            return await props.setForm({ appId: undefined }).then(async () => {
                return await props.appOptions.fetchRequest()
            })
        }

        async function fetchSubmit() {
            return await props.setState({ loading: true }).then(async () => {
                return await props.fetchValidater().then(async (error: boolean) => {
                    if (error) {
                        return await props.setState({ loading: false })
                    }
                    try {
                        return await Service.httpBaseCrmInitSmsQuoteDraft(formState.value).then(async response => {
                            await props.setForm({ draftBatchId: response.data.draftBatchId })
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
                <common-element class="flex flex-col flex-1 p-14 overflow-hidden">
                    <common-element is-white class="flex-1 flex flex-col p-inline-24 p-bs-24 b-rd-3 overflow-hidden">
                        <div class="flex flex-col gap-y-10 overflow-hidden">
                            <common-business-header bar title="基本信息"></common-business-header>
                            <common-element-columns-template class="gap-x-24" type="auto-fit" number={450}>
                                <form-common-column
                                    label="客户别名"
                                    path="consumerKeyId"
                                    rule={{ required: true, trigger: ['blur'], type: 'number', message: '请选择报价客户' }}
                                >
                                    <form-common-column-select
                                        filterable
                                        label-field="showName"
                                        label-value="keyId"
                                        v-model:value={formState.value.consumerKeyId}
                                        options={props.consumerOptions.dataSource.value}
                                        on-change:value={fetchChangeConsumer}
                                    ></form-common-column-select>
                                </form-common-column>
                                <form-common-column
                                    label="选择应用"
                                    path="appId"
                                    rule={{ required: true, trigger: ['blur'], message: '请选择报价应用' }}
                                >
                                    <form-common-column-select
                                        filterable
                                        label-field="appAlias"
                                        label-value="appId"
                                        v-model:value={formState.value.appId}
                                        options={props.appOptions.dataSource.value}
                                    ></form-common-column-select>
                                </form-common-column>
                            </common-element-columns-template>
                        </div>
                        <div class="flex flex-col flex-1 gap-y-10 overflow-hidden">
                            <common-business-header bar title="配置报价方向"></common-business-header>
                            <div class="flex-1 relative overflow-hidden">
                                <form-common-column
                                    class="inset-0 position-absolute"
                                    path="countryKeyIds"
                                    show-label={false}
                                    rule={{ required: true, type: 'array', trigger: ['change'], message: '请选择报价方向' }}
                                >
                                    <n-transfer
                                        class="h-full inset-0 position-absolute overflow-hidden"
                                        source-filterable
                                        target-filterable
                                        v-model:value={formState.value.countryKeyIds}
                                        options={props.mccOptions.dataSource.value}
                                    ></n-transfer>
                                </form-common-column>
                            </div>
                        </div>
                    </common-element>
                </common-element>
                <common-element is-white class="flex p-14 gap-x-14 justify-center items-center overflow-hidden">
                    <n-button
                        class="min-w-168"
                        type="primary"
                        loading={props.state.loading}
                        disabled={props.state.loading}
                        onClick={fetchSubmit}
                    >
                        下一步：编辑报价
                    </n-button>
                </common-element>
            </Fragment>
        )
    }
})
</script>
