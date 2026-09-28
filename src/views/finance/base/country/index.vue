<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceBaseCountry',
    setup(props, ctx) {
        /**国家/地区静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseFinanceCountryEnums(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseFinanceColumnCountry({ ...payload, page: base.page, size: base.size }),
            {
                keyName: 'chat:finance:base:country',
                actions: [{ title: '编辑', key: 'chat:finance:base:country:update' }],
                formState: {
                    /**国家/地区名称、编码**/
                    cnName: undefined,
                    /**状态**/
                    status: undefined
                },
                columns: [
                    { title: '国家/地区编码', key: 'code', minWidth: 120, disabled: true },
                    { title: '中文名称', key: 'cnName', minWidth: 140, disabled: true },
                    { title: '英文名称', key: 'enName', minWidth: 140 },
                    { title: 'MCC', key: 'mcc', width: 120 },
                    { title: '状态', key: 'status', width: 120 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        /**切换状态**/
        async function fetchBaseFinanceUpdateCountryStatus(node: Omix, status: string) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认${['enable'].includes(status) ? '启用' : '禁用'}国家/地区【${node.cnName}】吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseFinanceUpdateCountryStatus({ keyId: node.keyId, status })
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
                    <common-database-search-column disabled prop="cnName" label="名称">
                        <form-base-input
                            clearable
                            placeholder="请输入国家/地区名称、编码"
                            v-model:value={formState.value.cnName}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="状态">
                        <form-base-select
                            clearable
                            placeholder="请选择状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
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
                    show-command={instState.value.showCommand}
                    on-update:customize={instOptions.fetchUpdateCustomize}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                >
                    {{
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
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
                                    {['enable'].includes(data.status) ? (
                                        <common-base-button
                                            text
                                            title="禁用"
                                            type="warning"
                                            onClick={(e: MouseEvent) => fetchBaseFinanceUpdateCountryStatus(data, 'disable')}
                                        >
                                            禁用
                                        </common-base-button>
                                    ) : (
                                        <common-base-button
                                            text
                                            title="启用"
                                            type="success"
                                            onClick={(e: MouseEvent) => fetchBaseFinanceUpdateCountryStatus(data, 'enable')}
                                        >
                                            启用
                                        </common-base-button>
                                    )}
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
