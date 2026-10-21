<script lang="tsx">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useColumnService, useChunkService, useSelectService, pick } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/nexus/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsRoute',
    setup(props) {
        const route = useRoute()
        /**路由静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), { immediate: true })
        /**客户下拉**/
        const userOptions = useSelectService(() => Service.httpBaseCrmSelectUser({}), {
            immediate: true,
            transform: data => data.map((item: Omix) => ({ ...item, showName: `${item.alias} - ${item.name}` }))
        })
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnRoute({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:sms:route',
                actions: [
                    { title: '通道', key: 'chat:nexus:sms:route:channel' },
                    { title: '编辑', key: 'chat:nexus:sms:route:update' },
                    { title: '删除', key: 'chat:nexus:sms:route:delete' }
                ],
                formState: {
                    /**方向**/
                    countryKeyId: route.query.countryKeyId ? Number(route.query.countryKeyId) : undefined,
                    /**短信类型**/
                    type: route.query.type ? String(route.query.type) : undefined,
                    /**客户：0 表示只看默认路由**/
                    userKeyId: undefined,
                    /**路由状态**/
                    status: undefined
                },
                columns: [
                    { title: '路由ID', key: 'keyId', width: 90, disabled: true },
                    { title: '方向', key: 'countryKeyId', minWidth: 200, disabled: true },
                    { title: '短信类型', key: 'type', width: 110 },
                    { title: '适用客户', key: 'userKeyId', minWidth: 180 },
                    { title: '路由状态', key: 'status', width: 100 },
                    { title: '通道（可用/全部）', key: 'channelCount', width: 140 },
                    { title: '备注', key: 'remark', minWidth: 160 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        /**新增路由**/
        async function fetchCreateRoute() {
            return await feedback.fetchNexusSmsRoute({ title: '新增路由', command: 'CREATE', onSubmit: () => fetchRefresh() })
        }

        /**编辑路由**/
        async function fetchUpdateRoute(node: Omix) {
            return await feedback.fetchNexusSmsRoute({ title: '编辑路由', command: 'UPDATE', node, onSubmit: () => fetchRefresh() })
        }

        /**路由通道管理**/
        async function fetchRouteChannel(node: Omix) {
            const country = node.countryKeyIdOptions?.cnName ?? node.countryKeyId
            const user = node.userKeyIdOptions?.name ?? '默认路由'
            return await feedback.fetchNexusSmsRouteChannel({
                title: `路由通道：${country} / ${node.type} / ${user}`,
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**删除路由**/
        async function fetchDeleteRoute(node: Omix) {
            return await fetchDialogService({
                title: '删除路由',
                content: `确认删除这条路由吗？路由下的通道配置会一起删除，${node.userKeyId ? '该客户将回落到默认路由' : '该方向和类型将没有默认路由'}。`,
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
                    </common-database-search-function>
                    <common-database-search-column disabled prop="countryKeyId" label="方向">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择方向"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="type" label="短信类型">
                        <form-base-select
                            clearable
                            placeholder="请选择短信类型"
                            loading={chunkState.loading}
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="userKeyId" label="适用客户">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择客户"
                            loading={userOptions.loading.value}
                            options={[{ keyId: 0, showName: '默认路由' }, ...userOptions.dataSource.value]}
                            v-model:value={formState.value.userKeyId}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
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
                        col_countryKeyId: (data: Omix) => {
                            const country = data.countryKeyIdOptions
                            return (
                                <common-base-content
                                    value={country?.cnName ? `${country.code} ${country.cnName} - ${country.enName}` : data.countryKeyId}
                                ></common-base-content>
                            )
                        },
                        col_type: (data: Omix) => (
                            <common-base-chunk value={data.type} items={chunkOptions.value.typeOptions}></common-base-chunk>
                        ),
                        col_userKeyId: (data: Omix) =>
                            data.userKeyId > 0 ? (
                                <common-base-content
                                    value={
                                        [data.userKeyIdOptions?.alias, data.userKeyIdOptions?.name].filter(Boolean).join(' - ') ||
                                        data.userKeyId
                                    }
                                ></common-base-content>
                            ) : (
                                <n-text depth="3">默认路由</n-text>
                            ),
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_channelCount: (data: Omix) => (
                            <n-text type={data.activeChannelCount > 0 ? 'default' : 'warning'}>
                                {data.activeChannelCount} / {data.channelCount}
                            </n-text>
                        ),
                        col_createBy: (data: Omix) => <common-base-user element="text" data={data.createByOptions}></common-base-user>,
                        col_modifyBy: (data: Omix) => <common-base-user element="text" data={data.modifyByOptions}></common-base-user>,
                        col_command: (data: Omix) => (
                            <common-base-element abstract class="flex items-center gap-x-10 overflow-hidden">
                                <common-base-authorize key-name={state.actions[0].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'primary', title: '通道', content: '通道' }}
                                        onClick={() => fetchRouteChannel(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[1].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'info', title: '编辑', content: '编辑' }}
                                        onClick={() => fetchUpdateRoute(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[2].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'error', title: '删除', content: '删除' }}
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
