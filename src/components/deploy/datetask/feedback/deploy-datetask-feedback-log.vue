<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useChunkService } from '@/hooks'
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
        /**系统任务静态枚举**/
        const { chunkOptions } = useChunkService(e => Service.httpBaseSkylineDatetaskEnums(), {
            immediate: true
        })
        const { state, instOptions, setState, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSkylineColumnDatetaskLog({ ...payload, page: base.page, size: base.size }),
            formState: { taskId: props.node.taskId },
            limit: 0,
            columns: [
                { title: '任务ID', key: 'taskId', width: 180 },
                { title: '执行状态', key: 'status', width: 100 },
                { title: '耗时(ms)', key: 'duration', width: 100 },
                { title: '开始时间', key: 'startTime', width: 190 },
                { title: '结束时间', key: 'endTime', width: 190 },
                { title: '结果/错误', key: 'result', minWidth: 200 }
            ]
        })

        return () => (
            <common-dialog-provider
                title={props.title}
                width={1280}
                showAction={false}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <common-base-element class="h-90vh max-h-640 flex flex-col overflow-hidden">
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
                                <common-base-chunk
                                    bordered
                                    value={data.status}
                                    items={chunkOptions.value.logStatusOptions}
                                ></common-base-chunk>
                            )
                        }}
                    </common-database-table>
                </common-base-element>
            </common-dialog-provider>
        )
    }
})
</script>
