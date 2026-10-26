<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useChunkService, useFormService, useSelectService, omit, v4 } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRouteRules',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**路由**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**路由枚举、号段下拉**/
        const { chunkOptions, chunkState, fetchChunkService } = useChunkService(e => Service.httpBaseSrmRouteEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_SRM_NUMBER_RANGE'],
            immediate: false
        })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: false,
            transform: data => data.map((item: Omix) => ({ ...item, value: String(item.keyId) }))
        })
        const { formState, formRef, state, setState, setForm, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**规则列表**/
                list: Array.from({ length: 1 }, () => fetchAdapter())
            }
        })

        /**规则条件数据转换**/
        function fetchConditionsAdapter(item: Omix = {}) {
            return {
                uuid: v4(),
                field: item.field,
                operator: item.operator,
                value: item.value ?? []
            }
        }

        /**规则数据转换**/
        function fetchAdapter(item: Omix = {}) {
            return {
                uuid: v4(),
                keyId: item.keyId,
                routeKeyId: item.routeKeyId ?? props.node.keyId,
                status: item.status ?? 'enable',
                remark: item.remark,
                conditions: (item.conditions ?? [{}]).map(fetchConditionsAdapter)
            }
        }

        /**提交参数转换**/
        function fetchStateAdapter(list: Array<Omix>) {
            return list.map((item, sort) => {
                const conditions = item.conditions.map((e: Omix) => ({
                    ...omit(e),
                    value: (e.value ?? []).map((value: Omix) => String(value))
                }))
                return { ...omit(item), sort: sort + 1, conditions }
            })
        }

        /**加载方向、号段和当前路由已配置的规则组。**/
        async function fetchInitialization() {
            try {
                return await Promise.all([
                    Service.httpBaseSrmRouteResolver({ keyId: props.node.keyId }),
                    countryOptions.fetchRequest(),
                    fetchChunkService()
                ]).then(async ([{ data }]) => {
                    return await setForm({ list: (data.rules ?? [{}]).map(fetchAdapter) }).then(async () => {
                        return await setState({ initialize: false })
                    })
                })
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        /**按当前列表配置路由规则组。**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseSrmBindRouteRule({
                        routeKeyId: props.node.keyId,
                        list: fetchStateAdapter(formState.value.list)
                    })
                    return await setState({ visible: false }).then(async () => {
                        await emit('submit', { done: setState })
                        return await fetchNotifyService({ title: `操作成功` })
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
                width={850}
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
                    {formState.value.list.length === 0 ? (
                        <n-empty class="p-block-32" description="还没有规则组，路由不会接收任何短信">
                            {{
                                extra: () => (
                                    <common-base-button secondary type="primary" onClick={() => formState.value.list.push(fetchAdapter())}>
                                        新增规则组
                                    </common-base-button>
                                )
                            }}
                        </n-empty>
                    ) : (
                        <common-base-draggable
                            class="flex flex-col gap-y-10 overflow-hidden"
                            handle=".nexus-handle"
                            animation={200}
                            v-model={formState.value.list}
                        >
                            {formState.value.list.map((item: Omix, index: number) => (
                                <nexus-sms-route-rule-column
                                    index={index}
                                    key={item.uuid}
                                    v-model:node={item}
                                    chunk-state={chunkState}
                                    chunk-options={chunkOptions.value}
                                    country-options={countryOptions.dataSource.value}
                                    fetch-adapter={fetchAdapter}
                                    fetch-conditions-adapter={fetchConditionsAdapter}
                                    v-model:list={formState.value.list}
                                ></nexus-sms-route-rule-column>
                            ))}
                        </common-base-draggable>
                    )}
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
