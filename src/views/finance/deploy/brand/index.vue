<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceDeployBrand',
    setup(props, ctx) {
        /**表格实例**/
        const { formRef, formState, state, chunkState, instState, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseFinanceColumnBrand(payload),
            keyName: 'chatbok:finance:deploy:brand',
            chunkNames: { CHUNK_BRAND_STATUS: true },
            formState: {
                name: undefined, //品牌名称
                status: undefined //状态
            },
            columns: [
                { title: '品牌名称', key: 'name', minWidth: 200, disabled: true },
                { title: '品牌描述', key: 'document', minWidth: 200, ellipsis: { tooltip: true }, check: true },
                { title: '状态', key: 'status', minWidth: 120, check: true },
                { title: '创建人', key: 'createBy', minWidth: 120, check: true },
                { title: '更新人', key: 'modifyBy', minWidth: 120, check: true },
                { title: '创建时间', key: 'createTime', width: 160, check: true },
                { title: '更新时间', key: 'modifyTime', width: 160, check: true }
            ]
        })

        /**新增品牌**/
        async function fetchDeployBrandCreate() {
            return await feedback.fetchFinanceDeployBrand({
                title: '新增品牌',
                command: 'CREATE',
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**编辑品牌**/
        async function fetchDeployBrandUpdate() {
            return await feedback.fetchFinanceDeployBrand({
                title: '编辑品牌',
                command: 'UPDATE',
                node: state.select[0],
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**切换状态**/
        async function fetchDeployBrandStatus() {
            const node = state.select[0]
            const nextStatus = node.status === 'enable' ? 'disable' : 'enable'
            const nextLabel = nextStatus === 'enable' ? '启用' : '禁用'
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认将品牌【${node.name}】状态变更为【${nextLabel}】吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseFinanceUpdateBrandStatus({ keyId: node.keyId, status: nextStatus })
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
                        <common-element-button type="primary" onClick={fetchDeployBrandCreate}>
                            新增
                        </common-element-button>
                        <common-element-button dashed type="primary" disabled={instState.value.isUpdate} onClick={fetchDeployBrandUpdate}>
                            编辑
                        </common-element-button>
                        <common-element-button dashed type="warning" disabled={instState.value.isUpdate} onClick={fetchDeployBrandStatus}>
                            切换状态
                        </common-element-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="品牌名称">
                        <form-common-column-input
                            clearable
                            placeholder="请输入品牌名称"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="状态">
                        <form-common-column-select
                            placeholder="请选择付款模式"
                            options={chunkState.CHUNK_BRAND_STATUS}
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
                        col_status: (data: Omix) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.status}
                                options={chunkState.CHUNK_BRAND_STATUS}
                            ></common-database-table-chunk>
                        ),
                        col_createBy: (data: Omix) => (
                            <common-database-table-user element="text" data={data.createByOptions}></common-database-table-user>
                        ),
                        col_modifyBy: (data: Omix) => (
                            <common-database-table-user element="text" data={data.modifyByOptions}></common-database-table-user>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
