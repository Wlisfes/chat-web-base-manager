<script lang="tsx">
import { defineComponent, PropType, ref } from 'vue'
import { useColumnService, useSelectService, useState, pick } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRouteApp',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**路由方案**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { state: dialog, setState: setDialog } = useState({ visible: true, loading: false, initialize: false })
        /**客户下拉**/
        const userOptions = useSelectService(() => Service.httpBaseCrmSelectUser({}), { immediate: true })
        /**待绑定：客户和该客户下的短信应用**/
        const userKeyId = ref<number>()
        const appKeyIds = ref<Array<number>>([])
        const appOptions = ref<Array<Omix>>([])
        const appLoading = ref(false)
        /**方案已绑定的短信应用**/
        const { state, fetchRefresh } = useColumnService(
            (base, payload) =>
                Service.httpBaseSrmColumnRouteApp({ ...payload, ...pick(base, ['page', 'size']), routeKeyId: props.node.keyId }),
            {
                size: 20,
                formState: {},
                columns: [
                    { title: '短信应用', key: 'appKeyId', minWidth: 200 },
                    { title: '应用ID', key: 'appId', width: 170 },
                    { title: '应用类型', key: 'type', width: 90 },
                    { title: '所属客户', key: 'userKeyId', minWidth: 180 },
                    { title: '绑定人', key: 'modifyBy', width: 110 },
                    { title: '绑定时间', key: 'modifyTime', width: 160 },
                    { title: '操作', key: 'command', width: 80 }
                ]
            }
        )

        /**切换客户后加载该客户的短信应用**/
        async function fetchUserChange(value?: number) {
            appKeyIds.value = []
            appOptions.value = []
            if (!value) return
            appLoading.value = true
            try {
                const { data } = await Service.httpBaseCrmSelectSmsApp({ userKeyId: value })
                appOptions.value = (data ?? []).map((item: Omix) => ({ ...item, label: `${item.appAlias} - ${item.appName}` }))
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            } finally {
                appLoading.value = false
            }
        }

        /**绑定短信应用：已绑定其他方案的应用会改绑到当前方案**/
        async function fetchBind() {
            if (appKeyIds.value.length === 0) return await fetchNotifyService({ type: 'warning', title: '请选择短信应用' })
            try {
                const { data } = await Service.httpBaseSrmBindRouteApp({ routeKeyId: props.node.keyId, appKeyIds: appKeyIds.value })
                appKeyIds.value = []
                await fetchNotifyService({ title: `已绑定 ${data?.count ?? 0} 个短信应用` })
                await emit('submit', { done: setDialog })
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            }
            return await fetchRefresh()
        }

        /**解绑短信应用：解绑后应用走默认方案**/
        async function fetchUnbind(node: Omix) {
            return await fetchDialogService({
                title: '解绑短信应用',
                content: `确认解绑短信应用【${node.appKeyIdOptions?.appName ?? node.appKeyId}】吗？解绑后该应用走默认方案。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmUnbindRouteApp({ keyIds: [node.keyId] })
                            return await done({ visible: false }).then(async () => {
                                await fetchNotifyService({ title: '操作成功' })
                                await emit('submit', { done: setDialog })
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
            <common-dialog-provider
                title={props.title}
                width={1000}
                action={false}
                v-model:visible={dialog.visible}
                v-model:loading={dialog.loading}
                v-model:initialize={dialog.initialize}
                onCancel={() => setDialog({ visible: false })}
                onClose={() => emit('close', { done: setDialog })}
            >
                <div class="flex flex-col gap-12">
                    <common-base-authorize key-name="chat:nexus:sms:route:app">
                        <div class="flex gap-12">
                            <form-base-select
                                clearable
                                filterable
                                class="w-260!"
                                label-field="showName"
                                label-value="keyId"
                                placeholder="选择客户"
                                loading={userOptions.loading.value}
                                options={userOptions.dataSource.value}
                                v-model:value={userKeyId.value}
                                on-change:value={fetchUserChange}
                            ></form-base-select>
                            <form-base-select
                                multiple
                                clearable
                                filterable
                                class="flex-1"
                                label-field="label"
                                label-value="keyId"
                                placeholder="选择该客户下的短信应用"
                                loading={appLoading.value}
                                options={appOptions.value}
                                v-model:value={appKeyIds.value}
                            ></form-base-select>
                            <common-base-button type="primary" onClick={fetchBind}>
                                绑定
                            </common-base-button>
                        </div>
                    </common-base-authorize>
                    <n-text depth="3">
                        一个短信应用只能绑定一个方案，已绑定其他方案的应用会改绑到当前方案；未绑定方案的应用走默认方案。
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
                            col_appKeyId: (data: Omix) => (
                                <common-base-content
                                    value={
                                        [data.appKeyIdOptions?.appAlias, data.appKeyIdOptions?.appName].filter(Boolean).join(' - ') ||
                                        data.appKeyId
                                    }
                                ></common-base-content>
                            ),
                            col_appId: (data: Omix) => <common-base-content value={data.appKeyIdOptions?.appId}></common-base-content>,
                            col_type: (data: Omix) => <common-base-content value={data.appKeyIdOptions?.type}></common-base-content>,
                            col_userKeyId: (data: Omix) => (
                                <common-base-content
                                    value={
                                        [data.userKeyIdOptions?.alias, data.userKeyIdOptions?.name].filter(Boolean).join(' - ') ||
                                        data.userKeyId
                                    }
                                ></common-base-content>
                            ),
                            col_modifyBy: (data: Omix) => <common-base-user element="text" data={data.modifyByOptions}></common-base-user>,
                            col_command: (data: Omix) => (
                                <common-base-authorize key-name="chat:nexus:sms:route:app">
                                    <common-base-button text type="error" title="解绑" onClick={() => fetchUnbind(data)}>
                                        解绑
                                    </common-base-button>
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
