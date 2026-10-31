<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, useSelectService, pick } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSimbankMessage',
    setup(props) {
        /**短信历史静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSrmSimbankMessageEnums(), {
            immediate: true
        })
        /**归属供应商下拉**/
        const userOptions = useSelectService(e => Service.httpBaseSrmSelectUser(), {
            immediate: true
        })
        /**通道下拉**/
        const channelOptions = useSelectService(() => Service.httpBaseSrmSelectChannel(), {
            immediate: true
        })
        /**设备下拉**/
        const simbankOptions = useSelectService(e => Service.httpBaseSrmSelectSimbank({ vague: e.keywords || undefined }), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnSimbankMessage({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:simbank:message',
                formState: {
                    /**消息ID**/
                    msgId: undefined,
                    /**通道**/
                    channelKeyId: undefined,
                    /**所属设备**/
                    simbankKeyId: undefined,
                    /**归属供应商**/
                    userKeyId: undefined,
                    /**上下行**/
                    source: undefined,
                    /**短信类型**/
                    type: undefined,
                    /**编码方式**/
                    encoding: undefined,
                    /**发送状态**/
                    sendStatus: undefined,
                    /**MCC**/
                    mcc: undefined
                },
                columns: [
                    { title: '消息ID', key: 'msgId', width: 200, disabled: true },
                    { title: '发送号码', key: 'fromNumber', width: 150, check: false },
                    { title: '接收号码', key: 'toNumber', width: 150 },
                    { title: '发送状态', key: 'sendStatus', width: 120 },
                    { title: '上下行', key: 'source', width: 90, check: false },
                    { title: '类型', key: 'type', width: 100 },
                    { title: 'MCC', key: 'mcc', width: 80 },
                    { title: '端口', key: 'port', width: 80 },
                    { title: 'SIM卡号', key: 'sim', width: 150 },
                    { title: '通道别名', key: 'channelAlias', width: 170 },
                    { title: '设备别名', key: 'simbankAlias', width: 150 },
                    { title: '供应商', key: 'userName', width: 200 },
                    { title: '短信内容', key: 'content', minWidth: 260, disabled: true },
                    { title: '计费条数', key: 'segments', width: 90 },
                    { title: '编码', key: 'encoding', width: 90 },
                    { title: '成本(USD)', key: 'cost', width: 120 },
                    { title: '售价(USD)', key: 'price', width: 120 },
                    { title: '发送时间', key: 'sendTime', width: 160 }
                ]
            }
        )

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
                    <common-database-search-column prop="msgId" label="消息ID">
                        <form-base-input
                            clearable
                            placeholder="请输入消息ID"
                            v-model:value={formState.value.msgId}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="mcc" label="MCC">
                        <form-base-input
                            clearable
                            placeholder="请输入MCC"
                            maxlength={4}
                            v-model:value={formState.value.mcc}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="channelKeyId" label="通道">
                        <form-base-select
                            clearable
                            filterable
                            label-field="alias"
                            label-value="keyId"
                            placeholder="请选择通道"
                            loading={channelOptions.loading.value}
                            options={channelOptions.dataSource.value}
                            v-model:value={formState.value.channelKeyId}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="simbankKeyId" label="设备别名">
                        <form-base-select
                            clearable
                            filterable
                            label-field="alias"
                            label-value="keyId"
                            placeholder="请选择设备别名"
                            loading={simbankOptions.loading.value}
                            options={simbankOptions.dataSource.value}
                            v-model:value={formState.value.simbankKeyId}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="userKeyId" label="归属供应商">
                        <form-base-select
                            clearable
                            filterable
                            label-field="name"
                            label-value="keyId"
                            placeholder="请选择归属供应商"
                            loading={userOptions.loading.value}
                            options={userOptions.dataSource.value}
                            v-model:value={formState.value.userKeyId}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="source" label="上下行">
                        <form-base-select
                            clearable
                            placeholder="请选择上下行"
                            loading={chunkState.loading}
                            options={chunkOptions.value.sourceOptions}
                            v-model:value={formState.value.source}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="type" label="短信类型">
                        <form-base-select
                            clearable
                            placeholder="请选择短信类型"
                            loading={chunkState.loading}
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="sendStatus" label="发送状态">
                        <form-base-select
                            clearable
                            placeholder="请选择发送状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.sendStatusOptions}
                            v-model:value={formState.value.sendStatus}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="encoding" label="编码方式">
                        <form-base-select
                            clearable
                            placeholder="请选择编码方式"
                            loading={chunkState.loading}
                            options={chunkOptions.value.encodingOptions}
                            v-model:value={formState.value.encoding}
                        ></form-base-select>
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
                        col_source: (data: Omix) => (
                            <common-base-chunk value={data.source} items={chunkOptions.value.sourceOptions}></common-base-chunk>
                        ),
                        col_type: (data: Omix) => (
                            <common-base-chunk value={data.type} items={chunkOptions.value.typeOptions}></common-base-chunk>
                        ),
                        col_encoding: (data: Omix) => (
                            <common-base-chunk value={data.encoding} items={chunkOptions.value.encodingOptions}></common-base-chunk>
                        ),
                        col_sendStatus: (data: Omix) => (
                            <div class="flex items-center gap-x-5 overflow-hidden">
                                <common-base-chunk value={data.sendStatus} items={chunkOptions.value.sendStatusOptions}></common-base-chunk>
                                {['rejected', 'failed'].includes(data.sendStatus) && (
                                    <common-base-hint-tooltip>{data.statusMessage}</common-base-hint-tooltip>
                                )}
                            </div>
                        ),
                        col_cost: (data: Omix) => {
                            return <common-base-number shrink value={data.cost}></common-base-number>
                        },
                        col_price: (data: Omix) => {
                            return <common-base-number shrink value={data.price}></common-base-number>
                        }
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
