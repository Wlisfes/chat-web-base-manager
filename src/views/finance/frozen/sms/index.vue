<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useSelectService } from '@/hooks'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceFrozenSmsManager',
    setup(props, ctx) {
        /**国家/地区下拉数据**/
        const countryOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseFinanceColumnFrozenSms({ ...payload, page: base.page, size: base.size }),
            {
                keyName: 'chat:finance:frozen:sms',
                actions: [{ title: '编辑', key: 'chat:finance:frozen:sms:update' }],
                formState: {
                    /**国家/地区**/
                    countryKeyId: undefined,
                    /**MCC**/
                    mcc: undefined
                },
                columns: [
                    { title: '国家/地区编码', key: 'code', width: 120, disabled: true },
                    { title: '中文名称', key: 'cnName', width: 160, disabled: true },
                    { title: '英文名称', key: 'enName', width: 200 },
                    { title: 'MCC', key: 'mcc', width: 120 },
                    { title: '上行费率(USD)', key: 'upUsd', width: 140 },
                    { title: '下行费率(USD)', key: 'downUsd', width: 140 },
                    { title: '备注', key: 'remark', minWidth: 200 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        /**新增**/
        async function fetchCreateFinanceFrozenSms() {
            return await feedback.fetchFinanceFrozenSms({
                title: '新增基础价格',
                command: 'CREATE',
                onSubmit: e => fetchRefresh()
            })
        }

        /**编辑**/
        async function fetchUpdateFinanceFrozenSms(node: Omix) {
            return await feedback.fetchFinanceFrozenSms({
                title: '编辑基础价格',
                command: 'UPDATE',
                node,
                onSubmit: e => fetchRefresh()
            })
        }

        /**批量上调、下调**/
        async function fetchFluctuateFinanceFrozenSms() {
            return await feedback.fetchFinanceFrozenFluctuate({
                title: '批量调整基础价格',
                items: state.select,
                onSubmit: e => fetchRefresh()
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
                        <common-base-authorize key-name="chat:finance:frozen:sms:create">
                            <common-base-button class="min-w-80" type="primary" onClick={fetchCreateFinanceFrozenSms}>
                                新增
                            </common-base-button>
                        </common-base-authorize>
                        <common-base-authorize key-name="chat:finance:frozen:sms:fluctuate">
                            <common-base-button class="min-w-80" secondary type="info" onClick={fetchFluctuateFinanceFrozenSms}>
                                批量调价
                            </common-base-button>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column prop="countryKeyId" label="国家/地区">
                        <form-base-select
                            clearable
                            filterable
                            placeholder="请选择国家/地区"
                            label-value="keyId"
                            label-field="showName"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                            on-change:value={fetchRefresh}
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
                    show-command={instState.value.showCommand}
                    on-update:customize={instOptions.fetchUpdateCustomize}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                >
                    {{
                        col_cnName: (data: Omix) => {
                            return <common-base-content value={data.countryOptions?.cnName}></common-base-content>
                        },
                        col_enName: (data: Omix) => {
                            return <common-base-content value={data.countryOptions?.enName}></common-base-content>
                        },
                        col_createBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.createByOptions}></common-base-user>
                        },
                        col_modifyBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.modifyByOptions}></common-base-user>
                        },
                        col_command: (data: Omix) => (
                            <common-base-element abstract class="flex items-center gap-x-10 overflow-hidden">
                                <common-base-authorize key-name={state.actions[0].key}>
                                    <common-base-button
                                        text
                                        title="编辑"
                                        type="info"
                                        onClick={(e: MouseEvent) => fetchUpdateFinanceFrozenSms(data)}
                                    >
                                        编辑
                                    </common-base-button>
                                </common-base-authorize>
                            </common-base-element>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
