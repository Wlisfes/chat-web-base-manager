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
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnRoute({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:sms:route',
                actions: [
                    { title: '规则', key: 'chat:nexus:sms:route:rule' },
                    { title: '应用', key: 'chat:nexus:sms:route:app' },
                    { title: '编辑', key: 'chat:nexus:sms:route:update' },
                    { title: '默认', key: 'chat:nexus:sms:route:default' },
                    { title: '删除', key: 'chat:nexus:sms:route:delete' }
                ],
                formState: {
                    /**方案名称或别名**/
                    name: undefined,
                    /**方案状态**/
                    status: undefined
                },
                columns: [
                    { title: '方案ID', key: 'keyId', width: 90, disabled: true },
                    { title: '方案名称', key: 'name', minWidth: 180, disabled: true },
                    { title: '方案别名', key: 'alias', minWidth: 140 },
                    { title: '方案状态', key: 'status', width: 100 },
                    { title: '规则数', key: 'ruleCount', width: 90 },
                    { title: '绑定应用', key: 'appCount', width: 100 },
                    { title: '备注', key: 'remark', minWidth: 160 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        /**新增方案**/
        async function fetchCreateRoute() {
            return await feedback.fetchNexusSmsRoute({ title: '新增路由方案', command: 'CREATE', onSubmit: () => fetchRefresh() })
        }

        /**编辑方案**/
        async function fetchUpdateRoute(node: Omix) {
            return await feedback.fetchNexusSmsRoute({ title: '编辑路由方案', command: 'UPDATE', node, onSubmit: () => fetchRefresh() })
        }

        /**规则管理**/
        async function fetchRouteRule(node: Omix) {
            return await feedback.fetchNexusSmsRouteRule({ title: `路由规则：${node.name}`, node, onSubmit: () => fetchRefresh() })
        }

        /**短信应用绑定**/
        async function fetchRouteApp(node: Omix) {
            return await feedback.fetchNexusSmsRouteApp({ title: `绑定短信应用：${node.name}`, node, onSubmit: () => fetchRefresh() })
        }

        /**选路预览**/
        async function fetchRoutePreview() {
            return await feedback.fetchNexusSmsRoutePreview({ title: '选路预览' })
        }

        /**设为默认方案**/
        async function fetchDefaultRoute(node: Omix) {
            return await fetchDialogService({
                title: '设为默认方案',
                content: `确认把【${node.name}】设为默认方案吗？未绑定方案或绑定方案没有匹配规则的短信应用都会走该方案，原默认方案会被取消。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmRouteDefaultUpdate({ keyId: node.keyId })
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

        /**删除方案**/
        async function fetchDeleteRoute(node: Omix) {
            return await fetchDialogService({
                title: '删除路由方案',
                content: `确认删除方案【${node.name}】吗？方案下的规则和通道配置会一起删除。`,
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
                    <common-database-search-column disabled prop="name" label="方案">
                        <form-base-input
                            clearable
                            placeholder="方案名称或别名"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="方案状态">
                        <form-base-select
                            clearable
                            placeholder="请选择方案状态"
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
                        col_name: (data: Omix) => (
                            <div class="flex items-center gap-6 overflow-hidden">
                                <common-base-content value={data.name}></common-base-content>
                                {data.isDefault && (
                                    <n-tag size="small" type="success" bordered={false}>
                                        默认
                                    </n-tag>
                                )}
                            </div>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_ruleCount: (data: Omix) => <n-text type={data.ruleCount > 0 ? 'default' : 'warning'}>{data.ruleCount}</n-text>,
                        col_appCount: (data: Omix) => (data.isDefault ? <n-text depth="3">兜底</n-text> : <n-text>{data.appCount}</n-text>),
                        col_createBy: (data: Omix) => <common-base-user element="text" data={data.createByOptions}></common-base-user>,
                        col_modifyBy: (data: Omix) => <common-base-user element="text" data={data.modifyByOptions}></common-base-user>,
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
                                {!data.isDefault && (
                                    <common-base-authorize key-name={state.actions[3].key}>
                                        <common-base-button
                                            {...{ text: true, type: 'warning', title: '设为默认', content: '设为默认' }}
                                            onClick={() => fetchDefaultRoute(data)}
                                        />
                                    </common-base-authorize>
                                )}
                                {!data.isDefault && (
                                    <common-base-authorize key-name={state.actions[4].key}>
                                        <common-base-button
                                            {...{ text: true, type: 'error', title: '删除', content: '删除' }}
                                            onClick={() => fetchDeleteRoute(data)}
                                        />
                                    </common-base-authorize>
                                )}
                            </common-base-element>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
