<script lang="tsx">
import { defineComponent, watch } from 'vue'
import { useColumnService, useChunkService, useSelectService, pick } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/nexus/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsRule',
    setup(props) {
        /**路由静态枚举：短信类型、规则状态、路由类型**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSrmRouteEnums(), {
            immediate: true
        })
        /**路由下拉**/
        const routeOptions = useSelectService(() => Service.httpBaseSrmSelectRoute(), {
            immediate: true
        })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, route, instState, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnRouteRule({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:nexus:sms:rule',
                actions: [
                    { title: '通道', key: 'chat:nexus:sms:rule:channel' },
                    { title: '编辑', key: 'chat:nexus:sms:rule:update' },
                    { title: '删除', key: 'chat:nexus:sms:rule:delete' }
                ],
                formState: {
                    /**所属路由：从短信路由页跳转时带入**/
                    routeKeyId: fetchQueryRouteKeyId(),
                    /**号码段**/
                    prefix: undefined,
                    /**方向**/
                    countryKeyId: undefined,
                    /**短信类型**/
                    type: undefined,
                    /**规则状态**/
                    status: undefined
                },
                columns: [
                    { title: '规则ID', key: 'keyId', width: 100, disabled: true },
                    { title: '所属路由', key: 'routeKeyId', width: 200, disabled: true },
                    { title: '路由类型', key: 'routeType', width: 110 },
                    { title: '方向', key: 'countryKeyId', minWidth: 200, disabled: true },
                    { title: '短信类型', key: 'type', width: 110 },
                    { title: '运营商MNC', key: 'mnc', width: 110 },
                    { title: '号码段', key: 'prefix', width: 130 },
                    { title: '通道（可用/全部）', key: 'channelCount', width: 150 },
                    { title: '规则状态', key: 'status', width: 100 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 },
                    { title: '备注', key: 'remark', minWidth: 200 }
                ]
            }
        )

        /**从地址参数读取所属路由**/
        function fetchQueryRouteKeyId() {
            const value = Number(new URLSearchParams(window.location.search).get('routeKeyId'))
            return Number.isInteger(value) && value > 0 ? value : undefined
        }

        /**页面缓存时，从短信路由页再次跳转进来也按新的路由筛选**/
        watch(
            () => route.query.routeKeyId,
            async value => {
                const routeKeyId = Number(value)
                if (!Number.isInteger(routeKeyId) || routeKeyId <= 0 || formState.value.routeKeyId === routeKeyId) return
                formState.value.routeKeyId = routeKeyId
                return await fetchRefresh({ page: 1 })
            }
        )

        /**规则展示名称：方向 / 类型 / 运营商 / 号码段**/
        function fetchRuleName(node: Omix) {
            const country = node.countryKeyIdOptions
            const parts = [country?.cnName ? `${country.code} ${country.cnName}` : node.countryKeyId, node.type]
            if (node.mnc) parts.push(`MNC ${node.mnc}`)
            if (node.prefix) parts.push(`号码段 ${node.prefix}`)
            return parts.join(' / ')
        }

        /**新增规则：已筛选路由时默认带入**/
        async function fetchCreateRule() {
            return await feedback.fetchNexusSmsRouteRuleForm({
                title: '新增路由规则',
                command: 'CREATE',
                node: { routeKeyId: formState.value.routeKeyId },
                onSubmit: () => fetchRefresh()
            })
        }

        /**编辑规则**/
        async function fetchUpdateRule(node: Omix) {
            return await feedback.fetchNexusSmsRouteRuleForm({
                title: '编辑路由规则',
                command: 'UPDATE',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**规则通道：优先级、权重和启停**/
        async function fetchRuleChannel(node: Omix) {
            return await feedback.fetchNexusSmsRouteChannel({
                title: `规则通道：${fetchRuleName(node)}`,
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**启用、停用规则**/
        async function fetchRuleStatus(node: Omix, status: string) {
            try {
                await Service.httpBaseSrmUpdateRouteRule({ keyId: node.keyId, status, remark: node.remark })
                await fetchNotifyService({ title: '操作成功' })
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            }
            return await fetchRefresh()
        }

        /**删除规则**/
        async function fetchDeleteRule(node: Omix) {
            return await fetchDialogService({
                title: '删除路由规则',
                content: `确认删除规则【${fetchRuleName(node)}】吗？规则下的通道配置会一起删除。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmDeleteRouteRule({ keyId: node.keyId })
                            return await done({ visible: false }).then(async () => {
                                await fetchNotifyService({ title: '操作成功' })
                                return await fetchRefresh()
                            })
                        } catch (err) {
                            return await done({ loading: false }).then(async () => {
                                return await fetchNotifyService({ type: 'error', title: err.message })
                            })
                        }
                    })
                }
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
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-authorize key-name="chat:nexus:sms:rule:create">
                            <common-base-button class="min-w-80" type="primary" onClick={fetchCreateRule}>
                                新增
                            </common-base-button>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="routeKeyId" label="所属路由">
                        <form-base-select
                            clearable
                            filterable
                            label-field="name"
                            label-value="keyId"
                            placeholder="请选择所属路由"
                            loading={routeOptions.loading.value}
                            options={routeOptions.dataSource.value}
                            v-model:value={formState.value.routeKeyId}
                            on-change:value={() => fetchRefresh({ page: 1 })}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="prefix" label="号码段">
                        <form-base-input
                            clearable
                            placeholder="请输入号码段"
                            v-model:value={formState.value.prefix}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="countryKeyId" label="方向">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择方向"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
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
                    <common-database-search-column prop="status" label="规则状态">
                        <form-base-select
                            clearable
                            placeholder="请选择规则状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.ruleStatusOptions}
                            v-model:value={formState.value.status}
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
                        col_routeKeyId: (data: Omix) => {
                            const name = [data.routeKeyIdOptions?.alias, data.routeKeyIdOptions?.name].filter(Boolean).join(' / ')
                            return <common-base-content ellipsis value={name || data.routeKeyId}></common-base-content>
                        },
                        col_routeType: (data: Omix) => (
                            <common-base-chunk
                                bordered
                                value={data.routeKeyIdOptions?.type}
                                items={chunkOptions.value.routeTypeOptions}
                            ></common-base-chunk>
                        ),
                        col_countryKeyId: (data: Omix) => {
                            const country = data.countryKeyIdOptions
                            return (
                                <common-base-content
                                    value={country?.cnName ? `${country.code} ${country.cnName} - ${country.enName}` : data.countryKeyId}
                                ></common-base-content>
                            )
                        },
                        col_type: (data: Omix) => (
                            <common-base-chunk value={data.type} items={chunkOptions.value.typeOptions}></common-base-chunk>
                        ),
                        col_mnc: (data: Omix) => (data.mnc ? <n-text>{data.mnc}</n-text> : <n-text depth="3">全部</n-text>),
                        col_prefix: (data: Omix) => (data.prefix ? <n-text>{data.prefix}</n-text> : <n-text depth="3">全部</n-text>),
                        col_channelCount: (data: Omix) => (
                            <n-text type={data.activeChannelCount > 0 ? 'default' : 'warning'}>
                                {data.activeChannelCount} / {data.channelCount}
                            </n-text>
                        ),
                        col_status: (data: Omix) => (
                            <n-switch
                                size="small"
                                value={data.status === 'enable'}
                                onUpdate:value={(value: boolean) => fetchRuleStatus(data, value ? 'enable' : 'disable')}
                            ></n-switch>
                        ),
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
                                        {...{ text: true, type: 'primary', title: '通道', content: '通道' }}
                                        onClick={() => fetchRuleChannel(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[1].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'info', title: '编辑', content: '编辑' }}
                                        onClick={() => fetchUpdateRule(data)}
                                    />
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[2].key}>
                                    <common-base-button
                                        {...{ text: true, type: 'error', title: '删除', content: '删除' }}
                                        onClick={() => fetchDeleteRule(data)}
                                    />
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