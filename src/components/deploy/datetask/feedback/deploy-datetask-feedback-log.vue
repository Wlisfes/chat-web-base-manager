<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService } from '@/hooks'
import * as Service from '@/api/instance.service'

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
        const { state, chunkState, instOptions, setState, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSystemColumnDatetaskLog({ ...payload, taskId: props.node.taskId }),
            chunkNames: { CHUNK_DATETASK_LOG_STATUS: true },
            formState: {},
            limit: 0,
            columns: [
                { title: '任务ID', key: 'taskId', width: 100, check: true },
                { title: '执行状态', key: 'status', width: 100, check: true },
                { title: '耗时(ms)', key: 'duration', width: 100, check: true },
                { title: '开始时间', key: 'startTime', width: 160, check: true },
                { title: '结束时间', key: 'endTime', width: 160, check: true },
                { title: '结果/错误', key: 'result', minWidth: 200, check: true, ellipsis: { tooltip: true } }
            ]
        })

        return () => (
            <common-dialog-provider
                title={props.title}
                width={1080}
                showAction={false}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <common-element class="h-90vh max-h-640 flex flex-col overflow-hidden">
                    <common-database-table
                        pagination-class="p-bs-14!"
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
                                <common-database-table-chunk
                                    element="chunk"
                                    value={data.status}
                                    options={chunkState.CHUNK_DATETASK_LOG_STATUS}
                                ></common-database-table-chunk>
                            )
                        }}
                    </common-database-table>
                </common-element>
            </common-dialog-provider>
        )
    }
})
</script>
