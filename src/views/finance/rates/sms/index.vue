<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceRatesSms',
    setup(props, ctx) {
        /**表格实例**/
        const { formRef, formState, state, chunkState, instState, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseFinanceColumnBasicSmsRate(payload),
            keyName: 'chatbok:finance:rates:sms',
            chunkNames: { CHUNK_BRAND_STATUS: true },
            formState: {
                code: undefined,
                mcc: undefined
            },
            columns: [
                { title: '国家/地区编码', key: 'code', width: 120, check: true },
                { title: '中文名称', key: 'cnName', width: 160, disabled: true },
                { title: '英文名称', key: 'enName', width: 160, check: true },
                { title: 'MCC', key: 'mcc', width: 120, check: true },
                { title: '上行费率(USD)', key: 'upUsd', width: 120, check: true },
                { title: '下行费率(USD)', key: 'downUsd', width: 120, check: true },
                { title: '备注', key: 'remark', minWidth: 200, ellipsis: { tooltip: true }, check: true },
                { title: '创建人', key: 'createBy', width: 120, check: true },
                { title: '更新人', key: 'modifyBy', width: 120, check: true },
                { title: '创建时间', key: 'createTime', width: 160, check: true },
                { title: '更新时间', key: 'modifyTime', width: 160, check: true }
            ]
        })

        /**新增**/
        async function fetchDeployRatesSmsCreate() {
            return await feedback.fetchFinanceDeployRatesSms({
                title: '新增基础价格',
                command: 'CREATE',
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**编辑**/
        async function fetchDeployRatesSmsUpdate() {
            return await feedback.fetchFinanceDeployRatesSms({
                title: '编辑基础价格',
                command: 'UPDATE',
                node: state.select[0],
                async onSubmit() {
                    return await fetchRefresh()
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
                        <common-element-button type="primary" onClick={fetchDeployRatesSmsCreate}>
                            新增
                        </common-element-button>
                        <common-element-button
                            dashed
                            type="primary"
                            disabled={instState.value.isUpdate}
                            onClick={fetchDeployRatesSmsUpdate}
                        >
                            编辑
                        </common-element-button>
                    </common-database-search-function>
                    <common-database-search-column prop="code" label="编码">
                        <form-common-column-input
                            clearable
                            placeholder="请输入国家/地区编码"
                            v-model:value={formState.value.code}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
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
                        col_cnName: (data: Omix) => (
                            <common-database-table-content value={data.countryOptions.cnName}></common-database-table-content>
                        ),
                        col_enName: (data: Omix) => (
                            <common-database-table-content value={data.countryOptions.enName}></common-database-table-content>
                        ),
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
