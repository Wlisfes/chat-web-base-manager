<script lang="tsx">
import { defineComponent, PropType, computed, onMounted } from 'vue'
import { useColumnService, useChunkService, useSelectService, pick } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRouteApp',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**路由**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**短信应用静态枚举：短信类型、应用状态**/
        const { chunkOptions } = useChunkService(() => Service.httpBaseCrmSmsAppEnums(), {
            immediate: true
        })
        /**客户下拉**/
        const userOptions = useSelectService(() => Service.httpBaseCrmSelectUser({}), {
            immediate: true,
            transform: data =>
                data.map(item => {
                    const showName = [item.alias, item.name].filter(Boolean).join(' - ')
                    return { ...item, showName, value: item.keyId, label: showName }
                })
        })
        /**同类型短信应用分页列表；只能绑定与路由类型一致的应用**/
        const { formRef, state, formState, instOptions, setState, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseCrmColumnSmsApp({ ...payload, type: props.node.type, ...pick(base, ['page', 'size']) }),
            {
                immediate: false,
                keepSelect: true,
                options: { submitting: false },
                transform: fetchTransform,
                formState: {
                    /**客户**/
                    userKeyId: undefined,
                    /**应用别名**/
                    appAlias: undefined,
                    /**应用ID**/
                    appId: undefined,
                    /**应用状态**/
                    status: undefined
                },
                columns: [
                    { title: '应用别名', key: 'appAlias', width: 180 },
                    { title: '应用名称', key: 'appName', minWidth: 200 },
                    { title: '应用ID', key: 'appId', width: 200 },
                    { title: '客户', key: 'userKeyId', minWidth: 200 },
                    { title: '短信类型', key: 'type', width: 110 },
                    { title: '应用状态', key: 'status', width: 100 },
                    { title: '绑定状态', key: 'bindStatus', width: 100, ellipsis: false, skeleton: 'form' }
                ]
            }
        )

        /**已选应用ID**/
        const selectKeys = computed(() => new Set(state.select.map((item: Omix) => item.keyId)))

        /**
         * 列表行替换为 select 中的同一对象并合并最新字段，插槽直接改 data.bindStatus 即同步到 select。
         * 绑定状态用 bindStatus，避免与应用自身的 status 冲突。
         */
        function fetchTransform(data: Omix) {
            const current = new Map(state.select.map((item: Omix) => [item.keyId, item]))
            return (data.list ?? []).map((item: Omix) => {
                const node = current.get(item.keyId)
                return node ? Object.assign(node, item) : item
            })
        }

        /**勾选变化；新勾选应用默认启用，取消后再勾选沿用上次的绑定状态**/
        function fetchUpdateSelect(items: Array<Omix>) {
            return setState({
                select: items.map(item => Object.assign(item, { bindStatus: item.bindStatus ?? 'enable' }))
            })
        }

        /**先把已绑定应用放入 select，再查询第一页，翻到对应页时自动回显勾选**/
        onMounted(fetchInitialization)
        async function fetchInitialization() {
            try {
                return await Service.httpBaseSrmRouteResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
                    const items = (data.apps ?? []).map((item: Omix) => ({
                        keyId: item.appKeyId,
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

        /**提交选中的应用；以本次选择为准，取消勾选的应用会解绑；已绑定其他路由的应用会改绑到当前路由**/
        async function fetchSubmit() {
            const apps = state.select.map((item: Omix) => ({ appKeyId: item.keyId, status: item.bindStatus }))
            if (apps.length === 0) {
                return await fetchNotifyService({ type: 'warning', title: '请选择要绑定的短信应用' })
            }
            try {
                await setState({ submitting: true })
                await Service.httpBaseSrmBindRouteApp({ routeKeyId: props.node.keyId, apps })
                return await setState({ visible: false }).then(async () => {
                    await emit('submit', { done: setState })
                    return await fetchNotifyService({ title: '操作成功' })
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
                    <common-database-search-column prop="appAlias" label="应用别名">
                        <form-base-input
                            clearable
                            placeholder="请输入应用别名，回车查询"
                            v-model:value={formState.value.appAlias}
                            on-submit={() => fetchRefresh({ page: 1 })}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="userKeyId" label="客户">
                        <form-base-select
                            clearable
                            filterable
                            label-field="showName"
                            value-field="keyId"
                            placeholder="请选择客户"
                            loading={userOptions.loading.value}
                            options={userOptions.dataSource.value}
                            v-model:value={formState.value.userKeyId}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="appId" label="应用ID">
                        <form-base-input
                            clearable
                            placeholder="请输入应用ID，回车查询"
                            v-model:value={formState.value.appId}
                            on-submit={() => fetchRefresh({ page: 1 })}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="应用状态">
                        <form-base-select
                            clearable
                            placeholder="请选择应用状态"
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
                        col_userKeyId: (data: Omix) => (
                            <common-base-chunk
                                mode="text"
                                ellipsis
                                value={data.userKeyId}
                                items={userOptions.dataSource.value}
                            ></common-base-chunk>
                        ),
                        col_type: (data: Omix) => (
                            <common-base-chunk value={data.type} items={chunkOptions.value.typeOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
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
