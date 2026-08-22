<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useSelectService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteList',
    props: {
        /**报价状态**/
        status: { type: String, required: true }
    },
    setup(props, ctx) {
        /**国家/地区下拉数据**/
        const countryOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseCrmColumnSmsQuote({ ...payload, statuses: [props.status] }),
            formState: {
                consumerKeyId: undefined,
                consumerAlias: undefined,
                appId: undefined,
                appAlias: undefined,
                countryKeyIds: [] as number[],
                mcc: undefined
            },
            columns: [
                { title: '客户ID', key: 'consumerKeyId', width: 100, disabled: true },
                { title: '客户名称', key: 'consumerName', minWidth: 160, check: true },
                { title: '客户别名', key: 'consumerAlias', width: 140, check: true },
                { title: '应用ID', key: 'appId', width: 120, check: true },
                { title: '应用别名', key: 'appAlias', minWidth: 160, check: true },
                { title: 'MCC', key: 'mcc', width: 80, check: true },
                { title: 'Code', key: 'code', width: 80, check: true },
                { title: '国家/地区', key: 'countryName', minWidth: 180, check: true },
                { title: '上行价格(USD)', key: 'upUsd', width: 140, check: true },
                { title: '下行价格(USD)', key: 'downUsd', width: 140, check: true },
                { title: '报价币种', key: 'currency', width: 100, check: true },
                { title: '上行本币价格', key: 'upLocal', width: 140, check: true },
                { title: '下行本币价格', key: 'downLocal', width: 140, check: true },
                { title: '汇率', key: 'exchangeRate', width: 120, check: true },
                { title: '汇率日期', key: 'exchangeDate', width: 120, check: true },
                { title: '生效时间', key: 'effectiveTime', width: 170, check: true },
                { title: '失效时间', key: 'expiryTime', width: 170, check: true },
                { title: '创建时间', key: 'createTime', width: 170, check: true }
            ]
        })

        /**价格格式化**/
        function formatPrice(value: number) {
            if (value === undefined || value === null) return '-'
            return (Number(value) / 1_000_000).toFixed(6)
        }

        return () => (
            <n-element class="h-full flex flex-col gap-14 overflow-hidden">
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
                    on-restore={instOptions.fetchRestore}
                    on-submit={instOptions.fetchRequest}
                >
                    <common-database-search-column prop="consumerKeyId" label="客户ID">
                        <form-common-column-input
                            clearable
                            placeholder="请输入客户ID"
                            v-model:value={formState.value.consumerKeyId}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                    <common-database-search-column prop="consumerAlias" label="客户别名">
                        <form-common-column-input
                            clearable
                            placeholder="请输入客户别名"
                            v-model:value={formState.value.consumerAlias}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                    <common-database-search-column prop="appId" label="应用ID">
                        <form-common-column-input
                            clearable
                            placeholder="请输入应用ID"
                            v-model:value={formState.value.appId}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                    <common-database-search-column prop="appAlias" label="应用别名">
                        <form-common-column-input
                            clearable
                            placeholder="请输入应用别名"
                            v-model:value={formState.value.appAlias}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                    <common-database-search-column prop="countryKeyIds" label="国家/地区">
                        <form-common-column-select
                            clearable
                            filterable
                            multiple
                            placeholder="请选择国家/地区"
                            value-field="keyId"
                            label-field="showName"
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyIds}
                        ></form-common-column-select>
                    </common-database-search-column>
                    <common-database-search-column prop="mcc" label="MCC">
                        <form-common-column-input
                            clearable
                            placeholder="请输入MCC"
                            v-model:value={formState.value.mcc}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
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
                        col_consumerName: (data: Omix) => (
                            <common-database-table-content>{data.consumerOptions?.name}</common-database-table-content>
                        ),
                        col_consumerAlias: (data: Omix) => (
                            <common-database-table-content>{data.consumerOptions?.alias}</common-database-table-content>
                        ),
                        col_countryName: (data: Omix) => (
                            <common-database-table-content>
                                {(() => {
                                    const country = countryOptions.dataSource.value.find((item: Omix) => item.keyId === data.countryKeyId)
                                    return country ? `${country.cnName} - ${country.enName}` : data.code
                                })()}
                            </common-database-table-content>
                        ),
                        col_upUsd: (data: Omix) => <common-database-table-content>{formatPrice(data.upUsd)}</common-database-table-content>,
                        col_downUsd: (data: Omix) => (
                            <common-database-table-content>{formatPrice(data.downUsd)}</common-database-table-content>
                        ),
                        col_upLocal: (data: Omix) => (
                            <common-database-table-content>{formatPrice(data.upLocal)}</common-database-table-content>
                        ),
                        col_downLocal: (data: Omix) => (
                            <common-database-table-content>{formatPrice(data.downLocal)}</common-database-table-content>
                        ),
                        col_expiryTime: (data: Omix) => (
                            <common-database-table-content>{data.expiryTime ?? '永久有效'}</common-database-table-content>
                        )
                    }}
                </common-database-table>
            </n-element>
        )
    }
})
</script>
