<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, useSelectService } from '@/hooks'
import { fetchNormalizeTreeChildren } from '@/utils'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceAccountConsumer',
    setup(props, ctx) {
        /**客户静态枚举、注册来源字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseCrmUserEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_CRM_USER_SOURCE'],
            immediate: true
        })
        /**品牌下拉**/
        const brandOptions = useSelectService(() => Service.httpBaseFinanceSelectBrand(), {
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
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseCrmColumnUser(payload),
            {
                keyName: 'chatbok:finance:account:consumer',
                formState: {
                    name: undefined,
                    alias: undefined,
                    email: undefined,
                    brandKeyId: undefined,
                    ownerUserUid: undefined,
                    ownerOrganizationKeyIds: [],
                    status: undefined,
                    payMode: undefined,
                    authStatus: undefined,
                    source: undefined
                },
                columns: [
                    { title: '客户ID', key: 'keyId', width: 90, disabled: true },
                    { title: '客户名称', key: 'name', minWidth: 160, disabled: true },
                    { title: '客户别名', key: 'alias', minWidth: 120, check: true },
                    { title: '邮箱', key: 'email', minWidth: 180, check: true },
                    { title: '电话号码', key: 'phone', width: 140, check: true },
                    { title: '归属人', key: 'ownerUserUid', width: 120, check: true },
                    { title: '归属部门', key: 'ownerOrganizations', minWidth: 140, check: true },
                    { title: '品牌', key: 'brandKeyId', width: 100, check: true },
                    { title: '客户类型', key: 'classType', width: 100, check: true },
                    { title: '等级', key: 'level', width: 100, check: true },
                    { title: '阶段', key: 'stage', width: 100, check: true },
                    { title: '币种', key: 'currency', width: 100, check: true },
                    { title: '认证状态', key: 'authStatus', width: 100, check: true },
                    { title: '注册来源', key: 'source', width: 140, check: true },
                    { title: '状态', key: 'status', width: 100, check: true },
                    { title: '付款模式', key: 'payMode', width: 100, check: true },
                    { title: '余额', key: 'balance', width: 100, check: true },
                    { title: '信用额度', key: 'credit', width: 100, check: true },
                    { title: '创建时间', key: 'createTime', width: 160, check: true },
                    { title: '更新时间', key: 'modifyTime', width: 160, check: true }
                ]
            }
        )

        /**新增客户**/
        async function fetchCreateFinanceAccountConsumer() {
            return await feedback.fetchFinanceAccountConsumer({
                title: '新增客户',
                command: 'CREATE',
                node: {
                    name: '青萍科技股份有限公司',
                    brandKeyId: 1007,
                    currency: 'USD',
                    email: 'limvcfast@gmail.com',
                    phone: '18676361342',
                    status: 'enable',
                    payMode: 'prepaid',
                    authStatus: 'unverified',
                    source: 'manual'
                },
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**编辑客户**/
        async function fetchUpdateFinanceAccountConsumer() {
            return await feedback.fetchFinanceAccountConsumer({
                title: '编辑客户',
                command: 'UPDATE',
                node: state.select[0],
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**切换状态**/
        async function fetchBaseAccountUpdateConsumerStatus() {
            const node = state.select[0]
            const nextStatus = node.status === 'enable' ? 'disable' : 'enable'
            const nextLabel = nextStatus === 'enable' ? '启用' : '禁用'
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认将客户【${node.name}】状态变更为【${nextLabel}】吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseCrmUserStatusUpdate({ keyId: node.keyId, status: nextStatus })
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
                        <common-base-button type="primary" onClick={fetchCreateFinanceAccountConsumer}>
                            新增
                        </common-base-button>
                        <common-base-button dashed type="primary" onClick={fetchUpdateFinanceAccountConsumer}>
                            编辑
                        </common-base-button>
                        <common-base-button dashed type="warning" onClick={fetchBaseAccountUpdateConsumerStatus}>
                            切换状态
                        </common-base-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="客户名称">
                        <form-base-input
                            clearable
                            placeholder="请输入客户名称"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="alias" label="客户别名">
                        <form-base-input
                            clearable
                            placeholder="请输入客户别名"
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
                    <common-database-search-column prop="brandKeyId" label="品牌">
                        <form-base-select
                            clearable
                            filterable
                            label-field="name"
                            label-value="keyId"
                            placeholder="请选择品牌"
                            loading={brandOptions.loading.value}
                            options={brandOptions.dataSource.value}
                            v-model:value={formState.value.brandKeyId}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="ownerUserUid" label="归属人">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            label-value="uid"
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
                    <common-database-search-column prop="authStatus" label="认证状态">
                        <form-base-select
                            clearable
                            placeholder="请选择认证状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.authStatusOptions}
                            v-model:value={formState.value.authStatus}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="source" label="注册来源">
                        <form-base-select
                            clearable
                            placeholder="请选择注册来源"
                            loading={chunkState.loading}
                            options={chunkState.CHUNK_CRM_USER_SOURCE.options}
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
                        col_brandKeyId: (data: Omix) => {
                            return <common-base-content value={data.brandKeyIdOptions?.name}></common-base-content>
                        },
                        col_classType: (data: Omix) => (
                            <common-base-chunk value={data.classType} items={chunkOptions.value.classTypeOptions}></common-base-chunk>
                        ),
                        col_stage: (data: Omix) => (
                            <common-base-chunk value={data.stage} items={chunkOptions.value.stageOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_payMode: (data: Omix) => (
                            <common-base-chunk value={data.payMode} items={chunkOptions.value.payModeOptions}></common-base-chunk>
                        ),
                        col_authStatus: (data: Omix) => (
                            <common-base-chunk value={data.authStatus} items={chunkOptions.value.authStatusOptions}></common-base-chunk>
                        ),
                        col_source: (data: Omix) => (
                            <common-base-chunk
                                mode="text"
                                value={data.source}
                                items={chunkState.CHUNK_CRM_USER_SOURCE.options}
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
