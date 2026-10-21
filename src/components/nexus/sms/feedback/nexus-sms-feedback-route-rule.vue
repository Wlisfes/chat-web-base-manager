<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useChunkService, useSelectService, useState, pick } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/nexus/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRouteRule',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**路由方案**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { state: dialog, setState: setDialog } = useState({ visible: true, loading: false, initialize: false })
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), { immediate: true })
        /**方案下的规则**/
        const { formState, state, fetchRefresh } = useColumnService(
            (base, payload) =>
                Service.httpBaseSrmColumnRouteRule({ ...payload, ...pick(base, ['page', 'size']), routeKeyId: props.node.keyId }),
            {
                size: 20,
                formState: {
                    /**方向**/
                    countryKeyId: undefined,
                    /**短信类型**/
                    type: undefined
                },
                columns: [
                    { title: '方向', key: 'countryKeyId', minWidth: 180 },
                    { title: '短信类型', key: 'type', width: 100 },
                    { title: '运营商MNC', key: 'mnc', width: 100 },
                    { title: '号码段', key: 'prefix', width: 120 },
                    { title: '通道（可用/全部）', key: 'channelCount', width: 140 },
                    { title: '状态', key: 'status', width: 80 },
                    { title: '备注', key: 'remark', minWidth: 140 },
                    { title: '操作', key: 'command', width: 150 }
                ]
            }
        )

        /**规则变更后刷新列表并通知方案列表更新规则数**/
        async function fetchChanged() {
            await emit('submit', { done: setDialog })
            return await fetchRefresh()
        }

        /**新增规则**/
        async function fetchCreateRule() {
            return await feedback.fetchNexusSmsRouteRuleForm({
                title: '新增路由规则',
                command: 'CREATE',
                node: { routeKeyId: props.node.keyId },
                onSubmit: fetchChanged
            })
        }

        /**编辑规则**/
        async function fetchUpdateRule(node: Omix) {
            return await feedback.fetchNexusSmsRouteRuleForm({ title: '编辑路由规则', command: 'UPDATE', node, onSubmit: fetchChanged })
        }

        /**规则通道管理**/
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
                                return await fetchChanged()
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

        /**规则展示名称：方向 / 类型 / 运营商 / 号码段**/
        function fetchRuleName(node: Omix) {
            const country = node.countryKeyIdOptions
            const parts = [country?.cnName ? `${country.code} ${country.cnName}` : node.countryKeyId, node.type]
            if (node.mnc) parts.push(`MNC ${node.mnc}`)
            if (node.prefix) parts.push(`号码段 ${node.prefix}`)
            return parts.join(' / ')
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={1100}
                action={false}
                v-model:visible={dialog.visible}
                v-model:loading={dialog.loading}
                v-model:initialize={dialog.initialize}
                onCancel={() => setDialog({ visible: false })}
                onClose={() => emit('close', { done: setDialog })}
            >
                <div class="flex flex-col gap-12">
                    <div class="flex gap-12">
                        <form-base-select
                            clearable
                            filterable
                            class="w-240!"
                            label-field="showName"
                            label-value="keyId"
                            placeholder="按方向筛选"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                            on-change:value={() => fetchRefresh({ page: 1 })}
                        ></form-base-select>
                        <form-base-select
                            clearable
                            class="w-160!"
                            placeholder="短信类型"
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                            on-change:value={() => fetchRefresh({ page: 1 })}
                        ></form-base-select>
                        <div class="flex-1"></div>
                        <common-base-authorize key-name="chat:nexus:sms:route:rule">
                            <common-base-button type="primary" onClick={fetchCreateRule}>
                                新增规则
                            </common-base-button>
                        </common-base-authorize>
                    </div>
                    <n-text depth="3">
                        选路时在方案内按 号码段 &gt; 运营商 &gt; 方向
                        从细到粗匹配，没有可用通道的规则会被跳过；方案内没有匹配规则时回落到默认方案。
                    </n-text>
                    <common-database-table
                        flex-height={false}
                        limit={0}
                        bordered={false}
                        total={state.total}
                        columns={state.columns}
                        v-model:page={state.page}
                        v-model:size={state.size}
                        v-model:select={state.select}
                        v-model:data={state.dataSource}
                        v-model:loading={state.loading}
                        v-model:initialize={state.initialize}
                        on-update:page={(page: number) => fetchRefresh({ page })}
                        on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                    >
                        {{
                            col_countryKeyId: (data: Omix) => {
                                const country = data.countryKeyIdOptions
                                return (
                                    <common-base-content
                                        value={
                                            country?.cnName ? `${country.code} ${country.cnName} - ${country.enName}` : data.countryKeyId
                                        }
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
                            col_command: (data: Omix) => (
                                <common-base-authorize key-name="chat:nexus:sms:route:rule">
                                    <div class="flex items-center gap-x-10">
                                        <common-base-button text type="primary" title="通道" onClick={() => fetchRuleChannel(data)}>
                                            通道
                                        </common-base-button>
                                        <common-base-button text type="info" title="编辑" onClick={() => fetchUpdateRule(data)}>
                                            编辑
                                        </common-base-button>
                                        <common-base-button text type="error" title="删除" onClick={() => fetchDeleteRule(data)}>
                                            删除
                                        </common-base-button>
                                    </div>
                                </common-base-authorize>
                            )
                        }}
                    </common-database-table>
                </div>
            </common-dialog-provider>
        )
    }
})
</script>
