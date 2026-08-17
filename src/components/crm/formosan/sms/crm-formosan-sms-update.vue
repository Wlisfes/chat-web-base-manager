<script lang="tsx">
import { defineComponent, Fragment, PropType, computed } from 'vue'
import { useVModels } from '@vueuse/core'
import { useColumnService } from '@/hooks'
import { fetchCurrent } from '@/utils'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmFormosanSmsUpdate',
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
        clientOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**应用下拉数据**/
        appOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**MCC下拉数据**/
        mccOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState } = useVModels(props, emit)

        /**当前客户信息**/
        const clientInfo = computed(() => {
            return fetchCurrent(props.clientOptions?.dataSource?.value ?? [], (e: Omix) => e.keyId === formState.value.clientId)
        })
        /**当前应用信息**/
        const appInfo = computed(() => {
            return fetchCurrent(props.appOptions?.dataSource?.value ?? [], (e: Omix) => e.appId === formState.value.appId)
        })

        const { state, chunkState, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpSmsFormosanDraftColumn(payload),
            formState: { clientId: 1008601, appId: 31774453 },
            columns: [
                { title: '序号', key: 'index', width: 80, render: (e: Omix, index: number) => index + 1 },
                { title: 'MCC', key: 'mcc', width: 100 },
                { title: '国家/地区', key: 'code', minWidth: 260 },
                { title: '下行费率(USD)', key: 'downUsd', width: 320 },
                { title: '上行费率(USD)', key: 'upUsd', width: 320 },
                { title: '生效时间', key: 'effectiveTime', width: 250 },
                { title: '下行变更状态', key: 'downStatus', width: 160 },
                { title: '上行变更状态', key: 'upStatus', width: 160 }
            ]
        })

        async function fetchSubmit() {
            return await props.setState({ loading: true }).then(async () => {
                return await props.fetchValidater().then(async (error: boolean) => {
                    if (error) {
                        return await props.setState({ loading: false })
                    }
                    return await props.setState({ loading: false, current: 3 })

                    // try {
                    //     return await Service.httpSmsFormosanDraftInit(formState.value).then(async () => {
                    //         return await props.setState({ loading: false, current: 2 })
                    //     })
                    // } catch (err) {
                    //     return await props.setState({ loading: false }).then(async () => {
                    //         return await fetchNotifyService({ type: 'error', title: err.message })
                    //     })
                    // }
                })
            })
        }

        return () => (
            <Fragment>
                <common-element is-white class="flex flex-col m-inline-14 m-bs-14 b-rd-4 overflow-hidden">
                    <div class="flex flex-col gap-y-10 p-14 overflow-hidden">
                        <common-business-header bar title="基本信息"></common-business-header>
                        <common-element-columns-template class="gap-x-10 gap-y-5" type="auto-fill" number={250}>
                            <common-element-columns-wrapper label="客户名称：">{clientInfo.value.name ?? '-'}</common-element-columns-wrapper>
                            <common-element-columns-wrapper label="客户别名：">{clientInfo.value.alias ?? '-'}</common-element-columns-wrapper>
                            <common-element-columns-wrapper label="应用别名：">{appInfo.value.appAlias ?? '-'}</common-element-columns-wrapper>
                            <common-element-columns-wrapper label="报价币种：">{clientInfo.value.currency ?? '-'}</common-element-columns-wrapper>
                        </common-element-columns-template>
                    </div>
                </common-element>
                <common-element class="flex flex-col flex-1 p-14 overflow-hidden">
                    <common-database-table
                        class="p-0! overflow-hidden"
                        show-command
                        show-settings
                        pagination={false}
                        limit={state.limit}
                        total={state.total}
                        columns={state.columns}
                        v-model:page={state.page}
                        v-model:size={state.size}
                        v-model:select={state.select}
                        v-model:data={state.dataSource}
                        v-model:loading={state.loading}
                        v-model:initialize={state.initialize}
                        v-model:customize={state.customize}
                        on-update:customize={instOptions.fetchUpdateCustomize}
                        on-update:page={(page: number) => fetchRefresh({ page })}
                        on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                    >
                        {{
                            col_code: (data: Omix) => {
                                //console.log(data)
                                return <span>巴勒斯坦 - Palestinian Territory</span>
                            },
                            col_downUsd: (data: Omix) => (
                                <div class="flex items-center gap-x-8">
                                    <form-common-column-input class="w-140!" v-model:value={data.downUsd}></form-common-column-input>
                                    <span class="whitespace-nowrap">原价：0.000005 / 条</span>
                                </div>
                            ),
                            col_upUsd: (data: Omix) => (
                                <div class="flex items-center gap-x-8">
                                    <form-common-column-input class="w-140!" v-model:value={data.upUsd}></form-common-column-input>
                                    <span class="whitespace-nowrap">原价：0.000005 / 条</span>
                                </div>
                            ),
                            col_effectiveTime: (data: Omix) => (
                                <n-date-picker
                                    type="datetime"
                                    clearable={false}
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    v-model:formatted-value={data.effectiveTime}
                                />
                            ),
                            col_command: (data: Omix) => (
                                <div class="flex items-center gap-x-8 overflow-hidden">
                                    <common-element-button text type="error">
                                        删除
                                    </common-element-button>
                                    <common-element-button text type="primary">
                                        移除
                                    </common-element-button>
                                </div>
                            )
                        }}
                    </common-database-table>
                </common-element>
                <common-element is-white class="flex p-14 gap-x-14 justify-center items-center overflow-hidden">
                    <n-button class="min-w-168" disabled={props.state.loading} onClick={() => props.setState({ current: 1 })}>
                        上一步：填写报价内容
                    </n-button>
                    <n-button
                        class="min-w-168"
                        type="primary"
                        loading={props.state.loading}
                        disabled={props.state.loading}
                        onClick={fetchSubmit}
                    >
                        下一步：报价预览
                    </n-button>
                </common-element>
            </Fragment>
        )
    }
})
</script>
