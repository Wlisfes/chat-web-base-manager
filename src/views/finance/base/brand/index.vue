<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceBaseBrand',
    setup(props, ctx) {
        /**品牌静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseFinanceBrandEnums(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseFinanceColumnBrand({ ...payload, page: base.page, size: base.size }),
            {
                keyName: 'chat:finance:base:brand',
                actions: [
                    { title: '编辑', key: 'chat:finance:base:brand:update' },
                    { title: '删除', key: 'chat:finance:base:brand:delete' }
                ],
                formState: {
                    /**品牌名称**/
                    name: undefined,
                    /**状态**/
                    status: undefined
                },
                columns: [
                    { title: '品牌名称', key: 'name', width: 160, disabled: true },
                    { title: '状态', key: 'status', width: 120 },
                    { title: '品牌描述', key: 'document', minWidth: 200 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        /**新增品牌**/
        async function fetchCreateFinanceBaseBrand() {
            return await feedback.fetchFinanceBaseBrand({
                title: '新增品牌',
                command: 'CREATE',
                onSubmit: () => fetchRefresh()
            })
        }

        /**编辑品牌**/
        async function fetchUpdateFinanceBaseBrand(node: Omix) {
            return await feedback.fetchFinanceBaseBrand({
                title: '编辑品牌',
                command: 'UPDATE',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**切换状态**/
        async function fetchBaseFinanceBrandStatusUpdate(node: Omix, nextStatus: string) {
            const nextLabel = nextStatus === 'enable' ? '启用' : '禁用'
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认将品牌【${node.name}】状态变更为【${nextLabel}】吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseFinanceUpdateBrandStatus({ keyId: node.keyId, status: nextStatus })
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

        /**删除品牌**/
        async function fetchDeleteBaseFinanceBrand(node: Omix) {
            return await fetchDialogService({
                title: '提示',
                type: 'error',
                content: `确认删除品牌【${node.name}】吗？删除后无法恢复！`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseFinanceDeleteBrand({ keyId: node.keyId })
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
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-authorize key-name="chat:finance:base:brand:create">
                            <common-base-button class="min-w-80" type="primary" onClick={fetchCreateFinanceBaseBrand}>
                                新增
                            </common-base-button>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="品牌名称">
                        <form-base-input
                            clearable
                            placeholder="请输入品牌名称"
                            v-model:value={formState.value.name}
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
                    v-model:customize={state.customize}
                    v-model:initialize={state.initialize}
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
                            <common-base-element class="flex items-center gap-x-10 overflow-hidden">
                                <common-base-authorize key-name={state.actions[0].key}>
                                    <common-base-button
                                        text
                                        title="编辑"
                                        type="info"
                                        onClick={(e: MouseEvent) => fetchUpdateFinanceBaseBrand(data)}
                                    >
                                        编辑
                                    </common-base-button>
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[0].key}>
                                    {['enable'].includes(data.status) ? (
                                        <common-base-button
                                            text
                                            title="禁用"
                                            type="warning"
                                            onClick={(e: MouseEvent) => fetchBaseFinanceBrandStatusUpdate(data, 'disable')}
                                        >
                                            禁用
                                        </common-base-button>
                                    ) : (
                                        <common-base-button
                                            text
                                            title="启用"
                                            type="success"
                                            onClick={(e: MouseEvent) => fetchBaseFinanceBrandStatusUpdate(data, 'enable')}
                                        >
                                            启用
                                        </common-base-button>
                                    )}
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[1].key}>
                                    <common-base-button
                                        text
                                        title="删除"
                                        type="error"
                                        onClick={(e: MouseEvent) => fetchDeleteBaseFinanceBrand(data)}
                                    >
                                        删除
                                    </common-base-button>
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
