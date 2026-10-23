<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useSelectService, useFormService, omit, v4 } from '@/hooks'
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
        /**同类型短信应用下拉**/
        const appOptions = useSelectService(() => Service.httpBaseCrmSelectSmsApp({ type: props.node.type }), {
            immediate: false,
            transform: async data => data.map(item => ({ ...item, label: [item.appAlias, item.appName].filter(Boolean).join(' - ') }))
        })
        const { formState, formRef, state, setState, setForm, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**路由别名**/
                alias: props.node.alias,
                /**路由类型：创建后不可修改**/
                type: props.node.type,
                /**已绑定的短信应用**/
                list: Array.from({ length: 1 }, () => fetchAdapter())
            }
        })

        /**绑定应用数据转换**/
        function fetchAdapter(item: Omix = {}) {
            return {
                uuid: v4(),
                keyId: item.keyId,
                appKeyId: item.appKeyId,
                status: item.status ?? 'enable'
            }
        }

        /**加载同类型应用下拉，并用路由详情回显已绑定的短信应用。**/
        async function fetchInitialization() {
            try {
                return await Promise.all([Service.httpBaseSrmRouteResolver({ keyId: props.node.keyId }), appOptions.fetchRequest()]).then(
                    async ([{ data }]) => {
                        const rows = data?.apps ?? []
                        return await setForm({ list: (rows.length ? rows : [{}]).map(fetchAdapter) }).then(async () => {
                            return await setState({ initialize: false })
                        })
                    }
                )
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        /**更新短信应用绑定：以本次列表为准。**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) return await setState({ loading: false, disabled: false })
                try {
                    await Service.httpBaseSrmBindRouteApp({
                        routeKeyId: props.node.keyId,
                        apps: formState.value.list.map((item: Omix) => omit(item, ['uuid', 'keyId']))
                    })
                    return await setState({ visible: false }).then(async () => {
                        await emit('submit', { done: setState })
                        return await fetchNotifyService({ title: '操作成功' })
                    })
                } catch (err) {
                    return await setState({ loading: false, disabled: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={750}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-base-container
                    size="medium"
                    ref={formRef}
                    rules={state.rules}
                    model={formState.value}
                    disabled={state.loading}
                    require-mark-placement="left"
                >
                    {formState.value.list.map((item: Omix, index: number) => (
                        <nexus-sms-route-app-column
                            index={index}
                            key={item.uuid}
                            app-options={appOptions.dataSource.value}
                            v-model:node={item}
                            fetch-adapter={fetchAdapter}
                            v-model:list={formState.value.list}
                        ></nexus-sms-route-app-column>
                    ))}
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
