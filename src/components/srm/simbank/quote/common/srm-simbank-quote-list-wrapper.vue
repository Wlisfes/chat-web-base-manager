<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useSelectService, pick, stop } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSimbankQuoteListWrapper',
    props: {
        /**报价状态**/
        status: { type: String, required: true }
    },
    setup(props, ctx) {
        /**国家/地区下拉数据**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            transform: s => s.map(e => ({ ...e, value: e.keyId, label: e.showName })),
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, router, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnSimbankQuote({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                formState: {
                    statuses: [props.status],
                    /**供应商ID**/
                    userKeyId: undefined,
                    /**供应商别名**/
                    userAlias: undefined,
                    /**simbank ID**/
                    simbankKeyId: undefined,
                    /**simbank 别名**/
                    simbankAlias: undefined,
                    /**国家/地区主键列表**/
                    countryKeyIds: [],
                    /**移动国家代码**/
                    mcc: undefined
                },
                columns: [
                    { title: '供应商ID', key: 'userKeyId', width: 100, disabled: true },
                    { title: '供应商名称', key: 'userName', minWidth: 200, disabled: true, ellipsis: false },
                    { title: '供应商别名', key: 'userAlias', width: 130 },
                    { title: 'simbank ID', key: 'simbankKeyId', width: 120 },
                    { title: 'simbank 别名', key: 'simbankAlias', width: 160 },
                    { title: 'MCC', key: 'mcc', width: 80 },
                    { title: 'Code', key: 'code', width: 80 },
                    { title: '国家/地区', key: 'countryKeyId', width: 180 },
                    { title: '汇率', key: 'exchangeRate', width: 100 },
                    { title: '报价币种', key: 'currency', width: 100 },
                    { title: '上行本币成本价', key: 'upLocal', width: 140 },
                    { title: '下行本币成本价', key: 'downLocal', width: 140 },
                    { title: '上行成本价(USD)', key: 'upUsd', width: 140 },
                    { title: '下行成本价(USD)', key: 'downUsd', width: 140 },
                    { title: '汇率日期', key: 'exchangeDate', width: 120 },
                    { title: '生效时间', key: 'effectiveTime', width: 170 },
                    { title: '失效时间', key: 'expiryTime', width: 170 },
                    { title: '创建时间', key: 'createTime', width: 170 }
                ]
            }
        )

        /**跳转供应商详情**/
        async function fetchJumpContextSupplier(event: MouseEvent, data: Omix) {
            return await stop(event, async () => {
                return await router.push({
                    path: `/srm/supplier/context/${data.keyId}`,
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
                        <common-base-authorize key-name="chat:srm:simbank:quote:create">
                            <router-link to="/srm/simbank/quote/wrapper">
                                <common-base-button class="min-w-80" type="primary">
                                    新增报价
                                </common-base-button>
                            </router-link>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column prop="userKeyId" label="供应商ID">
                        <form-base-input
                            clearable
                            placeholder="请输入供应商ID"
                            v-model:value={formState.value.userKeyId}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="userAlias" label="供应商别名">
                        <form-base-input
                            clearable
                            placeholder="请输入供应商别名"
                            v-model:value={formState.value.userAlias}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="simbankKeyId" label="simbank ID">
                        <form-base-input
                            clearable
                            placeholder="请输入simbank ID"
                            v-model:value={formState.value.simbankKeyId}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="simbankAlias" label="simbank 别名">
                        <form-base-input
                            clearable
                            placeholder="请输入simbank 别名"
                            v-model:value={formState.value.simbankAlias}
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
                                    onClick={(e: MouseEvent) => fetchJumpContextSupplier(e, data.userOptions)}
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
