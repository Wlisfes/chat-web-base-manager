<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useChunkService } from '@/hooks'
import * as Service from '@/api/instance.service'

/**执行结果统计字段的中文名称；未列出的字段按原字段名展示。*/
const RESULT_LABELS: Record<string, string> = {
    date: '日期',
    source: '数据来源',
    fetched: '外部返回',
    enabled: '启用币种',
    inserted: '新增',
    skipped: '跳过',
    count: '新增',
    insertedCurrencies: '新增币种',
    skippedCurrencies: '跳过币种',
    missingCurrencies: '未返回币种'
}

/**结果说明：优先使用任务返回的 summary，旧记录只有 date、count 时补一句说明。*/
function fetchResultSummary(result: Omix): string {
    if (typeof result.summary === 'string' && result.summary) return result.summary
    if (result.count !== undefined) return `${result.date ?? ''} 新增 ${result.count} 条`.trim()
    return Object.keys(result).length ? '执行成功' : '-'
}

/**把统计明细转换为“名称：值”的行，数组用顿号连接，空数组显示为“无”。*/
function fetchResultLines(result: Omix): Array<{ label: string; value: string }> {
    return Object.entries(result)
        .filter(([key, value]) => key !== 'summary' && value !== undefined && value !== null)
        .map(([key, value]) => ({
            label: RESULT_LABELS[key] ?? key,
            value: Array.isArray(value) ? value.join('、') || '无' : typeof value === 'object' ? JSON.stringify(value) : String(value)
        }))
}

export default defineComponent({
    name: 'DeployDatetaskFeedbackLog',
    emits: ['close'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**系统任务静态枚举**/
        const { chunkOptions } = useChunkService(e => Service.httpBaseSkylineDatetaskEnums(), {
            immediate: true
        })
        const { state, instOptions, setState, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSkylineColumnDatetaskLog({ ...payload, page: base.page, size: base.size }),
            {
                formState: { taskId: props.node.taskId },
                limit: 0,
                columns: [
                    { title: '执行状态', key: 'status', width: 100 },
                    { title: '触发方式', key: 'triggerType', width: 100 },
                    { title: '触发人', key: 'createBy', width: 120 },
                    { title: '尝试次数', key: 'attempts', width: 100 },
                    { title: '计划时间', key: 'scheduledTime', width: 190 },
                    { title: '下次重试', key: 'nextRetryTime', width: 190 },
                    { title: '结束时间', key: 'endTime', width: 190 },
                    { title: '耗时(ms)', key: 'duration', width: 100 },
                    { title: '结果/失败原因', key: 'result', minWidth: 320 }
                ]
            }
        )

        return () => (
            <common-dialog-provider
                title={props.title}
                width={1440}
                action={false}
                scrollbar={false}
                class-element="p-inline-20 p-be-20"
                class-name="h-90vh max-h-750!"
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <common-database-table
                    pagination-class="p-bs-12!"
                    bordered={false}
                    limit={state.limit}
                    total={state.total}
                    columns={state.columns}
                    v-model:page={state.page}
                    v-model:size={state.size}
                    v-model:data={state.dataSource}
                    v-model:loading={state.loading}
                    v-model:initialize={state.initialize}
                    v-model:customize={state.customize}
                    on-update:customize={instOptions.fetchUpdateCustomize}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                >
                    {{
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.logStatusOptions}></common-base-chunk>
                        ),
                        col_triggerType: (data: Omix) => (
                            <common-base-chunk
                                bordered
                                value={data.triggerType}
                                items={chunkOptions.value.triggerTypeOptions}
                            ></common-base-chunk>
                        ),
                        col_createBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.createByOptions}></common-base-user>
                        },
                        col_attempts: (data: Omix) => `${data.attempts ?? 0} / ${data.maxAttempts ?? '-'}`,
                        col_nextRetryTime: (data: Omix) => data.nextRetryTime ?? '-',
                        col_endTime: (data: Omix) => data.endTime ?? '-',
                        col_result: (data: Omix) => {
                            if (data.error && data.status !== 'success') {
                                return <n-text type="error">{data.error}</n-text>
                            }
                            if (!data.result) return '-'
                            const lines = fetchResultLines(data.result)
                            return (
                                <n-popover trigger="hover" placement="left" disabled={lines.length === 0}>
                                    {{
                                        trigger: () => <n-ellipsis tooltip={false}>{fetchResultSummary(data.result)}</n-ellipsis>,
                                        default: () => (
                                            <div class="flex flex-col gap-y-4 max-w-420">
                                                {lines.map(line => (
                                                    <div key={line.label} class="flex gap-x-8">
                                                        <n-text depth={3} class="shrink-0">{`${line.label}：`}</n-text>
                                                        <n-text class="break-all">{line.value}</n-text>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    }}
                                </n-popover>
                            )
                        }
                    }}
                </common-database-table>
            </common-dialog-provider>
        )
    }
})
</script>
