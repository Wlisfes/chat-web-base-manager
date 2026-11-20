<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useSelectService } from '@/hooks'
import { fetchNormalizeTreeChildren, isNotEmpty } from '@/utils'
import { LOGGER_METHOD_OPTIONS, LOGGER_RESULT_OPTIONS } from '@/interface/deploy/deploy-logger.resolver'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeployDailyLogger',
    setup() {
        /**菜单树用于按页面功能筛选；无菜单管理权限时下拉为空，仍可按权限码查询。*/
        const sheetOptions = useSelectService(() => Service.httpBaseSkylineSheetTreeStructure(), {
            transform: fetchNormalizeTreeChildren,
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSkylineColumnLogger({ ...payload, page: base.page, size: base.size }),
            {
                keyName: 'chat:deploy:system:logger',
                formState: {
                    /**菜单节点**/
                    sheetKeyId: undefined,
                    /**操作人姓名或工号**/
                    operatorName: undefined,
                    /**日志ID**/
                    logId: undefined,
                    /**开始时间**/
                    startTime: undefined,
                    /**结束时间**/
                    endTime: undefined
                },
                columns: [
                    { title: '操作人', key: 'operatorName', width: 120, disabled: true },
                    { title: '操作功能', key: 'sheetName', width: 120, disabled: true },
                    { title: '结果', key: 'result', width: 100, disabled: true },
                    { title: '请求', key: 'url', width: 320, disabled: true },
                    { title: 'IP', key: 'ip', width: 140 },
                    { title: '日志ID', key: 'logId', width: 320 },
                    { title: '操作时间', key: 'createTime', width: 160 },
                    { title: '请求体', key: 'requestBody', minWidth: 280 }
                ]
            }
        )

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
                    <common-database-search-column disabled prop="startTime" label="操作时间" span={2}>
                        <form-base-date-picker
                            clearable
                            type="datetimerange"
                            start-placeholder="起始时间"
                            end-placeholder="结束时间"
                            functions={['近1小时', '近3小时', '近24小时', '近3天', '近7天', '近30天']}
                            v-model:startTime={formState.value.startTime}
                            v-model:endTime={formState.value.endTime}
                        ></form-base-date-picker>
                    </common-database-search-column>
                    <common-database-search-column prop="sheetKeyId" label="功能">
                        <form-base-tree-select
                            filterable
                            clearable
                            label-field="name"
                            label-value="keyId"
                            children-field="children"
                            placeholder="请选择页面功能"
                            loading={sheetOptions.loading.value}
                            options={sheetOptions.dataSource.value}
                            v-model:value={formState.value.sheetKeyId}
                            on-change:value={fetchRefresh}
                        ></form-base-tree-select>
                    </common-database-search-column>
                    <common-database-search-column disabled prop="operatorName" label="操作人">
                        <form-base-input
                            clearable
                            placeholder="请输入姓名、工号"
                            v-model:value={formState.value.operatorName}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="logId" label="日志ID">
                        <form-base-input
                            clearable
                            placeholder="请输入日志ID"
                            v-model:value={formState.value.logId}
                            on-submit={fetchRefresh}
                        ></form-base-input>
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
                >
                    {{
                        col_sheetName: (data: Omix) => (
                            <common-base-content ellipsis value={data.sheetName || data.permissionCode}></common-base-content>
                        ),
                        col_operatorName: (data: Omix) => (
                            <common-base-content
                                ellipsis
                                value={[data.operatorName, data.operatorNumber].filter(isNotEmpty).join(' ')}
                            ></common-base-content>
                        ),
                        col_result: (data: Omix) => (
                            <div class="flex items-center gap-x-5 overflow-hidden">
                                <common-base-chunk bordered value={data.result} items={LOGGER_RESULT_OPTIONS}></common-base-chunk>
                                {data.result === 'failure' && isNotEmpty(data.message) && (
                                    <common-base-hint-tooltip>{data.message}</common-base-hint-tooltip>
                                )}
                            </div>
                        ),
                        col_url: (data: Omix) => (
                            <div class="flex items-center gap-x-8 overflow-hidden">
                                <common-base-chunk value={data.method} items={LOGGER_METHOD_OPTIONS}></common-base-chunk>
                                <common-base-content ellipsis value={data.url}></common-base-content>
                            </div>
                        ),
                        col_resourceId: (data: Omix) => (
                            <common-base-content
                                ellipsis
                                value={[data.resourceType, data.resourceId].filter(isNotEmpty).join(' / ')}
                            ></common-base-content>
                        ),
                        col_message: (data: Omix) => <common-base-content ellipsis value={data.message}></common-base-content>,
                        col_requestBody: (data: Omix) => <common-base-content ellipsis value={data.requestBody}></common-base-content>,
                        col_logId: (data: Omix) => <common-base-content ellipsis value={data.logId}></common-base-content>,
                        col_permissionCode: (data: Omix) => <common-base-content ellipsis value={data.permissionCode}></common-base-content>
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
