<script lang="tsx">
import { defineComponent, PropType, computed, onMounted } from 'vue'
import { useColumnService, useChunkService, pick } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRouteChannel',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**路由**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**通道静态枚举：通道类型、通道状态**/
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmChannelEnums(), {
            immediate: true
        })
        /**通道分页列表；路由可以挂不同方向和类型的通道**/
        const { formRef, state, formState, instOptions, setState, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnChannel({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                immediate: false,
                keepSelect: true,
                options: { submitting: false },
                transform: fetchTransform,
                formState: {
                    /**通道别名或名称**/
                    alias: undefined,
                    /**通道类型**/
                    type: undefined,
                    /**通道状态**/
                    status: undefined
                },
                columns: [
                    { title: '通道别名', key: 'alias', width: 180 },
                    { title: '通道名称', key: 'name', minWidth: 200 },
                    { title: '通道类型', key: 'type', width: 120 },
                    { title: '归属人', key: 'ownerUserUid', width: 120 },
                    { title: '通道状态', key: 'status', width: 100 },
                    { title: '启用/端口', key: 'portCount', width: 110 },
                    { title: '通道优先级', key: 'bindPriority', width: 140, ellipsis: false, skeleton: 'form' },
                    { title: '通道权重', key: 'bindWeight', width: 140, ellipsis: false, skeleton: 'form' },
                    { title: '启用', key: 'bindStatus', width: 80, ellipsis: false, skeleton: 'form' }
                ]
            }
        )

        /**已选通道ID**/
        const selectKeys = computed(() => new Set(state.select.map((item: Omix) => item.keyId)))

        /**
         * 列表行替换为 select 中的同一对象并合并最新字段，插槽直接改 data.bindPriority、data.bindWeight、data.bindStatus 即同步到 select。
         * 绑定字段加 bind 前缀，避免与通道自身的 status 冲突。
         */
        function fetchTransform(data: Omix) {
            const current = new Map(state.select.map((item: Omix) => [item.keyId, item]))
            return (data.list ?? []).map((item: Omix) => {
                const node = current.get(item.keyId)
                return node ? Object.assign(node, item) : item
            })
        }

        /**勾选变化；新勾选通道默认优先级1、权重1、启用，取消后再勾选沿用上次填写的值**/
        function fetchUpdateSelect(items: Array<Omix>) {
            return setState({
                select: items.map(item =>
                    Object.assign(item, {
                        bindPriority: item.bindPriority ?? 1,
                        bindWeight: item.bindWeight ?? 1,
                        bindStatus: item.bindStatus ?? 'enable'
                    })
                )
            })
        }

        /**先把已绑定通道放入 select，再查询第一页，翻到对应页时自动回显勾选**/
        onMounted(fetchInitialization)
        async function fetchInitialization() {
            try {
                return await Service.httpBaseSrmRouteResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
                    const items = (data.channels ?? []).map((item: Omix) => ({
                        keyId: item.channelKeyId,
                        bindPriority: item.priority ?? 1,
                        bindWeight: item.weight ?? 1,
                        bindStatus: item.status ?? 'enable'
                    }))
                    return await setState({ select: items }).then(() => {
                        return fetchRefresh({ page: 1 })
                    })
                })
            } catch (err) {
                return await fetchNotifyService({ type: 'error', title: err.message }).then(() => {
                    return fetchRefresh({ page: 1 })
                })
            }
        }

        /**提交选中的通道；以本次选择为准，取消勾选的通道会解绑**/
        async function fetchSubmit() {
            const channels = state.select.map((item: Omix) => ({
                channelKeyId: item.keyId,
                priority: item.bindPriority,
                weight: item.bindWeight,
                status: item.bindStatus
            }))
            if (channels.length === 0) {
                return await fetchNotifyService({ type: 'warning', title: '请选择要绑定的通道' })
            }
            if (channels.some((item: Omix) => !item.priority || item.priority < 1 || item.priority > 9)) {
                return await fetchNotifyService({ type: 'warning', title: '已选通道的优先级必须在 1-9 之间' })
            }
            if (channels.some((item: Omix) => !item.weight || item.weight < 1 || item.weight > 100)) {
                return await fetchNotifyService({ type: 'warning', title: '已选通道的权重必须在 1-100 之间' })
            }
            try {
                await setState({ submitting: true })
                await Service.httpBaseSrmBindRouteChannel({ routeKeyId: props.node.keyId, channels })
                return await setState({ visible: false }).then(async () => {
                    await emit('submit', { done: setState })
                    return await fetchNotifyService({ title: `操作成功` })
                })
            } catch (err) {
                return await setState({ submitting: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        return () => (
            <common-dialog-provider
                width={1280}
                title={props.title}
                scrollbar={false}
                class-name="h-80vh"
                class-element="p-inline-20 gap-y-12"
                v-model:visible={state.visible}
                loading={state.submitting}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <common-database-search
                    class="p-0!"
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'abstract']}
                    ref={formRef}
                    v-model:loading={state.loading}
                    v-model:when={state.when}
                    v-model:database={state.database}
                    v-model:formState={formState.value}
                    on-restore={instOptions.fetchRestore}
                    on-submit={() => fetchRefresh({ page: 1 })}
                >
                    <common-database-search-column prop="alias" label="通道">
                        <form-base-input
                            clearable
                            placeholder="请输入通道别名或名称，回车查询"
                            v-model:value={formState.value.alias}
                            on-submit={() => fetchRefresh({ page: 1 })}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="type" label="通道类型">
                        <form-base-select
                            clearable
                            placeholder="请选择通道类型"
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="通道状态">
                        <form-base-select
                            clearable
                            placeholder="请选择通道状态"
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-select
                    bordered={false}
                    pagination-class="p-bs-12!"
                    limit={0}
                    page-sizes={[20, 50, 100]}
                    total={state.total}
                    columns={state.columns}
                    v-model:page={state.page}
                    v-model:size={state.size}
                    select={state.select}
                    v-model:data={state.dataSource}
                    v-model:loading={state.loading}
                    v-model:initialize={state.initialize}
                    on-update:select={fetchUpdateSelect}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                >
                    {{
                        col_type: (data: Omix) => (
                            <common-base-chunk value={data.type} items={chunkOptions.value.typeOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_ownerUserUid: (data: Omix) => (
                            <common-base-user element="text" data={data.ownerUserUidOptions}></common-base-user>
                        ),
                        col_portCount: (data: Omix) => `${data.enablePortCount ?? 0} / ${data.portCount ?? 0}`,
                        col_bindPriority: (data: Omix) => (
                            <form-base-input-number
                                size="small"
                                min={1}
                                max={9}
                                precision={0}
                                placeholder="1-9"
                                disabled={!selectKeys.value.has(data.keyId)}
                                v-model:value={data.bindPriority}
                            ></form-base-input-number>
                        ),
                        col_bindWeight: (data: Omix) => (
                            <form-base-input-number
                                size="small"
                                min={1}
                                max={100}
                                precision={0}
                                show-button={false}
                                placeholder="1-100"
                                disabled={!selectKeys.value.has(data.keyId)}
                                v-model:value={data.bindWeight}
                            ></form-base-input-number>
                        ),
                        col_bindStatus: (data: Omix) => (
                            <form-base-switch
                                size="small"
                                checked-value="enable"
                                unchecked-value="disable"
                                disabled={!selectKeys.value.has(data.keyId)}
                                v-model:value={data.bindStatus}
                            ></form-base-switch>
                        )
                    }}
                </common-database-table>
            </common-dialog-provider>
        )
    }
})
</script>
