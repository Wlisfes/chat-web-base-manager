<script lang="tsx">
import { computed, defineComponent } from 'vue'
import { useColumnService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { fetchDeployDatetaskCron, fetchDeployDatetaskLog } from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'
import type * as Datetask from '@/interface/deploy/deploy-datetask.resolver'

export default defineComponent({
    name: 'DeployDatetaskSystem',
    setup(props, ctx) {
        /**表格实例**/
        const { formRef, formState, state, chunkState, instState, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) =>
                Service.httpBaseSystemColumnDatetask({
                    ...payload,
                    page: base.page,
                    size: base.size
                }),
            keyName: 'chatbok:deploy:datetask:system',
            chunkNames: { CHUNK_DATETASK_TYPE: true, CHUNK_DATETASK_STATUS: true },
            formState: {
                taskName: undefined,
                status: undefined
            },
            columns: [
                { title: '任务ID', key: 'taskId', width: 180, disabled: true },
                { title: '任务名称', key: 'taskName', width: 200, disabled: true },
                { title: '处理器标识', key: 'handler', width: 240, disabled: true },
                { title: '任务描述', key: 'comment', minWidth: 200, check: true },
                { title: 'Cron表达式', key: 'cron', width: 160, check: true },
                { title: '任务类型', key: 'type', width: 120, check: true },
                { title: '任务状态', key: 'status', width: 120, check: true },
                { title: '上次执行', key: 'lastTime', width: 160, check: true },
                { title: '下次执行', key: 'nextTime', width: 160, check: true },
                { title: '创建时间', key: 'createTime', width: 160, check: true },
                { title: '更新时间', key: 'modifyTime', width: 160, check: true }
            ]
        })

        /**已完成任务不可再修改或触发。*/
        const isFinishedSelected = computed(() => {
            const node = state.select.length === 1 ? (state.select[0] as Datetask.DatetaskItem) : undefined
            return node?.status === 'finish'
        })

        /**启用/停用任务**/
        async function fetchDatetaskStatusToggle() {
            const node = state.select[0] as Datetask.DatetaskItem
            const nextStatus = node.status === 'running' ? 'stop' : 'running'
            const nextLabel = nextStatus === 'running' ? '启用' : '停用'
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认将任务【${node.taskName}】${nextLabel}吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSystemUpdateDatetaskStatus({ taskId: node.taskId, status: nextStatus })
                            await fetchRefresh()
                            return await done({ visible: false })
                        } catch (err) {
                            await done({ loading: false })
                            return await fetchNotifyService({ type: 'error', title: err.message })
                        }
                    })
                }
            })
        }

        /**修改Cron表达式**/
        async function fetchDatetaskCronUpdate() {
            const node = state.select[0] as Datetask.DatetaskItem
            return await fetchDeployDatetaskCron({
                title: '修改Cron表达式',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**手动触发任务**/
        async function fetchDatetaskTrigger() {
            const node = state.select[0] as Datetask.DatetaskItem
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认手动触发任务【${node.taskName}】吗？任务将立即执行一次。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            const response = await Service.httpBaseSystemTriggerDatetask({ taskId: node.taskId })
                            await fetchRefresh()
                            await done({ visible: false })
                            const result = response.data?.result
                            if (result?.skipped) {
                                return await fetchNotifyService({ type: 'warning', title: '任务未执行', message: result.reason ?? '任务被跳过' })
                            }
                            return await fetchNotifyService({ title: '任务执行成功' })
                        } catch (err) {
                            await done({ loading: false })
                            return await fetchNotifyService({ type: 'error', title: err.message })
                        }
                    })
                }
            })
        }

        /**查看执行日志**/
        async function fetchDatetaskLog() {
            const node = state.select[0] as Datetask.DatetaskItem
            return await fetchDeployDatetaskLog({
                title: `执行日志 - ${node.taskName}`,
                node
            })
        }

        return () => (
            <layout-common-container initialize={state.initialize}>
                <common-database-search
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy', 'abstract']}
                    ref={formRef}
                    limit={state.limit}
                    v-model:loading={state.loading}
                    v-model:when={state.when}
                    v-model:database={state.database}
                    v-model:formState={formState.value}
                    on-update:database={instOptions.fetchUpdateDatabase}
                    on-restore={instOptions.fetchRestore}
                    on-submit={instOptions.fetchRequest}
                >
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-element-button
                            dashed
                            type="warning"
                            disabled={instState.value.isUpdate || isFinishedSelected.value}
                            onClick={fetchDatetaskStatusToggle}
                        >
                            启用/停用
                        </common-element-button>
                        <common-element-button
                            dashed
                            type="primary"
                            disabled={instState.value.isUpdate || isFinishedSelected.value}
                            onClick={fetchDatetaskCronUpdate}
                        >
                            修改Cron
                        </common-element-button>
                        <common-element-button
                            dashed
                            type="info"
                            disabled={instState.value.isUpdate || isFinishedSelected.value}
                            onClick={fetchDatetaskTrigger}
                        >
                            手动触发
                        </common-element-button>
                        <common-element-button dashed disabled={instState.value.isUpdate} onClick={fetchDatetaskLog}>
                            执行日志
                        </common-element-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="taskName" label="任务名称">
                        <form-common-column-input
                            clearable
                            placeholder="请输入任务名称"
                            v-model:value={formState.value.taskName}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="任务状态">
                        <form-common-column-select
                            placeholder="请选择任务状态"
                            options={chunkState.CHUNK_DATETASK_STATUS}
                            v-model:value={formState.value.status}
                        ></form-common-column-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-select
                    show-settings
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
                        col_type: (data: Datetask.DatetaskItem) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.type}
                                options={chunkState.CHUNK_DATETASK_TYPE}
                            ></common-database-table-chunk>
                        ),
                        col_status: (data: Datetask.DatetaskItem) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.status}
                                options={chunkState.CHUNK_DATETASK_STATUS}
                            ></common-database-table-chunk>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
