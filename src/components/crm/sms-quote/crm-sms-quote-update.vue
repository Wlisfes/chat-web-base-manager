<script lang="tsx">
import { computed, defineComponent, Fragment, PropType, watch } from 'vue'
import { useVModels } from '@vueuse/core'
import { useColumnService } from '@/hooks'
import { fetchCurrent } from '@/utils'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteUpdate',
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

        /**当前客户信息**/
        const consumerInfo = computed(() => {
            return fetchCurrent(props.consumerOptions?.dataSource?.value ?? [], (e: Omix) => e.keyId === formState.value.consumerKeyId)
        })
        /**当前应用信息**/
        const appInfo = computed(() => {
            return fetchCurrent(props.appOptions?.dataSource?.value ?? [], (e: Omix) => e.appId === formState.value.appId)
        })

        const { state, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) =>
                Service.httpBaseCrmColumnSmsQuoteDraft({ ...payload, draftBatchId: formState.value.draftBatchId }),
            formState: { draftBatchId: undefined },
            immediate: false,
            size: 200,
            transform: data =>
                data.list.map((item: Omix, index: number) => ({
                    ...item,
                    index: index + 1,
                    upUsd: Number(item.upUsd) / 1_000_000,
                    downUsd: Number(item.downUsd) / 1_000_000
                })),
            columns: [
                { title: '序号', key: 'index', width: 80 },
                { title: 'MCC', key: 'mcc', width: 100 },
                { title: '国家/地区', key: 'code', minWidth: 260 },
                { title: '下行费率(USD)', key: 'downUsd', width: 320 },
                { title: '上行费率(USD)', key: 'upUsd', width: 320 },
                { title: '生效时间', key: 'effectiveTime', width: 250 },
                { title: '下行变更状态', key: 'downStatus', width: 160 },
                { title: '上行变更状态', key: 'upStatus', width: 160 }
            ]
        })

        watch(
            () => props.state.current,
            current => {
                if (current === 2 && formState.value.draftBatchId) fetchRefresh({ page: 1 })
            },
            { immediate: true }
        )

        async function fetchSubmit() {
            return await props.setState({ loading: true }).then(async () => {
                return await props.fetchValidater().then(async (error: boolean) => {
                    if (error) {
                        return await props.setState({ loading: false })
                    }
                    try {
                        await Promise.all(
                            state.dataSource.map((item: Omix) =>
                                Service.httpBaseCrmUpdateSmsQuoteDraft({
                                    keyId: item.keyId,
                                    upUsd: Math.round(Number(item.upUsd) * 1_000_000),
                                    downUsd: Math.round(Number(item.downUsd) * 1_000_000),
                                    effectiveTime: item.effectiveTime,
                                    expiryTime: item.expiryTime,
                                    remark: item.remark
                                })
                            )
                        )
                        return await props.setState({ loading: false, current: 3 })
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
                <common-element is-white class="flex flex-col m-inline-14 m-bs-14 b-rd-4 overflow-hidden">
                    <div class="flex flex-col gap-y-10 p-14 overflow-hidden">
                        <common-business-header bar title="基本信息"></common-business-header>
                        <common-element-columns-template class="gap-x-10 gap-y-5" type="auto-fill" number={250}>
                            <common-element-columns-wrapper label="客户名称：">{consumerInfo.value.name ?? '-'}</common-element-columns-wrapper>
                            <common-element-columns-wrapper label="客户别名：">{consumerInfo.value.alias ?? '-'}</common-element-columns-wrapper>
                            <common-element-columns-wrapper label="应用别名：">{appInfo.value.appAlias ?? '-'}</common-element-columns-wrapper>
                            <common-element-columns-wrapper label="报价币种：">{consumerInfo.value.currency ?? '-'}</common-element-columns-wrapper>
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
                                const country = props.mccOptions.dataSource.value.find((item: Omix) => item.keyId === data.countryKeyId)
                                return <span>{country ? `${country.cnName} - ${country.enName}` : data.code}</span>
                            },
                            col_downUsd: (data: Omix) => (
                                <n-input-number
                                    class="w-180!"
                                    min={0}
                                    step={0.000001}
                                    precision={6}
                                    v-model:value={data.downUsd}
                                />
                            ),
                            col_upUsd: (data: Omix) => (
                                <n-input-number
                                    class="w-180!"
                                    min={0}
                                    step={0.000001}
                                    precision={6}
                                    v-model:value={data.upUsd}
                                />
                            ),
                            col_downStatus: (data: Omix) => (
                                <n-tag bordered={false} type={data.downStatus === 'addition' ? 'success' : 'default'}>
                                    {data.downStatus === 'addition' ? '新增' : '未变'}
                                </n-tag>
                            ),
                            col_upStatus: (data: Omix) => (
                                <n-tag bordered={false} type={data.upStatus === 'addition' ? 'success' : 'default'}>
                                    {data.upStatus === 'addition' ? '新增' : '未变'}
                                </n-tag>
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
                                    <common-element-button
                                        text
                                        type="error"
                                        onClick={async () => {
                                            await Service.httpBaseCrmDeleteSmsQuoteDraft({ keyIds: [data.keyId] })
                                            await fetchRefresh({ page: 1 })
                                        }}
                                    >
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
