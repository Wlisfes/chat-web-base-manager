<script lang="tsx">
import { defineComponent, PropType, ref, onMounted } from 'vue'
import { useChunkService, useSelectService, useState } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

/**规则组编辑态**/
type RuleDraft = {
    keyId?: number
    sort: number
    status: string
    remark?: string
    conditions: Array<Omix>
    editing: boolean
    description?: string
}

export default defineComponent({
    name: 'NexusSmsFeedbackRouteRule',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**路由**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { state: dialog, setState: setDialog } = useState({ visible: true, loading: false, initialize: false })
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: true,
            transform: data => data.map((item: Omix) => ({ ...item, value: String(item.keyId) }))
        })
        /**规则组列表**/
        const rules = ref<Array<RuleDraft>>([])
        const loading = ref(false)

        onMounted(fetchRefresh)

        /**刷新规则组**/
        async function fetchRefresh() {
            loading.value = true
            try {
                const { data } = await Service.httpBaseSrmListRouteRule({ routeKeyId: props.node.keyId })
                rules.value = (data ?? []).map((item: Omix) => ({ ...item, editing: false }))
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            } finally {
                loading.value = false
            }
        }

        /**字段可用的操作符：号码段用开头匹配，其余用属于**/
        function operatorOptions(field: string) {
            const allowed = field === 'prefix' ? ['prefix', 'not_prefix'] : ['in', 'not_in']
            return (chunkOptions.value.ruleOperatorOptions ?? []).filter((item: Omix) => allowed.includes(item.value))
        }

        /**新增规则组**/
        function fetchAppendRule() {
            rules.value.push({
                sort: (rules.value.at(-1)?.sort ?? -1) + 1,
                status: 'enable',
                conditions: [{ field: 'country', operator: 'in', value: [] }],
                editing: true
            })
        }

        /**新增条件**/
        function fetchAppendCondition(rule: RuleDraft) {
            rule.conditions.push({ field: 'type', operator: 'in', value: [] })
        }

        /**切换条件字段时重置操作符和取值**/
        function fetchFieldChange(condition: Omix, field: string) {
            condition.field = field
            condition.operator = field === 'prefix' ? 'prefix' : 'in'
            condition.value = []
        }

        /**保存规则组**/
        async function fetchSave(rule: RuleDraft) {
            if (rule.conditions.length === 0) return await fetchNotifyService({ type: 'warning', title: '请至少添加一个条件' })
            if (rule.conditions.some(item => !item.value?.length))
                return await fetchNotifyService({ type: 'warning', title: '条件取值不能为空' })
            const body = {
                sort: rule.sort ?? 0,
                status: rule.status,
                remark: rule.remark,
                conditions: rule.conditions.map(item => ({ field: item.field, operator: item.operator, value: item.value.map(String) }))
            }
            try {
                if (rule.keyId) await Service.httpBaseSrmUpdateRouteRule({ ...body, keyId: rule.keyId })
                else await Service.httpBaseSrmCreateRouteRule({ ...body, routeKeyId: props.node.keyId })
                await fetchNotifyService({ title: '操作成功' })
                await emit('submit', { done: setDialog })
                return await fetchRefresh()
            } catch (err) {
                return await fetchNotifyService({ type: 'error', title: err.message })
            }
        }

        /**启用、停用规则组**/
        async function fetchStatus(rule: RuleDraft, enable: boolean) {
            rule.status = enable ? 'enable' : 'disable'
            return await fetchSave(rule)
        }

        /**删除规则组**/
        async function fetchDelete(rule: RuleDraft, index: number) {
            if (!rule.keyId) return rules.value.splice(index, 1)
            return await fetchDialogService({
                title: '删除规则组',
                content: `确认删除规则组 #${index + 1} 吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSrmDeleteRouteRule({ keyId: rule.keyId })
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

        /**条件取值输入**/
        function renderValue(condition: Omix) {
            if (condition.field === 'country') {
                return (
                    <form-base-select
                        multiple
                        filterable
                        max-tag-count="responsive"
                        class="flex-1"
                        label-field="showName"
                        label-value="value"
                        placeholder="选择方向，可多选"
                        options={countryOptions.dataSource.value}
                        v-model:value={condition.value}
                    ></form-base-select>
                )
            }
            if (condition.field === 'type') {
                return (
                    <form-base-select
                        multiple
                        class="flex-1"
                        placeholder="选择短信类型，可多选"
                        options={chunkOptions.value.typeOptions}
                        v-model:value={condition.value}
                    ></form-base-select>
                )
            }
            return (
                <n-dynamic-tags class="flex-1 items-center" v-model:value={condition.value}>
                    {{
                        trigger: ({ activate }: Omix) => (
                            <n-button size="small" dashed onClick={activate}>
                                + 号码段（含区号，如 85291）
                            </n-button>
                        )
                    }}
                </n-dynamic-tags>
            )
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={960}
                show-footer={false}
                v-model:visible={dialog.visible}
                v-model:loading={dialog.loading}
                v-model:initialize={dialog.initialize}
                onCancel={() => setDialog({ visible: false })}
                onClose={() => emit('close', { done: setDialog })}
            >
                <n-spin show={loading.value}>
                    <div class="flex flex-col gap-12">
                        <div class="flex items-center justify-between gap-12">
                            <n-text depth="3">
                                短信满足任意一个启用的规则组即可进入该路由（或）；规则组内的条件需要全部满足（且）。没有启用的规则组时，路由不接收任何短信。
                            </n-text>
                            <common-base-authorize key-name="chat:nexus:sms:route:rule">
                                <common-base-button type="primary" onClick={fetchAppendRule}>
                                    新增规则组
                                </common-base-button>
                            </common-base-authorize>
                        </div>
                        {rules.value.length === 0 && <n-empty description="还没有规则组，路由不会接收任何短信"></n-empty>}
                        {rules.value.map((rule, index) => (
                            <n-card size="small" key={rule.keyId ?? `new-${index}`}>
                                {{
                                    header: () =>
                                        rule.editing ? (
                                            <div class="flex items-center gap-10">
                                                <n-text strong>规则组 #{index + 1}</n-text>
                                                <n-text depth="3" class="text-12">
                                                    排序
                                                </n-text>
                                                <n-input-number
                                                    size="small"
                                                    class="w-120!"
                                                    min={0}
                                                    max={9999}
                                                    precision={0}
                                                    v-model:value={rule.sort}
                                                ></n-input-number>
                                            </div>
                                        ) : (
                                            <div class="flex flex-col gap-4">
                                                <n-text strong>
                                                    规则组 #{index + 1}
                                                    <n-text depth="3" class="text-12">
                                                        {' '}
                                                        · 排序 {rule.sort}
                                                    </n-text>
                                                </n-text>
                                                <n-text depth="3" class="text-12">
                                                    {rule.description}
                                                </n-text>
                                            </div>
                                        ),
                                    'header-extra': () => (
                                        <common-base-authorize key-name="chat:nexus:sms:route:rule">
                                            <div class="flex items-center gap-10 ml-12">
                                                {rule.keyId && !rule.editing && (
                                                    <n-switch
                                                        size="small"
                                                        value={rule.status === 'enable'}
                                                        onUpdate:value={(value: boolean) => fetchStatus(rule, value)}
                                                    ></n-switch>
                                                )}
                                                {rule.editing ? (
                                                    <common-base-button text type="primary" onClick={() => fetchSave(rule)}>
                                                        保存
                                                    </common-base-button>
                                                ) : (
                                                    <common-base-button text type="info" onClick={() => (rule.editing = true)}>
                                                        编辑
                                                    </common-base-button>
                                                )}
                                                {rule.editing && rule.keyId && (
                                                    <common-base-button text onClick={fetchRefresh}>
                                                        取消
                                                    </common-base-button>
                                                )}
                                                <common-base-button text type="error" onClick={() => fetchDelete(rule, index)}>
                                                    删除
                                                </common-base-button>
                                            </div>
                                        </common-base-authorize>
                                    ),
                                    default: () =>
                                        rule.editing && (
                                            <div class="flex flex-col gap-10">
                                                {rule.conditions.map((condition, position) => (
                                                    <div class="flex items-center gap-10" key={position}>
                                                        <n-text depth="3" class="w-24 shrink-0 text-right">
                                                            {position === 0 ? '当' : '且'}
                                                        </n-text>
                                                        <form-base-select
                                                            class="w-120! shrink-0"
                                                            options={chunkOptions.value.ruleFieldOptions}
                                                            value={condition.field}
                                                            onUpdate:value={(value: string) => fetchFieldChange(condition, value)}
                                                        ></form-base-select>
                                                        <form-base-select
                                                            class="w-120! shrink-0"
                                                            options={operatorOptions(condition.field)}
                                                            v-model:value={condition.operator}
                                                        ></form-base-select>
                                                        {renderValue(condition)}
                                                        <common-base-button
                                                            text
                                                            type="error"
                                                            disabled={rule.conditions.length <= 1}
                                                            onClick={() => rule.conditions.splice(position, 1)}
                                                        >
                                                            移除
                                                        </common-base-button>
                                                    </div>
                                                ))}
                                                <div class="flex items-center gap-10">
                                                    <span class="w-24 shrink-0"></span>
                                                    <n-button size="small" dashed onClick={() => fetchAppendCondition(rule)}>
                                                        + 添加条件
                                                    </n-button>
                                                </div>
                                                <form-base-input
                                                    maxlength={512}
                                                    placeholder="备注（选填）"
                                                    v-model:value={rule.remark}
                                                ></form-base-input>
                                            </div>
                                        )
                                }}
                            </n-card>
                        ))}
                    </div>
                </n-spin>
            </common-dialog-provider>
        )
    }
})
</script>
