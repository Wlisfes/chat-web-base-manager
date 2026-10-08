<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useSelectService, useChunkService } from '@/hooks'
import { EventType } from '@/utils'
import * as feedback from '@/components/crm/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmCommonListConsumer',
    props: {
        /**通讯实例**/
        observer: { type: Object as PropType<EventType>, required: true }
    },
    setup(props, ctx) {
        /**品牌下拉列表**/
        const brandOptions = useSelectService(e => Service.httpBaseFinanceSelectBrand(), {
            immediate: true
        })
        /**币种下拉列表**/
        const currencyOptions = useSelectService(e => Service.httpBaseFinanceSelectCurrency(), {
            immediate: true
        })
        /**客户静态枚举**/
        const { chunkOptions, chunkState: crmChunkState } = useChunkService(e => Service.httpBaseCrmUserEnums(), {
            immediate: true
        })
        /**注册来源字典枚举**/
        const { chunkState: sourceChunkState } = useChunkService(e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }), {
            immediate: true,
            types: ['CHUNK_CRM_CRM_USER_SOURCE']
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseCrmColumnUser({ ...payload, page: base.page, size: base.size }),
            {
                keyName: 'chat:crm:common:consumer',
                formState: {
                    /**客户名称**/
                    name: undefined,
                    /**状态**/
                    status: undefined,
                    /**品牌**/
                    brandKeyId: undefined,
                    /**币种**/
                    currency: undefined,
                    /**付款模式**/
                    payMode: undefined,
                    /**认证状态**/
                    authStatus: undefined,
                    /**注册来源**/
                    source: undefined
                },
                columns: [
                    { title: '客户名称', key: 'name', minWidth: 200, disabled: true, ellipsis: false },
                    { title: '客户ID', key: 'keyId', width: 100, disabled: true },
                    { title: '客户别名', key: 'alias', width: 150 },
                    { title: '品牌', key: 'brandKeyId', width: 120 },
                    { title: '阶段', key: 'stage', width: 100 },
                    { title: '状态', key: 'status', width: 100 },
                    { title: '认证状态', key: 'authStatus', width: 100 },
                    { title: '客户类型', key: 'classType', width: 100 },
                    { title: '付款模式', key: 'payMode', width: 100 },
                    { title: '注册来源', key: 'source', width: 120 },
                    { title: '归属人', key: 'ownerUserUid', width: 120 },
                    { title: '归属部门', key: 'ownerOrganizations', minWidth: 140 },
                    { title: '邮箱', key: 'email', width: 200 },
                    { title: '电话号码', key: 'phone', width: 140 },
                    { title: '等级', key: 'level', width: 100 },
                    { title: '币种', key: 'currency', width: 100 },
                    { title: '余额', key: 'balance', width: 120 },
                    { title: '信用额度', key: 'credit', width: 120 },
                    { title: '备注', key: 'remark', minWidth: 200 },
                    { title: '创建时间', key: 'createTime', width: 160 }
                ]
            }
        )

        /**金额字段放大百万倍存储，列表按 6 位小数显示**/
        function fetchAmountContent(value: number | string) {
            if (value === undefined || value === null || value === '') {
                return '-'
            }
            return (Number(value) / 1_000_000).toFixed(6)
        }

        /**新增客户**/
        async function openConsumerCreate() {
            return await feedback.openCrmConsumerCreate({
                title: '新增客户',
                command: 'CREATE',
                onSubmit: fetchRefresh
            })
        }

        return () => (
            <n-element class="crm-consumer-common-list h-full flex flex-col gap-14 overflow-hidden">
                <common-database-search
                    class="p-0!"
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy', 'abstract']}
                    square={['l-t', 'r-t']}
                    ref={formRef}
                    label-width={90}
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
                        <common-base-button class="min-w-80" type="primary" onClick={openConsumerCreate}>
                            新增
                        </common-base-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="客户名称">
                        <form-base-input
                            clearable
                            placeholder="请输入客户名称/ID"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="状态">
                        <form-base-select
                            clearable
                            placeholder="请选择状态"
                            loading={crmChunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="brandKeyId" label="品牌">
                        <form-base-select
                            clearable
                            filterable
                            placeholder="请选择品牌"
                            label-field="name"
                            label-value="keyId"
                            options={brandOptions.dataSource.value}
                            v-model:value={formState.value.brandKeyId}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="currency" label="币种">
                        <form-base-select
                            clearable
                            filterable
                            placeholder="请选择币种"
                            label-value="currency"
                            label-field="currency"
                            options={currencyOptions.dataSource.value}
                            v-model:value={formState.value.currency}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="payMode" label="付款模式">
                        <form-base-select
                            clearable
                            placeholder="请选择付款模式"
                            loading={crmChunkState.loading}
                            options={chunkOptions.value.payModeOptions}
                            v-model:value={formState.value.payMode}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="authStatus" label="认证状态">
                        <form-base-select
                            clearable
                            placeholder="请选择认证状态"
                            loading={crmChunkState.loading}
                            options={chunkOptions.value.authStatusOptions}
                            v-model:value={formState.value.authStatus}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="source" label="注册来源">
                        <form-base-select
                            clearable
                            placeholder="请选择注册来源"
                            loading={sourceChunkState.loading}
                            options={sourceChunkState.CHUNK_CRM_CRM_USER_SOURCE.options}
                            v-model:value={formState.value.source}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    class="p-0! overflow-hidden"
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
                        col_name: (data: Omix) => (
                            <common-base-content ellipsis value={data.name}>
                                <router-link
                                    to={{ path: `/crm/consumer/context/${data.keyId}`, state: { tabTitle: data.name } }}
                                    class="decoration-none"
                                >
                                    <n-text type="info">{data.name}</n-text>
                                </router-link>
                            </common-base-content>
                        ),
                        col_ownerUserUid: (data: Omix) => {
                            return <common-base-user element="text" data={data.ownerUserUidOptions}></common-base-user>
                        },
                        col_ownerOrganizations: (data: Omix) => {
                            return <common-base-content value={data.ownerUserUidOptions?.organizations}></common-base-content>
                        },
                        col_brandKeyId: (data: Omix) => {
                            return <common-base-content value={data.brandKeyIdOptions?.name}></common-base-content>
                        },
                        col_stage: (data: Omix) => (
                            <common-base-chunk bordered value={data.stage} items={chunkOptions.value.stageOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_authStatus: (data: Omix) => (
                            <common-base-chunk
                                bordered
                                value={data.authStatus}
                                items={chunkOptions.value.authStatusOptions}
                            ></common-base-chunk>
                        ),
                        col_classType: (data: Omix) => (
                            <common-base-chunk
                                bordered
                                value={data.classType}
                                items={chunkOptions.value.classTypeOptions}
                            ></common-base-chunk>
                        ),
                        col_payMode: (data: Omix) => (
                            <common-base-chunk bordered value={data.payMode} items={chunkOptions.value.payModeOptions}></common-base-chunk>
                        ),
                        col_balance: (data: Omix) => {
                            return <common-base-content value={fetchAmountContent(data.balance)}></common-base-content>
                        },
                        col_credit: (data: Omix) => {
                            return <common-base-content value={fetchAmountContent(data.credit)}></common-base-content>
                        }
                    }}
                </common-database-table>
            </n-element>
        )
    }
})
</script>
