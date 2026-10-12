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
        const { formRef, formState, state, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSkylineColumnDatetask({ ...payload, page: base.page, size: base.size }),
            {
                keyName: 'chat:deploy:datetask:system',
                actions: [
                    { title: '启用/停用', key: 'chat:deploy:datetask:system:status:update' },
                    { title: '编辑', key: 'chat:deploy:datetask:system:update' },
                    { title: '手动触发', key: 'chat:deploy:datetask:system:trigger' },
                    { title: '任务日志', key: 'chat:deploy:datetask:system:logs' }
                ],
                formState: {
                    /**任务所属模块**/
                    module: undefined,
                    /**任务名称**/
                    taskName: undefined,
                    /**任务状态**/
                    status: undefined
                }
            }
        )

        /**启用/停用任务**/
        async function fetchDatetaskStatusToggle(node: Omix) {
            const nextStatus = node.status === 'enable' ? 'disable' : 'enable'
            const nextLabel = nextStatus === 'enable' ? '启用' : '停用'
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认将任务【${node.taskName}】${nextLabel}吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSkylineDatetaskStatusUpdate({ taskId: node.taskId, status: nextStatus })
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

        /**查看执行日志**/
        async function fetchDatetaskLog(node: Omix) {
            return await fetchDeployDatetaskLog({
                title: `执行日志 - ${node.taskName}`,
                node
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

        /**手动触发后最多轮询的时长，超时提示到执行日志中查看**/
        const TRIGGER_POLL_TIMEOUT = 60_000
        /**手动触发后轮询执行结果的间隔**/
        const TRIGGER_POLL_INTERVAL = 2_000

        /**轮询执行记录直到结束或超时；返回 undefined 表示超时仍未结束**/
        async function fetchDatetaskExecutionWait(executionId: string): Promise<Omix | undefined> {
            const deadline = Date.now() + TRIGGER_POLL_TIMEOUT
            while (Date.now() < deadline) {
                await new Promise(resolve => setTimeout(resolve, TRIGGER_POLL_INTERVAL))
                const { data } = await Service.httpBaseSkylineResolverDatetaskLog({ executionId })
                if (['success', 'failed'].includes(data.status)) return data
            }
            return undefined
        }

        /**按执行记录的最终状态提示结果**/
        async function fetchDatetaskExecutionNotify(execution?: Omix) {
            if (!execution) {
                return await fetchNotifyService({ type: 'warning', title: '任务仍在执行', message: '请稍后在执行日志中查看结果' })
            }
            if (execution.status === 'success') {
                return await fetchNotifyService({ title: '任务执行成功' })
            }
            return await fetchNotifyService({ type: 'error', title: '任务执行失败', message: execution.error ?? '请在执行日志中查看原因' })
        }

        /**手动触发任务：服务端最多等待数秒，未结束时转为轮询执行记录**/
        async function fetchDatetaskTrigger(node: Omix) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认手动触发任务【${node.taskName}】吗？任务将立即执行一次。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            const { data } = await Service.httpBaseSkylineTriggerDatetask({ taskId: node.taskId })
                            await done({ visible: false })
                            if (data.finished) {
                                await fetchRefresh()
                                return await fetchDatetaskExecutionNotify(data.execution)
                            }
                            await fetchNotifyService({ type: 'info', title: '任务已提交执行', message: '正在等待执行结果' })
                            const execution = await fetchDatetaskExecutionWait(data.executionId)
                            await fetchRefresh()
                            return await fetchDatetaskExecutionNotify(execution)
                        } catch (err) {
                            await done({ loading: false })
                            return await fetchNotifyService({ type: 'error', title: err.message })
                        }
                    })
                }
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
                    <common-database-search-column disabled prop="taskName" label="任务名称">
                        <form-base-input
                            clearable
                            placeholder="请输入任务名称"
                            v-model:value={formState.value.taskName}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="module" label="所属模块">
                        <form-base-select
                            clearable
                            placeholder="请选择所属模块"
                            loading={chunkState.loading}
                            options={chunkOptions.value.moduleOptions}
                            v-model:value={formState.value.module}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
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
                        {state.dataSource.map((item: Omix) => (
                            <n-card key={item.taskId} embedded content-class="p-12! flex flex-col gap-y-10">
                                <div class="flex items-center justify-between gap-x-10 overflow-hidden">
                                    <n-h4 class="m-be-0">{item.taskName}</n-h4>
                                    <common-base-chunk bordered value={item.module} items={chunkOptions.value.moduleOptions}></common-base-chunk>
                                </div>
                                <common-base-columns-wrapper vertical label="处理器标识" label-class="text-12">
                                    {item.handler}
                                </common-base-columns-wrapper>
                                <common-base-columns-wrapper vertical label="定时规则" label-class="text-12">
                                    {item.cron}
                                </common-base-columns-wrapper>
                                <div class="grid-cols-2 gap-x-10 overflow-hidden">
                                    <common-base-columns-wrapper vertical label="更新人" label-class="text-12">
                                        <common-base-user element="text" data={item.modifyByOptions}></common-base-user>
                                    </common-base-columns-wrapper>
                                    <common-base-columns-wrapper vertical label="更新时间" label-class="text-12">
                                        {item.modifyTime ?? '-'}
                                    </common-base-columns-wrapper>
                                </div>
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
                                    <common-base-element abstract class="flex items-center gap-x-12 overflow-hidden">
                                        <common-base-authorize key-name={state.actions[0].key}>
                                            {item.status === 'enable' ? (
                                                <common-base-button
                                                    class="p-inline-6"
                                                    title="停用任务"
                                                    type="warning"
                                                    secondary
                                                    icon-size={20}
                                                    icon={Pause}
                                                    onClick={() => fetchDatetaskStatusToggle(item)}
                                                ></common-base-button>
                                            ) : (
                                                <common-base-button
                                                    class="p-inline-6"
                                                    title="启用任务"
                                                    type="success"
                                                    secondary
                                                    icon-size={20}
                                                    icon={Play}
                                                    onClick={() => fetchDatetaskStatusToggle(item)}
                                                ></common-base-button>
                                            )}
                                        </common-base-authorize>
                                        <common-base-authorize key-name={state.actions[1].key}>
                                            <common-base-button
                                                class="p-inline-6"
                                                title="修改定时规则"
                                                type="primary"
                                                secondary
                                                icon-size={20}
                                                icon={Edit}
                                                onClick={() => fetchDatetaskCronUpdate(item)}
                                            ></common-base-button>
                                        </common-base-authorize>
                                        <common-base-authorize key-name={state.actions[2].key}>
                                            <common-base-button
                                                class="p-inline-6"
                                                title="手动触发"
                                                type="info"
                                                secondary
                                                icon-size={20}
                                                icon={Flash}
                                                onClick={() => fetchDatetaskTrigger(item)}
                                            ></common-base-button>
                                        </common-base-authorize>
                                        <common-base-authorize key-name={state.actions[3].key}>
                                            <common-base-button
                                                class="p-inline-6"
                                                title="查看日志"
                                                type="info"
                                                secondary
                                                icon-size={20}
                                                icon={Document}
                                                onClick={() => fetchDatetaskLog(item)}
                                            ></common-base-button>
                                        </common-base-authorize>
                                    </common-base-element>
                                </div>
                            </n-card>
                        ))}
                    </common-base-columns-template>
                </common-database-wrapper>
            </layout-common-container>
        )
    }
})
</script>
