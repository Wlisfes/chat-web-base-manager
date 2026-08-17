<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemPosition',
    setup(props, ctx) {
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, setForm, fetchRequest, fetchRestore, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSystemColumnPosition(payload),
            keyName: 'chatbok:deploy:system:position',
            formState: {
                name: undefined //职位名称
            },
            columns: [
                { title: '职位名称', key: 'name', minWidth: 200, disabled: true },
                { title: '排序号', key: 'sort', width: 100, check: true },
                { title: '关联账号', key: 'accountCount', align: 'center', width: 100, check: true },
                { title: '创建人', key: 'createBy', width: 120, check: true },
                { title: '创建时间', key: 'createTime', width: 160, check: true },
                { title: '更新人', key: 'modifyBy', width: 120, check: true },
                { title: '更新时间', key: 'modifyTime', width: 160, check: true }
            ]
        })

        /**新增职位**/
        async function fetchDeployPositionCreate() {
            return await feedback.fetchDeploySystemPosition({
                title: '新增职位',
                command: 'CREATE',
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**编辑职位**/
        async function fetchDeployPositionUpdate() {
            return await feedback.fetchDeploySystemPosition({
                title: '编辑职位',
                command: 'UPDATE',
                node: state.select[0],
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**删除职位**/
        async function fetchDeployPositionDelete() {
            const node = state.select[0]
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认删除职位【${node.name}】吗？删除后无法恢复！`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSystemDeletePosition({ keyId: node.keyId })
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
                    on-restore={fetchRestore}
                    on-submit={fetchRequest}
                >
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-element-button type="primary" onClick={fetchDeployPositionCreate}>
                            新增
                        </common-element-button>
                        <common-element-button
                            dashed
                            type="primary"
                            disabled={instState.value.isUpdate}
                            onClick={fetchDeployPositionUpdate}
                        >
                            编辑
                        </common-element-button>
                        <common-element-button dashed type="error" disabled={instState.value.isDelete} onClick={fetchDeployPositionDelete}>
                            删除
                        </common-element-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="职位名称">
                        <form-common-column-input
                            clearable
                            placeholder="请输入职位名称"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
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
