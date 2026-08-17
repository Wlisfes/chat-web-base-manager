<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceDeployExchange',
    setup(props, ctx) {
        /**表格实例**/
        const { formRef, formState, state, chunkState, instState, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseFinanceColumnCurrencyExchange(payload),
            keyName: 'chatbok:finance:deploy:exchange',
            chunkNames: {},
            formState: {
                currency: undefined,
                date: undefined
            },
            columns: [
                { title: '币种编码', key: 'currency', minWidth: 120, check: true },
                { title: '汇率(基于USD)', key: 'rate', minWidth: 160, check: true },
                { title: '汇率日期', key: 'date', minWidth: 160, check: true },
                { title: '创建时间', key: 'createTime', width: 160, check: true },
                { title: '更新时间', key: 'modifyTime', width: 160, check: true }
            ]
        })

        return () => (
            <layout-common-container initialize={state.initialize}>
                <common-database-search
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy']}
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
                    <common-database-search-column prop="currency" label="币种">
                        <form-common-column-input
                            clearable
                            placeholder="请输入币种编码"
                            v-model:value={formState.value.currency}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                    <common-database-search-column prop="date" label="日期">
                        <form-common-column-input
                            clearable
                            placeholder="请输入汇率日期"
                            v-model:value={formState.value.date}
                            on-submit={fetchRefresh}
                        ></form-common-column-input>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
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
                ></common-database-table>
            </layout-common-container>
        )
    }
})
</script>
