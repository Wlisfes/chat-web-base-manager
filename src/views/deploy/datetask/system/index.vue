<script lang="tsx">
import { defineComponent } from 'vue'
import { Document, Edit, Flash, Pause, Play } from '@vicons/carbon'
import { useColumnService, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { fetchDeployDatetaskCron, fetchDeployDatetaskLog } from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeployDatetaskSystem',
    setup(props, ctx) {
        /**系统任务静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSkylineDatetaskEnums(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSkylineColumnDatetask({ ...payload, page: base.page, size: base.size }),
            keyName: 'chat:deploy:datetask:system',
            formState: {
                /**任务类型**/
                type: 'system',
                /**任务名称**/
                taskName: undefined,
                /**任务状态**/
                status: undefined
            }
        })

        /**启用/停用任务**/
        async function fetchDatetaskStatusToggle(node: Omix) {
            const nextStatus = ['running', 'wait'].includes(node.status) ? 'stop' : 'running'
            const nextLabel = nextStatus === 'running' ? '启用' : '停用'
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认将任务【${node.taskName}】${nextLabel}吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSkylineUpdateDatetaskStatus({ taskId: node.taskId, status: nextStatus })
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
        async function fetchDatetaskCronUpdate(node: Omix) {
            return await fetchDeployDatetaskCron({
                title: '修改Cron表达式',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**手动触发任务**/
        async function fetchDatetaskTrigger(node: Omix) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认手动触发任务【${node.taskName}】吗？任务将立即执行一次。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            const response = await Service.httpBaseSkylineTriggerDatetask({ taskId: node.taskId })
                            await fetchRefresh()
                            await done({ visible: false })
                            const result = response.data?.result
                            if (result?.skipped) {
                                return await fetchNotifyService({
                                    type: 'warning',
                                    title: '任务未执行',
                                    message: result.reason ?? '任务被跳过'
                                })
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
        async function fetchDatetaskLog(node: Omix) {
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
                    {/* <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-button
                            dashed
                            type="warning"
                            disabled={instState.value.isUpdate || isFinishedSelected.value}
                            onClick={fetchDatetaskStatusToggle}
                        >
                            启用/停用
                        </common-base-button>
                        <common-base-button
                            dashed
                            type="primary"
                            disabled={instState.value.isUpdate || isFinishedSelected.value}
                            onClick={fetchDatetaskCronUpdate}
                        >
                            修改Cron
                        </common-base-button>
                        <common-base-button
                            dashed
                            type="info"
                            disabled={instState.value.isUpdate || isFinishedSelected.value}
                            onClick={fetchDatetaskTrigger}
                        >
                            手动触发
                        </common-base-button>
                        <common-base-button dashed disabled={instState.value.isUpdate} onClick={fetchDatetaskLog}>
                            执行日志
                        </common-base-button>
                    </common-database-search-function> */}
                    <common-database-search-column disabled prop="taskName" label="任务名称">
                        <form-base-input
                            clearable
                            placeholder="请输入任务名称"
                            v-model:value={formState.value.taskName}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="任务状态">
                        <form-base-select
                            clearable
                            placeholder="请选择任务状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-wrapper
                    limit={state.limit}
                    total={state.total}
                    v-model:page={state.page}
                    v-model:size={state.size}
                    v-model:data={state.dataSource}
                    v-model:loading={state.loading}
                    v-model:initialize={state.initialize}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                >
                    <common-base-columns-template class="gap-[var(--common-limit-width)]" type="auto-fill" number={320}>
                        {state.dataSource.map(item => (
                            <n-card key={item.taskId} embedded content-class="p-12! flex flex-col gap-y-5">
                                <n-h4 class="m-be-0">{item.taskName}</n-h4>
                                <common-base-columns-wrapper vertical label="处理器标识" label-class="text-12">
                                    {item.handler}
                                </common-base-columns-wrapper>
                                <common-base-columns-wrapper vertical label="定时规则" label-class="text-12">
                                    {item.cron}
                                </common-base-columns-wrapper>
                                <div class="grid-cols-2 gap-x-10 overflow-hidden">
                                    <common-base-columns-wrapper vertical label="上次执行" label-class="text-12">
                                        {item.lastTime ?? '-'}
                                    </common-base-columns-wrapper>
                                    <common-base-columns-wrapper vertical label="下次执行" label-class="text-12">
                                        {item.nextTime ?? '-'}
                                    </common-base-columns-wrapper>
                                </div>
                                <div class="flex items-end justify-between gap-x-12 p-bs-10 overflow-hidden">
                                    <common-base-chunk
                                        bordered
                                        value={item.status}
                                        items={chunkOptions.value.statusOptions}
                                    ></common-base-chunk>
                                    <div class="flex items-center gap-x-12 overflow-hidden">
                                        {['running', 'wait'].includes(item.status) ? (
                                            <common-base-button
                                                class="p-inline-7"
                                                title="停用任务"
                                                type="warning"
                                                secondary
                                                icon-size={20}
                                                icon={Pause}
                                                onClick={() => fetchDatetaskStatusToggle(item)}
                                            ></common-base-button>
                                        ) : (
                                            <common-base-button
                                                class="p-inline-7"
                                                title="启用任务"
                                                type="success"
                                                secondary
                                                icon-size={20}
                                                icon={Play}
                                                onClick={() => fetchDatetaskStatusToggle(item)}
                                            ></common-base-button>
                                        )}
                                        <common-base-button
                                            class="p-inline-7"
                                            title="修改定时规则"
                                            type="primary"
                                            secondary
                                            icon-size={20}
                                            icon={Edit}
                                            onClick={() => fetchDatetaskCronUpdate(item)}
                                        ></common-base-button>
                                        <common-base-button
                                            class="p-inline-7"
                                            title="手动触发"
                                            type="info"
                                            secondary
                                            icon-size={20}
                                            icon={Flash}
                                            onClick={() => fetchDatetaskTrigger(item)}
                                        ></common-base-button>
                                        <common-base-button
                                            class="p-inline-7"
                                            title="查看日志"
                                            type="info"
                                            secondary
                                            icon-size={20}
                                            icon={Document}
                                            onClick={() => fetchDatetaskLog(item)}
                                        ></common-base-button>
                                    </div>
                                </div>
                            </n-card>
                        ))}
                    </common-base-columns-template>
                </common-database-wrapper>
                {/* <common-database-table
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
                            ></common-database-table-chunk>
                        ),
                        col_status: (data: Datetask.DatetaskItem) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.status}
                            ></common-database-table-chunk>
                        )
                    }}
                </common-database-table> */}
            </layout-common-container>
        )
    }
})
</script>
