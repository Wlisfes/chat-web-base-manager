<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, pick } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/nexus/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsRoute',
    setup(props) {
        /**路由静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        /**表格实例**/
        const { formRef, formState, state, router, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnRoute({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:sms:route',
                actions: [
                    { title: '规则', key: 'chat:nexus:sms:route:rule' },
                    { title: '应用', key: 'chat:nexus:sms:route:app' },
                    { title: '编辑', key: 'chat:nexus:sms:route:update' },
                    { title: '删除', key: 'chat:nexus:sms:route:delete' }
                ],
                formState: {
                    /**路由名称或别名**/
                    name: undefined,
                    /**路由状态**/
                    status: undefined
                },
                columns: [
                    { title: '路由ID', key: 'keyId', width: 100, disabled: true },
                    { title: '路由别名', key: 'alias', width: 180, disabled: true },
                    { title: '路由名称', key: 'name', minWidth: 180, disabled: true },
                    { title: '路由类型', key: 'type', width: 100 },
                    { title: '路由状态', key: 'status', width: 100 },
                    { title: '规则数', key: 'ruleCount', width: 100 },
                    { title: '绑定应用', key: 'appCount', width: 100 },
                    { title: '创建人', key: 'createBy', width: 120, check: false },
                    { title: '创建时间', key: 'createTime', width: 160, check: false },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 },
                    { title: '备注', key: 'remark', minWidth: 200 }
                ]
            }
        )

        /**新增路由**/
        async function fetchCreateRoute() {
            return await feedback.fetchNexusSmsRoute({
                title: '新增路由',
                command: 'CREATE',
                onSubmit: () => fetchRefresh()
            })
        }

        /**编辑路由**/
        async function fetchUpdateRoute(node: Omix) {
            return await feedback.fetchNexusSmsRoute({
                title: '编辑路由',
                command: 'UPDATE',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**规则管理：跳转到路由规则页并按当前路由筛选**/
        async function fetchRouteRule(node: Omix) {
            return await router.push({ path: '/nexus/sms/rule', query: { routeKeyId: node.keyId } })
        }

        /**短信应用绑定**/
        async function fetchRouteApp(node: Omix) {
            return await feedback.fetchNexusSmsRouteApp({
                title: `绑定短信应用：${node.name}`,
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**选路预览**/
        async function fetchRoutePreview() {
            return await feedback.fetchNexusSmsRoutePreview({ title: '选路预览' })
        }

        /**删除路由**/
        async function fetchDeleteRoute(node: Omix) {
            return await fetchDialogService({
                title: '删除路由',
                content: `确认删除路由【${node.name}】吗？路由下的规则和通道配置会一起删除。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmDeleteRoute({ keyId: node.keyId })
                            return await done({ visible: false }).then(async () => {
                                await fetchNotifyService({ title: '操作成功' })
                                return await fetchRefresh()
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

        return () => (
            <layout-common-container initialize={state.initialize}>
                <common-database-search
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy']}
                    ref={formRef}
                    label-width={85}
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
                        <common-base-authorize key-name="chat:nexus:sms:route:create">
                            <common-base-button class="min-w-80" type="primary" onClick={fetchCreateRoute}>
                                新增
                            </common-base-button>
                        </common-base-authorize>
                        <common-base-authorize key-name="chat:nexus:sms:route:preview">
                            <common-base-button class="min-w-80" onClick={fetchRoutePreview}>
                                选路预览
                            </common-base-button>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="路由">
                        <form-base-input
                            clearable
                            placeholder="路由名称或别名"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="路由状态">
                        <form-base-select
                            clearable
                            placeholder="请选择路由状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-settings
                    show-command={instState.value.showCommand}
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
                        col_type: (data: Omix) => (
                            <common-base-chunk value={data.type} items={chunkOptions.value.routeTypeOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_createBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.createByOptions}></common-base-user>
                        },
                        col_modifyBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.modifyByOptions}></common-base-user>
                        },
                        col_command: (data: Omix) => (
                            <common-base-element abstract class="flex items-center gap-x-10 overflow-hidden">
                                <common-base-authorize key-name={state.actions[0].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'primary', title: '规则', content: '规则' }}
                                        onClick={() => fetchRouteRule(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[1].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'primary', title: '应用', content: '应用' }}
                                        onClick={() => fetchRouteApp(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[2].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'info', title: '编辑', content: '编辑' }}
                                        onClick={() => fetchUpdateRoute(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[3].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'error', content: '删除' }}
                                        title={data.appCount > 0 ? '定向路由仍有绑定的短信应用，请先解绑' : '删除'}
                                        disabled={data.appCount > 0}
                                        onClick={() => fetchDeleteRoute(data)}
                                    />
                                </common-base-authorize>
                            </common-base-element>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
