<script lang="tsx">
import { computed, defineComponent, Fragment, PropType } from 'vue'
import { useColumnService, fetchCurrent, pick } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { useVModels } from '@vueuse/core'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteContextUpdate',
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
        /**当前客户信息**/
        const faseNode = computed(() => {
            return fetchCurrent(props.userOptions.dataSource.value, (e: Omix) => e.keyId == formState.value.userKeyId)
        })
        const { state, instOptions, fetchRefresh } = useColumnService((base, payload) => fetchBaseCrmColumnSmsQuoteDraft(base, payload), {
            formState: { draftBatchId: formState.value.draftBatchId },
            size: 200,
            columns: [
                { title: '序号', key: 'index', width: 80, align: 'center' },
                { title: 'MCC', key: 'mcc', width: 100 },
                { title: '国家/地区', key: 'countryKeyId', minWidth: 180 },
                { title: '下行费率(USD)', key: 'downUsd', width: 330, ellipsis: false },
                { title: '上行费率(USD)', key: 'upUsd', width: 330, ellipsis: false },
                { title: '生效时间', key: 'effectiveTime', width: 240, ellipsis: false },
                { title: '下行变更状态', key: 'downStatus', width: 120 },
                { title: '上行变更状态', key: 'upStatus', width: 120 },
                { title: '草稿状态', key: 'status', width: 120 }
            ]
        })
        /**存在费率、生效时间正在保存的行；保存完成前禁止上一步/下一步，避免预览拿到旧数据**/
        const saving = computed(() => state.dataSource.some((item: Omix) => item.loading))

        /**客户关系管理-短信报价草稿分页列表**/
        async function fetchBaseCrmColumnSmsQuoteDraft(base: Omix, payload: Omix) {
            return Service.httpBaseCrmColumnSmsQuoteDraft({ ...payload, ...pick(base, ['page', 'size']) })
        }

        /**时间变更**/
        async function fetchChnageDateTime(node: Omix, effectiveTime: string) {
            try {
                return await Service.httpBaseCrmUpdateSmsQuoteDraft({ keyId: node.keyId, effectiveTime }).then(async ({ data }) => {
                    console.log(data)
                })
            } catch (err) {
                // return await done({ loading: false }).then(async () => {
                return await fetchNotifyService({ type: 'error', title: err.message })
                // })
            }
        }

        /**上行或下行价格较现行报价增长时整行标红提醒**/
        function fetchRowClassName(data: Omix) {
            const status = [data.upStatus, data.downStatus]
            if (status.includes('INCREASE')) {
                return 'crm-sms-quote--increase'
            }
            return status.includes('DECREASE') ? 'crm-sms-quote--decrease' : ''
        }

        /**报价草稿名称，用于二次确认提示**/
        function fetchDraftName(data: Omix) {
            return [data.appAlias, data.mcc].filter(Boolean).join(' / ')
        }

        /**软删除或恢复报价草稿，删除后不参与预览和发布**/
        async function fetchUpdateDraftStatus(data: Omix, status: string) {
            const name = [data.appAlias, data.mcc].filter(Boolean).join('-')
            const actions: Record<typeof status, string> = {
                enable: `确认恢复报价草稿<span class="text-[var(--n-icon-color)] p-inline-10">${name}</span>吗？`,
                deleted: `确认删除报价草稿<span class="text-[var(--n-icon-color)] p-inline-10">${name}</span>吗？`
            }
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: <div v-html={actions[status]}></div>,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            return await Service.httpBaseCrmUpdateSmsQuoteDraftStatus({ keyIds: [data.keyId], status }).then(async () => {
                                data.status = status
                                return await done({ visible: false }).then(async () => {
                                    return await fetchNotifyService({ title: `操作成功` })
                                })
                            })
                        } catch (err) {
                            return await done({ loading: false }).then(async () => {
                                return await fetchNotifyService({ type: 'error', title: err.message })
                            })
                        }
                    })
                }
            })
        }

        /**移除报价草稿，物理删除后不可恢复**/
        async function fetchDeleteDraft(data: Omix) {
            const name = `<span class="text-[var(--n-icon-color)] p-inline-10">${[data.appAlias, data.mcc].filter(Boolean).join('-')}</span>`
            return await fetchDialogService({
                title: '提示',
                type: 'error',
                content: <div v-html={`确认移除报价草稿${name}吗？移除后不可恢复。`}></div>,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            return await Service.httpBaseCrmDeleteSmsQuoteDraft({ keyIds: [data.keyId] }).then(async () => {
                                return await done({ visible: false }).then(async () => {
                                    await fetchNotifyService({ title: '移除成功' })
                                    return await fetchRefresh()
                                })
                            })
                        } catch (err) {
                            return await done({ loading: false }).then(async () => {
                                return await fetchNotifyService({ type: 'error', title: err.message })
                            })
                        }
                    })
                }
            })
        }

        async function fetchSubmit() {
            if (saving.value) {
                return
            }
            return await props.setState({ loading: true }).then(async () => {
                return await props.fetchValidater().then(async (error: boolean) => {
                    if (error) {
                        return await props.setState({ loading: false })
                    }
                    try {
                        const dataSource = state.dataSource.filter((item: Omix) => item.status !== 'deleted')
                        if (dataSource.length === 0) {
                            return await props.setState({ loading: false }).then(async () => {
                                return await fetchNotifyService({ type: 'warning', title: '没有可预览的报价草稿' })
                            })
                        }
                        /**费率、生效时间在单元格失焦/确认时已实时保存，这里无需再逐行提交**/
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
                <common-base-element is-white is-border wrap="p-inline-14 p-bs-14" class-name="flex flex-col p-14 gap-y-10 overflow-hidden">
                    <common-business-header bar title="基本信息"></common-business-header>
                    <common-base-columns-template class="gap-x-10 gap-y-5" type="auto-fill" number={250}>
                        <common-base-columns-wrapper label="客户名称：">{faseNode.value.name ?? '-'}</common-base-columns-wrapper>
                        <common-base-columns-wrapper label="客户别名：">{faseNode.value.alias ?? '-'}</common-base-columns-wrapper>
                        <common-base-columns-wrapper label="应用别名：">{formState.value.appAlias ?? '-'}</common-base-columns-wrapper>
                        <common-base-columns-wrapper label="报价币种：">{faseNode.value.currency ?? '-'}</common-base-columns-wrapper>
                    </common-base-columns-template>
                </common-base-element>
                <common-base-element class="flex flex-col flex-1 p-14 overflow-hidden">
                    <common-database-table
                        class="p-0! overflow-hidden"
                        show-index
                        show-command
                        pagination={false}
                        cols-row-height={32}
                        limit={state.limit}
                        total={state.total}
                        columns={state.columns}
                        v-model:page={state.page}
                        v-model:size={state.size}
                        v-model:select={state.select}
                        v-model:data={state.dataSource}
                        v-model:loading={state.loading}
                        v-model:initialize={state.initialize}
                        row-class-name={fetchRowClassName}
                        v-model:customize={state.customize}
                        on-update:customize={instOptions.fetchUpdateCustomize}
                        on-update:page={(page: number) => fetchRefresh({ page })}
                        on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                    >
                        {{
                            col_countryKeyId: (data: Omix) => (
                                <common-base-chunk
                                    mode="text"
                                    ellipsis
                                    value={data.countryKeyId}
                                    items={props.mccOptions.dataSource.value}
                                ></common-base-chunk>
                            ),
                            col_downStatus: (data: Omix) => (
                                <common-base-chunk
                                    value={data.downStatus}
                                    items={props.chunkOptions.changeStatusOptions}
                                ></common-base-chunk>
                            ),
                            col_upStatus: (data: Omix) => (
                                <common-base-chunk value={data.upStatus} items={props.chunkOptions.changeStatusOptions}></common-base-chunk>
                            ),
                            col_status: (data: Omix) => (
                                <common-base-chunk value={data.status} items={props.chunkOptions.draftStatusOptions}></common-base-chunk>
                            ),
                            col_downUsd: (data: Omix) => (
                                <crm-sms-quote-change-number
                                    mode="downUsd"
                                    key={data.keyId}
                                    v-model:node={data}
                                ></crm-sms-quote-change-number>
                            ),
                            col_upUsd: (data: Omix) => (
                                <crm-sms-quote-change-number
                                    mode="upUsd"
                                    key={data.keyId}
                                    v-model:node={data}
                                ></crm-sms-quote-change-number>
                            ),
                            col_effectiveTime: (data: Omix) => {
                                return <crm-sms-quote-change-datetime key={data.keyId} v-model:node={data}></crm-sms-quote-change-datetime>
                            },
                            col_command: (data: Omix) => (
                                <div class="flex items-center gap-x-8 overflow-hidden">
                                    {data.status === 'deleted' ? (
                                        <common-base-button text type="primary" onClick={() => fetchUpdateDraftStatus(data, 'enable')}>
                                            恢复
                                        </common-base-button>
                                    ) : (
                                        <common-base-button text type="warning" onClick={() => fetchUpdateDraftStatus(data, 'deleted')}>
                                            删除
                                        </common-base-button>
                                    )}
                                    <common-base-button text type="error" onClick={() => fetchDeleteDraft(data)}>
                                        移除
                                    </common-base-button>
                                </div>
                            )
                        }}
                    </common-database-table>
                </common-base-element>
                <common-base-element is-white class="flex p-14 gap-x-14 justify-center items-center overflow-hidden">
                    <n-button class="min-w-168" disabled={props.state.loading} onClick={() => props.setState({ current: 1 })}>
                        上一步：填写报价内容
                    </n-button>
                    <n-button
                        class="min-w-168"
                        type="primary"
                        loading={props.state.loading}
                        disabled={props.state.loading || saving.value}
                        onClick={fetchSubmit}
                    >
                        下一步：报价预览
                    </n-button>
                </common-base-element>
            </Fragment>
        )
    }
})
</script>

<style lang="scss" scoped>
/**
 * 价格变更行背景色：直接在行上覆写表格单元格的颜色变量（普通、悬浮、排序），
 * 悬浮与固定列都读取这些变量，因此鼠标移入不会覆盖背景色，也无需提高选择器权重。
 * 基于 --n-td-color 混色，避免引用自身变量造成循环。
 */
:deep(.n-data-table-tr.crm-sms-quote--increase) {
    --n-merged-td-color: color-mix(in srgb, var(--n-td-color) 88%, var(--error-color));
    --n-merged-td-color-hover: var(--n-merged-td-color);
    --n-merged-td-color-sorting: var(--n-merged-td-color);
}
:deep(.n-data-table-tr.crm-sms-quote--decrease) {
    --n-merged-td-color: color-mix(in srgb, var(--n-td-color) 88%, var(--warning-color));
    --n-merged-td-color-hover: var(--n-merged-td-color);
    --n-merged-td-color-sorting: var(--n-merged-td-color);
}
</style>
