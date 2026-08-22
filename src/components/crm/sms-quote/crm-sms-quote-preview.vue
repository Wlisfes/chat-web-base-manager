<script lang="tsx">
import { computed, defineComponent, Fragment, PropType, watch } from 'vue'
import { useVModels } from '@vueuse/core'
import { useColumnService } from '@/hooks'
import { fetchCurrent } from '@/utils'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuotePreview',
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
        /**客户下拉数据**/
        consumerOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**应用下拉数据**/
        appOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**MCC下拉数据**/
        mccOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState } = useVModels(props, emit)
        const consumerInfo = computed(() =>
            fetchCurrent(props.consumerOptions?.dataSource?.value ?? [], (item: Omix) => item.keyId === formState.value.consumerKeyId)
        )
        const appInfo = computed(() =>
            fetchCurrent(props.appOptions?.dataSource?.value ?? [], (item: Omix) => item.appId === formState.value.appId)
        )
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
                    upUsd: (Number(item.upUsd) / 1_000_000).toFixed(6),
                    downUsd: (Number(item.downUsd) / 1_000_000).toFixed(6)
                })),
            columns: [
                { title: '序号', key: 'index', width: 80 },
                { title: 'MCC', key: 'mcc', width: 100 },
                { title: '国家/地区', key: 'code', minWidth: 200 },
                { title: '下行费率(USD)', key: 'downUsd', minWidth: 160 },
                { title: '上行费率(USD)', key: 'upUsd', minWidth: 160 },
                { title: '下行变更状态', key: 'downStatus', minWidth: 160 },
                { title: '上行变更状态', key: 'upStatus', minWidth: 160 },
                { title: '生效时间', key: 'effectiveTime', minWidth: 160 }
            ]
        })
        const summary = computed(() => ({
            countries: new Set(state.dataSource.map((item: Omix) => item.countryKeyId)).size,
            additions: state.dataSource.filter((item: Omix) => item.upStatus === 'addition' || item.downStatus === 'addition').length,
            scheduled: state.dataSource.filter((item: Omix) => item.effectiveTime && new Date(item.effectiveTime).getTime() > Date.now()).length
        }))

        watch(
            () => props.state.current,
            current => {
                if (current === 3 && formState.value.draftBatchId) fetchRefresh({ page: 1 })
            },
            { immediate: true }
        )

        async function fetchSubmit() {
            return await props.setState({ current: 4 })
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
                        </common-element-columns-template>
                    </div>
                    <div class="flex flex-col p-14 common-skyline--top overflow-hidden">
                        <common-element-columns-template class="gap-10" type="auto-fit" number={100}>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="修改国家/地区">
                                {summary.value.countries}
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="报价条目">
                                {state.total}
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="新增报价">
                                {summary.value.additions}
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="定时生效数">
                                {summary.value.scheduled}
                            </common-element-columns-wrapper>
                        </common-element-columns-template>
                    </div>
                </common-element>

                <common-database-table
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
                        col_downStatus: (data: Omix) => (
                            <n-tag bordered={false} type={data.downStatus === 'addition' ? 'success' : 'default'}>
                                {data.downStatus === 'addition' ? '新增' : '未变'}
                            </n-tag>
                        ),
                        col_upStatus: (data: Omix) => (
                            <n-tag bordered={false} type={data.upStatus === 'addition' ? 'success' : 'default'}>
                                {data.upStatus === 'addition' ? '新增' : '未变'}
                            </n-tag>
                        )
                    }}
                </common-database-table>
                <common-element is-white class="flex p-14 gap-x-14 justify-center items-center overflow-hidden">
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
                </common-element>
            </Fragment>
        )
    }
})
</script>
