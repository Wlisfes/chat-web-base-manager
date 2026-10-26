<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, pick } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsRule',
    setup() {
        /**路由静态枚举：规则组状态、条件字段、操作符、短信类型**/
        const { chunkOptions, chunkState } = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnRouteRule({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:sms:rule',
                formState: {
                    /**路由别名：模糊匹配**/
                    alias: undefined,
                    /**规则组状态**/
                    status: undefined
                },
                columns: [
                    { title: '规则ID', key: 'keyId', width: 120, disabled: true },
                    { title: '路由别名', key: 'alias', width: 180, disabled: true },
                    { title: '规则状态', key: 'status', width: 120 },
                    { title: '路由名称', key: 'routeName', minWidth: 200 },
                    { title: '组内条件', key: 'conditions', minWidth: 260 },
                    { title: '备注', key: 'remark', minWidth: 220 },
                    { title: '更新时间', key: 'modifyTime', width: 180, check: false }
                ]
            }
        )

        /**枚举 value 转 label**/
        function fetchLabel(items: Array<Omix> = [], value: string) {
            return items.find(item => item.value === value)?.label ?? value
        }

        /**条件取值转展示文本：方向显示中文名，短信类型显示枚举名称，号码段原样显示**/
        function fetchConditionValue(data: Omix, condition: Omix) {
            return (condition.value ?? []).map((value: string) => {
                if (condition.field === 'country') {
                    return (data.countryOptions ?? []).find((item: Omix) => String(item.keyId) === String(value))?.cnName ?? value
                }
                if (condition.field === 'type') {
                    return fetchLabel(chunkOptions.value.typeOptions, value)
                }
                return value
            })
        }

        /**组内条件文本：条件之间是“且”**/
        function fetchConditions(data: Omix) {
            return (data.conditions ?? []).map((condition: Omix) => {
                const field = fetchLabel(chunkOptions.value.ruleFieldOptions, condition.field)
                const operator = fetchLabel(chunkOptions.value.ruleOperatorOptions, condition.operator)
                return `${field} ${operator} ${fetchConditionValue(data, condition).join('、')}`
            })
        }

        return () => (
            <layout-common-container initialize={state.initialize}>
                <common-database-search
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy']}
                    ref={formRef}
                    label-width={85}
                    limit={state.limit}
                    v-model:loading={state.loading}
                    v-model:when={state.when}
                    v-model:database={state.database}
                    v-model:formState={formState.value}
                    on-update:database={instOptions.fetchUpdateDatabase}
                    on-restore={instOptions.fetchRestore}
                    on-submit={instOptions.fetchRequest}
                >
                    <common-database-search-column disabled prop="alias" label="路由别名">
                        <form-base-input
                            clearable
                            placeholder="请输入路由别名"
                            v-model:value={formState.value.alias}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="规则状态">
                        <form-base-select
                            clearable
                            placeholder="请选择规则状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.ruleStatusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-settings
                    show-command={instState.value.showCommand}
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
                        col_alias: (data: Omix) => {
                            return <common-base-content value={data.routeOptions?.alias}></common-base-content>
                        },
                        col_routeName: (data: Omix) => {
                            return <common-base-content value={data.routeOptions?.name}></common-base-content>
                        },
                        col_conditions: (data: Omix) => {
                            return <common-base-content value={fetchConditions(data)}></common-base-content>
                        },
                        col_status: (data: Omix) => (
                            <common-base-chunk value={data.status} items={chunkOptions.value.ruleStatusOptions}></common-base-chunk>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
