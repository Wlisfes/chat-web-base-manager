<script lang="tsx">
import { defineComponent, PropType, computed, onMounted } from 'vue'
import { useColumnService, useSelectService, useChunkService, pick } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackChannelPort',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**通道**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**端口静态枚举：在线状态**/
        const { chunkOptions } = useChunkService(e => Service.httpBaseSrmSimbankPortEnums(), {
            immediate: true
        })
        /**设备下拉**/
        const simbankOptions = useSelectService(e => Service.httpBaseSrmSelectSimbank({ vague: e.keywords }), {
            immediate: true
        })
        /**激活方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: true
        })
        /**可绑定端口分页列表：包含当前通道已绑定端口和未绑定通道的可用端口**/
        const { formRef, state, formState, instOptions, setState, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnSelectSimbankPort({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                immediate: false,
                keepSelect: true,
                options: { submitting: false },
                transform: fetchTransform,
                formState: {
                    /**归属人：来自通道，不可改**/
                    ownerUserUid: props.node.ownerUserUid,
                    /**当前通道：返回已绑定端口**/
                    channelKeyId: props.node.keyId,
                    /**设备**/
                    simbankKeyId: undefined,
                    /**激活方向**/
                    countryKeyId: undefined,
                    /**模糊搜索 SIM、IMEI、ICCID**/
                    vague: undefined
                },
                columns: [
                    { title: '端口', key: 'showName', minWidth: 220 },
                    { title: 'SIM', key: 'sim', width: 160 },
                    { title: 'IMEI', key: 'imei', width: 170 },
                    { title: 'ICCID', key: 'iccid', width: 200 },
                    { title: '激活方向', key: 'countryKeyId', width: 160 },
                    { title: '在线状态', key: 'online', width: 100 },
                    { title: '端口权重', key: 'bindWeight', width: 140, ellipsis: false, skeleton: 'form' },
                    { title: '启用', key: 'bindStatus', width: 80, ellipsis: false, skeleton: 'form' }
                ]
            }
        )

        /**已选端口ID**/
        const selectKeys = computed(() => new Set(state.select.map((item: Omix) => item.keyId)))

        /**
         * 列表行替换为 select 中的同一对象并合并最新字段，插槽直接改 data.bindWeight、data.bindStatus 即同步到 select。
         * 绑定字段用 bindWeight、bindStatus，避免与端口自身的 status 冲突。
         */
        function fetchTransform(data: Omix) {
            const current = new Map(state.select.map((item: Omix) => [item.keyId, item]))
            return (data.list ?? []).map((item: Omix) => {
                const node = current.get(item.keyId)
                return node ? Object.assign(node, item) : item
            })
        }

        /**勾选变化；新勾选端口默认权重1、启用，取消后再勾选沿用上次填写的值**/
        function fetchUpdateSelect(items: Array<Omix>) {
            return setState({
                select: items.map(item =>
                    Object.assign(item, { bindWeight: item.bindWeight ?? 1, bindStatus: item.bindStatus ?? 'enable' })
                )
            })
        }

        /**先把已绑定端口放入 select，再查询第一页，翻到对应页时自动回显勾选**/
        onMounted(fetchInitialization)
        async function fetchInitialization() {
            try {
                return await Service.httpBaseSrmChannelResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
                    const items = (data.list ?? []).map((item: Omix) => ({
                        keyId: item.portKeyId,
                        bindWeight: item.weight ?? 1,
                        bindStatus: item.status ?? 'enable'
                    }))
                    return await setState({ select: items }).then(() => {
                        return fetchRefresh({ page: 1 })
                    })
                })
            } catch (err) {
                return await fetchNotifyService({ type: 'error', title: err.message }).then(() => {
                    return fetchRefresh()
                })
            }
        }

        /**提交选中的端口；以本次选择为准，取消勾选的端口会解绑**/
        async function fetchSubmit() {
            const list = state.select.map((item: Omix) => ({ portKeyId: item.keyId, weight: item.bindWeight, status: item.bindStatus }))
            if (list.length === 0) {
                return await fetchNotifyService({ type: 'warning', title: '请选择要绑定的端口' })
            }
            if (list.some((item: Omix) => !item.weight || item.weight < 1 || item.weight > 100)) {
                return await fetchNotifyService({ type: 'warning', title: '已选端口的权重必须在 1-100 之间' })
            }
            try {
                await setState({ submitting: true })
                await Service.httpBaseSrmBindChannelPort({ channelKeyId: props.node.keyId, list })
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
                    <common-database-search-column prop="vague" label="模糊查询">
                        <form-base-input
                            clearable
                            placeholder="请输入 SIM、IMEI、ICCID 搜索，回车查询"
                            v-model:value={formState.value.vague}
                            on-submit={() => fetchRefresh({ page: 1 })}
                        ></form-base-input>
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
                    <common-database-search-column prop="countryKeyId" label="激活方向">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择激活方向"
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
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
                        col_countryKeyId: (data: Omix) => (
                            <common-base-chunk
                                mode="text"
                                ellipsis
                                value={data.countryKeyId}
                                items={countryOptions.dataSource.value}
                            ></common-base-chunk>
                        ),
                        col_online: (data: Omix) => (
                            <common-base-chunk value={data.online} items={chunkOptions.value.onlineOptions}></common-base-chunk>
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
