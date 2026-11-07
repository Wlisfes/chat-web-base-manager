<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, useSelectService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { fetchNormalizeTreeChildren } from '@/utils'
import * as feedback from '@/components/srm/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceAccountSupplier',
    setup(props, ctx) {
        /**供应商静态枚举、供应商来源字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSrmUserEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_SRM_USER_SOURCE'],
            immediate: true
        })
        /**归属人下拉**/
        const ownerOptions = useSelectService(() => Service.httpBaseSkylineSelectUser(), {
            immediate: true
        })
        /**归属部门树**/
        const deptOptions = useSelectService(() => Service.httpBaseSkylineOrganizationTreeStructure(), {
            immediate: true,
            transform: fetchNormalizeTreeChildren
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnUser(payload),
            {
                keyName: 'chatbok:finance:account:supplier',
                formState: {
                    name: undefined,
                    alias: undefined,
                    email: undefined,
                    ownerUserUid: undefined,
                    ownerOrganizationKeyIds: [],
                    status: undefined,
                    payMode: undefined,
                    source: undefined
                },
                columns: [
                    { title: '供应商ID', key: 'keyId', width: 100, disabled: true },
                    { title: '供应商名称', key: 'name', minWidth: 160, disabled: true },
                    { title: '供应商别名', key: 'alias', minWidth: 130, check: true },
                    { title: '邮箱', key: 'email', minWidth: 180, check: true },
                    { title: '电话号码', key: 'phone', width: 140, check: true },
                    { title: '归属人', key: 'ownerUserUid', width: 120, check: true },
                    { title: '归属部门', key: 'ownerOrganizations', minWidth: 140, check: true },
                    { title: '等级', key: 'level', width: 100, check: true },
                    { title: '阶段', key: 'stage', width: 100, check: true },
                    { title: '币种', key: 'currency', width: 100, check: true },
                    { title: '供应商来源', key: 'source', width: 140, check: true },
                    { title: '状态', key: 'status', width: 100, check: true },
                    { title: '付款模式', key: 'payMode', width: 100, check: true },
                    { title: '余额', key: 'balance', width: 120, check: true },
                    { title: '信用额度', key: 'credit', width: 120, check: true },
                    { title: '创建时间', key: 'createTime', width: 160, check: true },
                    { title: '更新时间', key: 'modifyTime', width: 160, check: true }
                ]
            }
        )

        /**校验只选中一个供应商**/
        async function fetchSingleSelect() {
            if (state.select.length !== 1) {
                await fetchNotifyService({ type: 'warning', title: '请选择一个供应商' })
                return undefined
            }
            return state.select[0]
        }

        /**新增供应商**/
        async function fetchCreateFinanceAccountSupplier() {
            return await feedback.fetchSrmSupplier({
                title: '新增供应商',
                command: 'CREATE',
                onSubmit: () => fetchRefresh()
            })
        }

        /**编辑供应商**/
        async function fetchUpdateFinanceAccountSupplier() {
            const node = await fetchSingleSelect()
            if (!node) return
            return await feedback.fetchSrmSupplier({
                title: '编辑供应商',
                command: 'UPDATE',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**切换状态**/
        async function fetchUpdateFinanceAccountSupplierStatus() {
            const node = await fetchSingleSelect()
            if (!node) return
            const nextStatus = node.status === 'enable' ? 'disable' : 'enable'
            const nextLabel = nextStatus === 'enable' ? '启用' : '禁用'
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认将供应商【${node.name}】状态变更为【${nextLabel}】吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmUserStatusUpdate({ keyId: node.keyId, status: nextStatus })
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
                        <common-base-button type="primary" onClick={fetchCreateFinanceAccountSupplier}>
                            新增
                        </common-base-button>
                        <common-base-button dashed type="primary" onClick={fetchUpdateFinanceAccountSupplier}>
                            编辑
                        </common-base-button>
                        <common-base-button dashed type="warning" onClick={fetchUpdateFinanceAccountSupplierStatus}>
                            切换状态
                        </common-base-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="供应商名称">
                        <form-base-input
                            clearable
                            placeholder="请输入供应商名称"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="alias" label="供应商别名">
                        <form-base-input
                            clearable
                            placeholder="请输入供应商别名"
                            v-model:value={formState.value.alias}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="email" label="邮箱">
                        <form-base-input
                            clearable
                            placeholder="请输入邮箱"
                            v-model:value={formState.value.email}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="ownerUserUid" label="归属人">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            value-field="uid"
                            placeholder="请选择归属人"
                            loading={ownerOptions.loading.value}
                            options={ownerOptions.dataSource.value}
                            v-model:value={formState.value.ownerUserUid}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="ownerOrganizationKeyIds" label="归属部门">
                        <form-base-tree-select
                            multiple
                            checkable
                            clearable
                            cascade={false}
                            label-field="name"
                            label-value="keyId"
                            children-field="children"
                            placeholder="请选择归属部门"
                            loading={deptOptions.loading.value}
                            options={deptOptions.dataSource.value}
                            v-model:value={formState.value.ownerOrganizationKeyIds}
                        ></form-base-tree-select>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="状态">
                        <form-base-select
                            clearable
                            placeholder="请选择状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="payMode" label="付款模式">
                        <form-base-select
                            clearable
                            placeholder="请选择付款模式"
                            loading={chunkState.loading}
                            options={chunkOptions.value.payModeOptions}
                            v-model:value={formState.value.payMode}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="source" label="供应商来源">
                        <form-base-select
                            clearable
                            label-field="label"
                            value-field="keyId"
                            placeholder="请选择供应商来源"
                            loading={chunkState.loading}
                            options={chunkState.CHUNK_SRM_USER_SOURCE.options}
                            v-model:value={formState.value.source}
                        ></form-base-select>
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
                        col_ownerUserUid: (data: Omix) => {
                            return <common-base-user element="text" data={data.ownerUserUidOptions}></common-base-user>
                        },
                        col_ownerOrganizations: (data: Omix) => {
                            return <common-base-content value={data.ownerUserUidOptions?.organizations}></common-base-content>
                        },
                        col_stage: (data: Omix) => (
                            <common-base-chunk value={data.stage} items={chunkOptions.value.stageOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_payMode: (data: Omix) => (
                            <common-base-chunk value={data.payMode} items={chunkOptions.value.payModeOptions}></common-base-chunk>
                        ),
                        col_source: (data: Omix) => (
                            <common-base-chunk
                                mode="text"
                                value={data.source}
                                items={chunkState.CHUNK_SRM_USER_SOURCE.options}
                            ></common-base-chunk>
                        ),
                        col_balance: (data: Omix) => {
                            return <common-base-number shrink value={data.balance}></common-base-number>
                        },
                        col_credit: (data: Omix) => {
                            return <common-base-number shrink value={data.credit}></common-base-number>
                        }
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
