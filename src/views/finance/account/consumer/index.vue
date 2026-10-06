<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useSelectService, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceAccountConsumer',
    setup(props, ctx) {
        const brandOptions = useSelectService(e => Service.httpBaseFinanceSelectBrand(), { immediate: true })
        /**客户静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseCrmUserEnums(), {
            immediate: true
        })
        /**注册来源选项：Skyline 枚举 CHUNK_CRM_CRM_USER_SOURCE，value 即枚举项主键**/
        const sourceOptions = useSelectService(
            async () => {
                const response = await Service.httpBaseSkylineChunkOptionColumn({ module: 'CHUNK_CRM', types: ['CHUNK_CRM_CRM_USER_SOURCE'] })
                return { ...response, data: response.data.CHUNK_CRM_CRM_USER_SOURCE?.options ?? [] }
            },
            {
                immediate: true,
                transform: options => options.map(item => ({ value: Number(item.value), label: item.label }))
            }
        )
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseCrmColumnUser(payload),
            {
                keyName: 'chatbok:finance:account:consumer',
                formState: {
                    name: undefined,
                    status: undefined,
                    payMode: undefined,
                    authStatus: undefined,
                    source: undefined
                },
                columns: [
                    { title: '客户ID', key: 'keyId', width: 90, disabled: true },
                    { title: '客户名称', key: 'name', minWidth: 160, disabled: true },
                    { title: '客户别名', key: 'alias', minWidth: 120, check: true },
                    { title: '邮箱', key: 'email', minWidth: 180, ellipsis: { tooltip: true }, check: true },
                    { title: '电话号码', key: 'phone', width: 140, check: true },
                    { title: '归属人', key: 'accountOptions', width: 120, check: true },
                    { title: '归属部门', key: 'deptOptions', width: 120, check: true },
                    { title: '品牌', key: 'brandOptions', width: 100, check: true },
                    { title: '客户类型', key: 'classType', width: 100, check: true },
                    { title: '等级', key: 'level', width: 100, check: true },
                    { title: '阶段', key: 'stage', width: 100, check: true },
                    { title: '币种', key: 'currency', width: 100, check: true },
                    { title: '认证状态', key: 'authStatus', align: 'center', width: 100, check: true },
                    { title: '注册来源', key: 'source', align: 'center', width: 100, check: true },
                    { title: '状态', key: 'status', align: 'center', width: 100, check: true },
                    { title: '付款模式', key: 'payMode', align: 'center', width: 100, check: true },
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
                    brandId: 1007,
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
                            loading={sourceOptions.loading.value}
                            options={sourceOptions.dataSource.value}
                            v-model:value={formState.value.source}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-select
                    show-settings
                    virtual-scroll
                    virtual-scroll-x
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
                        col_accountOptions: (data: Omix) => (
                            <common-database-table-user element="text" data={data.accountOptions}></common-database-table-user>
                        ),
                        col_deptOptions: (data: Omix) => (
                            <common-database-table-content
                                value={(data.deptOptions ?? []).map((item: Omix) => item.deptName)}
                            ></common-database-table-content>
                        ),
                        col_brandOptions: (data: Omix) => {
                            const brand = brandOptions.dataSource.value.find((item: Omix) => item.keyId === data.brandId)
                            return <common-database-table-content value={brand?.name ?? '-'}></common-database-table-content>
                        },
                        col_classType: (data: Omix) => (
                            <common-database-table-chunk
                                value={data.classType}
                                options={chunkOptions.value.classTypeOptions}
                            ></common-database-table-chunk>
                        ),
                        col_stage: (data: Omix) => (
                            <common-database-table-chunk
                                value={data.stage}
                                options={chunkOptions.value.stageOptions}
                            ></common-database-table-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.status}
                                options={chunkOptions.value.statusOptions}
                            ></common-database-table-chunk>
                        ),
                        col_payMode: (data: Omix) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.payMode}
                                options={chunkOptions.value.payModeOptions}
                            ></common-database-table-chunk>
                        ),
                        col_authStatus: (data: Omix) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.authStatus}
                                options={chunkOptions.value.authStatusOptions}
                            ></common-database-table-chunk>
                        ),
                        col_source: (data: Omix) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.source}
                                options={sourceOptions.dataSource.value}
                            ></common-database-table-chunk>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
