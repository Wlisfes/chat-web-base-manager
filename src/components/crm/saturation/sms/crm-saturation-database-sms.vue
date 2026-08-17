<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useSelectService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSaturationDatabaseSms',
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
        const { formRef, formState, state, chunkState, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpSmsSaturationColumn({ ...payload, status: props.status }),
            chunkNames: {
                CHUNK_SMS_FORMOSAN_STATUS: true
            },
            formState: {
                clientId: undefined,
                alias: undefined,
                appId: undefined,
                appAlias: undefined,
                code: undefined,
                mcc: undefined
            },
            columns: [
                { title: '客户ID', key: 'clientId', width: 100, disabled: true },
                { title: '客户名称', key: 'clientOptions', minWidth: 160, check: true },
                { title: '客户别名', key: 'clientAlias', width: 140, check: true },
                { title: '应用ID', key: 'appId', width: 120, check: true },
                { title: '应用别名', key: 'appOptions', minWidth: 160, check: true },
                { title: 'MCC', key: 'mcc', width: 80, check: true },
                { title: 'Code', key: 'code', width: 80, check: true },
                { title: '国家/地区', key: 'mccOptions', minWidth: 180, check: true },
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
            return Number(value).toFixed(6)
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
                    <common-database-search-column disabled prop="clientId" label="客户ID/名称">
                        <form-common-column-input
                            clearable
                            placeholder="请输入客户ID/名称"
                            v-model:value={formState.value.clientId}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                    <common-database-search-column prop="alias" label="客户别名">
                        <form-common-column-input
                            clearable
                            placeholder="请输入客户别名"
                            v-model:value={formState.value.alias}
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
                    <common-database-search-column prop="code" label="国家/地区">
                        <form-common-column-select
                            clearable
                            filterable
                            placeholder="请选择国家/地区"
                            value-field="code"
                            label-field="showName"
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.code}
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
                        col_clientOptions: (data: Omix) => (
                            <common-database-table-content>{data.clientOptions?.name}</common-database-table-content>
                        ),
                        col_clientAlias: (data: Omix) => (
                            <common-database-table-content>{data.clientOptions?.alias}</common-database-table-content>
                        ),
                        col_appOptions: (data: Omix) => (
                            <common-database-table-content>{data.appOptions?.appAlias ?? '-'}</common-database-table-content>
                        ),
                        col_mccOptions: (data: Omix) => (
                            <common-database-table-content>
                                {data.mccOptions ? `${data.mccOptions.cnName} - ${data.mccOptions.enName}` : undefined}
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
