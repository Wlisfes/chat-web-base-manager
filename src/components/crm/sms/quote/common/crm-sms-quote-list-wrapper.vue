<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useSelectService, pick, stop } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteListWrapper',
    props: {
        /**报价状态**/
        status: { type: String, required: true }
    },
    setup(props, ctx) {
        /**国家/地区下拉数据**/
        const countryOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            transform: s => s.map(e => ({ ...e, value: e.keyId, label: e.showName })),
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, router, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseCrmColumnSmsQuote({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                formState: {
                    statuses: [props.status],
                    /**客户ID**/
                    userKeyId: undefined,
                    /**客户别名**/
                    userAlias: undefined,
                    /**应用ID**/
                    appId: undefined,
                    /**应用别名**/
                    appAlias: undefined,
                    /**国家/地区主键列表**/
                    countryKeyIds: [],
                    /**移动国家代码**/
                    mcc: undefined
                },
                columns: [
                    { title: '客户ID', key: 'userKeyId', width: 100, disabled: true },
                    { title: '客户名称', key: 'userName', minWidth: 200, disabled: true, ellipsis: false },
                    { title: '客户别名', key: 'userAlias', width: 130 },
                    { title: '应用ID', key: 'appId', width: 180 },
                    { title: '应用别名', key: 'appAlias', width: 160 },
                    { title: 'MCC', key: 'mcc', width: 80 },
                    { title: 'Code', key: 'code', width: 80 },
                    { title: '国家/地区', key: 'countryKeyId', width: 180 },
                    { title: '汇率', key: 'exchangeRate', width: 100 },
                    { title: '报价币种', key: 'currency', width: 100 },
                    { title: '上行本币价格', key: 'upLocal', width: 140 },
                    { title: '下行本币价格', key: 'downLocal', width: 140 },
                    { title: '上行价格(USD)', key: 'upUsd', width: 140 },
                    { title: '下行价格(USD)', key: 'downUsd', width: 140 },
                    { title: '汇率日期', key: 'exchangeDate', width: 120 },
                    { title: '生效时间', key: 'effectiveTime', width: 170 },
                    { title: '失效时间', key: 'expiryTime', width: 170 },
                    { title: '创建时间', key: 'createTime', width: 170 }
                ]
            }
        )

        /**跳转客户详情**/
        async function fetchJumpContextConsumer(event: MouseEvent, data: Omix) {
            return await stop(event, async () => {
                return await router.push({
                    path: `/crm/consumer/context/${data.keyId}`,
                    state: { tabTitle: data.name }
                })
            })
        }

        return () => (
            <n-element class="h-full flex flex-col gap-14 overflow-hidden">
                <common-database-search
                    class="p-0!"
                    border-less={['top']}
                    square={['l-t', 'r-t']}
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy', 'abstract']}
                    ref={formRef}
                    label-width={90}
                    limit={state.limit}
                    v-model:when={state.when}
                    v-model:loading={state.loading}
                    v-model:initialize={state.initialize}
                    v-model:database={state.database}
                    v-model:formState={formState.value}
                    on-restore={instOptions.fetchRestore}
                    on-submit={instOptions.fetchRequest}
                >
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-authorize key-name="dssds">
                            <router-link to="/crm/sms/quote/wrapper">
                                <common-base-button class="min-w-80" type="primary">
                                    新增报价
                                </common-base-button>
                            </router-link>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column prop="userKeyId" label="客户ID">
                        <form-base-input
                            clearable
                            placeholder="请输入客户ID"
                            v-model:value={formState.value.userKeyId}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="userAlias" label="客户别名">
                        <form-base-input
                            clearable
                            placeholder="请输入客户别名"
                            v-model:value={formState.value.userAlias}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="appId" label="应用ID">
                        <form-base-input
                            clearable
                            placeholder="请输入应用ID"
                            v-model:value={formState.value.appId}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="appAlias" label="应用别名">
                        <form-base-input
                            clearable
                            placeholder="请输入应用别名"
                            v-model:value={formState.value.appAlias}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="countryKeyIds" label="国家/地区">
                        <form-base-select
                            clearable
                            filterable
                            multiple
                            placeholder="请选择国家/地区"
                            value-field="keyId"
                            label-field="showName"
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyIds}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="mcc" label="MCC">
                        <form-base-input
                            clearable
                            placeholder="请输入MCC"
                            v-model:value={formState.value.mcc}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    class="p-0! overflow-hidden"
                    show-settings
                    limit={state.limit}
                    total={state.total}
                    columns={state.columns}
                    v-model:page={state.page}
                    v-model:size={state.size}
                    v-model:data={state.dataSource}
                    v-model:loading={state.loading}
                    v-model:initialize={state.initialize}
                    v-model:customize={state.customize}
                    on-update:customize={instOptions.fetchUpdateCustomize}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                >
                    {{
                        col_userName: (data: Omix) => (
                            <common-base-content ellipsis value={data.userOptions?.name}>
                                <n-text
                                    class="cursor-pointer"
                                    type="info"
                                    onClick={(e: MouseEvent) => fetchJumpContextConsumer(e, data.userOptions)}
                                >
                                    {data.userOptions?.name ?? '-'}
                                </n-text>
                            </common-base-content>
                        ),
                        col_countryKeyId: (data: Omix) => (
                            <common-base-chunk
                                mode="text"
                                ellipsis
                                value={data.countryKeyId}
                                items={countryOptions.dataSource.value}
                            ></common-base-chunk>
                        ),
                        col_upUsd: (data: Omix) => {
                            return <common-base-number shrink value={data.upUsd}></common-base-number>
                        },
                        col_downUsd: (data: Omix) => {
                            return <common-base-number shrink value={data.downUsd}></common-base-number>
                        },
                        col_upLocal: (data: Omix) => {
                            return <common-base-number shrink value={data.upLocal}></common-base-number>
                        },
                        col_downLocal: (data: Omix) => {
                            return <common-base-number shrink value={data.downLocal}></common-base-number>
                        },
                        col_expiryTime: (data: Omix) => {
                            return <common-base-content value={data.expiryTime ?? '永久有效'}></common-base-content>
                        }
                    }}
                </common-database-table>
            </n-element>
        )
    }
})
</script>
