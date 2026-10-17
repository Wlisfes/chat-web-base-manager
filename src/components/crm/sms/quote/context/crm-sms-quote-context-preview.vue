<script lang="tsx">
import { computed, defineComponent, Fragment, PropType, ref } from 'vue'
import { useColumnService, fetchCurrent } from '@/hooks'
import { useVModels } from '@vueuse/core'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteContextPreview',
    emits: ['update:formState'],
    props: {
        /**表单基础状态**/
        state: { type: Object as PropType<Omix>, default: () => ({}) },
        /**设置表单基础状态方法**/
        setState: { type: Function, required: true },
        /**表单更新方法**/
        setForm: { type: Function, required: true },
        /**验证表单方法**/
        fetchValidater: { type: Function, required: true },
        /**表单对象**/
        formState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**当前客户信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**客户下拉数据**/
        userOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**应用下拉数据**/
        appOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**MCC下拉数据**/
        mccOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**枚举下拉数据**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState } = useVModels(props, emit)
        /**草稿批次统计（由草稿分页接口返回，后端基于整批有效草稿计算）**/
        const summary = ref<Omix>({})
        const { state, instOptions, faseState, fetchRefresh } = useColumnService((e, payload) => fetchBaseCrmColumnSmsQuoteDraft(payload), {
            formState: { status: 'enable', draftBatchId: formState.value.draftBatchId },
            columns: [
                { title: '序号', key: 'index', width: 100 },
                { title: '客户ID', key: 'userKeyId', width: 100 },
                { title: '客户别名', key: 'userAlias', width: 130 },
                { title: '客户名称', key: 'userName', width: 240, ellipsis: false },
                { title: '应用别名', key: 'appAlias', width: 160 },
                { title: 'MCC', key: 'mcc', width: 100 },
                { title: '国家/地区', key: 'countryKeyId', minWidth: 180 },
                { title: '下行费率(USD)', key: 'downUsd', width: 160 },
                { title: '上行费率(USD)', key: 'upUsd', width: 160 },
                { title: '下行变更状态', key: 'downStatus', width: 120 },
                { title: '上行变更状态', key: 'upStatus', width: 120 },
                { title: '生效时间', key: 'effectiveTime', width: 160 }
            ]
        })

        const summaryItems = computed(() => [
            { label: '报价条目', value: summary.value.total, color: 'var(--text-color-1)' },
            { label: '国家/地区', value: summary.value.countries, color: 'var(--text-color-1)' },
            { label: '新增', value: summary.value.additions, color: 'var(--success-color)' },
            { label: '涨价', value: summary.value.increases, color: 'var(--error-color)' },
            { label: '降价', value: summary.value.decreases, color: 'var(--warning-color)' },
            { label: '定时生效', value: summary.value.scheduled, color: 'var(--primary-color)' }
        ])

        /**客户关系管理-短信报价草稿分页列表，同时记录批次统计**/
        async function fetchBaseCrmColumnSmsQuoteDraft(payload: Omix) {
            try {
                const response = await Service.httpBaseCrmColumnSmsQuoteDraft(payload)
                summary.value = response.data.summary ?? {}
                return response
            } catch (err) {
                summary.value = {}
                throw err
            }
        }

        async function fetchSubmit() {
            return await props.setState({ current: 4 })
        }

        return () => (
            <Fragment>
                <common-base-element
                    is-white
                    is-border
                    wrap="p-inline-14 p-bs-14"
                    class-name="flex flex-wrap items-center gap-x-24 gap-y-8 p-inline-14 p-block-10 overflow-hidden"
                >
                    <div class="flex flex-wrap items-center gap-x-24 gap-y-4 flex-1 overflow-hidden">
                        <common-base-columns-wrapper label="客户名称：">{props.faseNode.name ?? '-'}</common-base-columns-wrapper>
                        <common-base-columns-wrapper label="客户别名：">{props.faseNode.alias ?? '-'}</common-base-columns-wrapper>
                        <common-base-columns-wrapper label="应用别名：">{formState.value.appAlias ?? '-'}</common-base-columns-wrapper>
                        <common-base-columns-wrapper label="报价币种：">{props.faseNode.currency ?? '-'}</common-base-columns-wrapper>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-20 gap-y-4 overflow-hidden">
                        {summaryItems.value.map(item => (
                            <common-base-columns-wrapper key={item.label} label={`${item.label}：`}>
                                <span class="font-bold" style={{ color: item.color }}>
                                    {item.value ?? '-'}
                                </span>
                            </common-base-columns-wrapper>
                        ))}
                    </div>
                </common-base-element>

                <common-database-table
                    show-index
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
                        col_userName: (data: Omix) => (
                            <common-base-content ellipsis value={data.userOptions?.name}>
                                {data.userOptions?.name ?? '-'}
                            </common-base-content>
                        ),
                        col_countryKeyId: (data: Omix) => (
                            <common-base-chunk
                                mode="text"
                                ellipsis
                                value={data.countryKeyId}
                                items={props.mccOptions.dataSource.value}
                            ></common-base-chunk>
                        ),
                        col_downUsd: (data: Omix) => {
                            return <common-base-number value={data.downUsd}></common-base-number>
                        },
                        col_upUsd: (data: Omix) => {
                            return <common-base-number value={data.upUsd}></common-base-number>
                        },
                        col_downStatus: (data: Omix) => (
                            <common-base-chunk value={data.downStatus} items={props.chunkOptions.changeStatusOptions}></common-base-chunk>
                        ),
                        col_upStatus: (data: Omix) => (
                            <common-base-chunk value={data.upStatus} items={props.chunkOptions.changeStatusOptions}></common-base-chunk>
                        ),
                        col_effectiveTime: (data: Omix) => {
                            return <common-base-content value={data.effectiveTime ?? '立即生效'}></common-base-content>
                        }
                    }}
                </common-database-table>
                <common-base-element is-white class="flex p-14 gap-x-14 justify-center items-center overflow-hidden">
                    <n-button class="min-w-168" disabled={props.state.loading} onClick={() => props.setState({ current: 2 })}>
                        上一步：编辑报价
                    </n-button>
                    <n-button
                        class="min-w-168"
                        type="primary"
                        loading={props.state.loading}
                        disabled={props.state.loading}
                        onClick={fetchSubmit}
                    >
                        下一步：发布报价
                    </n-button>
                </common-base-element>
            </Fragment>
        )
    }
})
</script>
