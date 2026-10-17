<script lang="tsx">
import { defineComponent, computed, Fragment, PropType } from 'vue'
import { useColumnService } from '@/hooks'
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
        const { state, instOptions, faseState, fetchRefresh } = useColumnService((e, p) => Service.httpBaseCrmColumnSmsQuoteDraft(p), {
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
        /**汇总**/
        const columns = computed(() => [
            { label: '报价条目', value: faseState.value.summary?.total },
            { label: '国家/地区', value: faseState.value.summary?.countries },
            { label: '新增报价', type: 'success', value: faseState.value.summary?.additions },
            { label: '涨价数', type: 'error', value: faseState.value.summary?.increases },
            { label: '降价数', type: 'warning', value: faseState.value.summary?.decreases },
            { label: '定时生效', type: 'info', value: faseState.value.summary?.scheduled }
        ])

        /**下一步：发布报价**/
        async function fetchSubmit() {
            return await props.setState({ current: 4 })
        }

        return () => (
            <Fragment>
                <common-base-element is-white is-border wrap="p-inline-14 p-bs-14" class-name="flex flex-col p-14 gap-y-10 overflow-hidden">
                    <div class="flex items-center justify-between gap-x-10 overflow-hidden">
                        <common-business-header bar title="基本信息"></common-business-header>
                        <div class="flex items-center gap-x-10 overflow-hidden">
                            {columns.value.map(item => (
                                <common-base-columns-wrapper label={`${item.label}：`}>
                                    <common-skeleton-block initialize={state.initialize}>
                                        <n-text strong depth={1} type={item.type} class="line-height-24 w-30">
                                            {item.value ?? '-'}
                                        </n-text>
                                    </common-skeleton-block>
                                </common-base-columns-wrapper>
                            ))}
                        </div>
                    </div>
                    <common-base-columns-template class="gap-x-10 gap-y-5" type="auto-fill" number={240}>
                        <common-base-columns-wrapper label="客户名称：">
                            <common-skeleton-block initialize={state.initialize}>{props.faseNode.name ?? '-'}</common-skeleton-block>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label="客户别名：">
                            <common-skeleton-block initialize={state.initialize}>{props.faseNode.alias ?? '-'}</common-skeleton-block>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label="应用别名：">
                            <common-skeleton-block initialize={state.initialize}>{formState.value.appAlias ?? '-'}</common-skeleton-block>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label="报价币种：">
                            <common-skeleton-block initialize={state.initialize}>{props.faseNode.currency ?? '-'}</common-skeleton-block>
                        </common-base-columns-wrapper>
                    </common-base-columns-template>
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
                    <common-skeleton-block initialize={state.initialize}>
                        <n-button class="min-w-160" disabled={props.state.loading} onClick={() => props.setState({ current: 2 })}>
                            上一步：编辑报价
                        </n-button>
                    </common-skeleton-block>
                    <common-skeleton-block initialize={state.initialize}>
                        <n-button
                            class="min-w-160"
                            type="primary"
                            loading={props.state.loading}
                            disabled={props.state.loading}
                            onClick={fetchSubmit}
                        >
                            下一步：发布报价
                        </n-button>
                    </common-skeleton-block>
                </common-base-element>
            </Fragment>
        )
    }
})
</script>
