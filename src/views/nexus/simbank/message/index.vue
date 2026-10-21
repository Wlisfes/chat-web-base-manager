<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService, useSelectService, pick, stop } from '@/hooks'
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
        /**设备下拉**/
        const simbankOptions = useSelectService(e => Service.httpBaseSrmSelectSimbank({ name: e.keywords || undefined }), {
            immediate: true,
            transform: list => list.map(item => ({ ...item, label: `[${item.alias}] ${item.name}` }))
        })
        /**国家/地区下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, router, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnSimbankMessage({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:simbank:message',
                formState: {
                    /**号码、内容、SIM、ICCID、任务、设备、通道、供应商、状态码**/
                    name: undefined,
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
                    /**国家/地区**/
                    countryKeyId: undefined
                },
                columns: [
                    { title: '消息ID', key: 'keyId', width: 100, disabled: true },
                    { title: '上下行', key: 'source', width: 90, disabled: true },
                    { title: '类型', key: 'type', width: 100 },
                    { title: '发送号码', key: 'fromNumber', width: 150 },
                    { title: '接收号码', key: 'toNumber', width: 150 },
                    { title: '短信内容', key: 'content', minWidth: 260, disabled: true },
                    { title: '发送状态', key: 'sendStatus', width: 110 },
                    { title: '国家/地区', key: 'countryKeyId', width: 180 },
                    { title: '计费条数', key: 'segments', width: 90 },
                    { title: '编码', key: 'encoding', width: 90 },
                    { title: 'SIM卡号', key: 'sim', width: 150 },
                    { title: '端口', key: 'port', width: 80 },
                    { title: '设备', key: 'simbankName', width: 180 },
                    { title: '供应商', key: 'userName', minWidth: 180 },
                    { title: '归属人', key: 'ownerUserUid', width: 120 },
                    { title: '成本(USD)', key: 'cost', width: 130 },
                    { title: '售价(USD)', key: 'price', width: 130 },
                    { title: '任务', key: 'taskName', width: 160 },
                    { title: '通道', key: 'channelAlias', width: 160 },
                    { title: '通道负责人', key: 'channelOwnerUserUid', width: 120 },
                    { title: '发送时间', key: 'sendTime', width: 160 },
                    { title: '创建时间', key: 'createTime', width: 160 }
                ]
            }
        )

        /**跳转供应商详情**/
        async function fetchJumpContextSupplier(event: MouseEvent, data: Omix) {
            return await stop(event, async () => {
                return await router.push({
                    path: `/srm/supplier/context/${data.userKeyId}`,
                    state: { tabTitle: data.userName }
                })
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
                    <common-database-search-column disabled prop="name" label="关键词">
                        <form-base-input
                            clearable
                            placeholder="号码/内容/SIM/设备/任务"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="simbankKeyId" label="所属设备">
                        <form-base-select
                            clearable
                            filterable
                            label-field="label"
                            label-value="keyId"
                            placeholder="请选择所属设备"
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
                    <common-database-search-column prop="countryKeyId" label="国家/地区">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择国家/地区"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
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
                            <common-base-chunk value={data.sendStatus} items={chunkOptions.value.sendStatusOptions}></common-base-chunk>
                        ),
                        col_content: (data: Omix) => <common-base-content ellipsis value={data.content}></common-base-content>,
                        col_countryKeyId: (data: Omix) => {
                            const country = countryOptions.dataSource.value.find((item: Omix) => item.keyId === data.countryKeyId)
                            return <common-base-content value={country?.showName}></common-base-content>
                        },
                        col_simbankName: (data: Omix) => (
                            <common-base-content ellipsis value={[data.simbankAlias, data.simbankName].filter(Boolean).join(' / ')}>
                                {[data.simbankAlias, data.simbankName].filter(Boolean).join(' / ')}
                            </common-base-content>
                        ),
                        col_userName: (data: Omix) => (
                            <common-base-content ellipsis value={data.userName}>
                                <n-text type="info" onClick={(e: MouseEvent) => data.userKeyId && fetchJumpContextSupplier(e, data)}>
                                    {data.userName}
                                </n-text>
                            </common-base-content>
                        ),
                        col_ownerUserUid: (data: Omix) => {
                            return <common-base-user element="text" data={data.ownerUserUidOptions}></common-base-user>
                        },
                        col_channelOwnerUserUid: (data: Omix) => (
                            <common-base-user element="text" data={data.channelOwnerUserUidOptions}></common-base-user>
                        ),
                        col_cost: (data: Omix) => <common-base-number shrink value={data.cost}></common-base-number>,
                        col_price: (data: Omix) => <common-base-number shrink value={data.price}></common-base-number>
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
