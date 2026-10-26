<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useVModels } from '@vueuse/core'
import { useState } from '@/hooks'
import { Delete } from '@vicons/carbon'

export default defineComponent({
    name: 'NexusSmsRouteRuleColumn',
    emits: ['update:node', 'update:list'],
    props: {
        /**绑定规则item下标**/
        index: { type: Number, required: true },
        /**新增规则格式函数**/
        fetchAdapter: { type: Function, required: true },
        /**新增规则条件函数**/
        fetchConditionsAdapter: { type: Function, required: true },
        /**字典枚举**/
        chunkState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**规则枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**方向下拉**/
        countryOptions: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定规则列表**/
        list: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定规则item对象数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { node, list } = useVModels(props, emit)
        const { state, setState } = useState({
            options: []
        })

        /**字段可用的操作符：号码段用开头匹配，其余用属于**/
        function fetchOptionsOperator(field: string) {
            const allowed = field === 'prefix' ? ['prefix', 'not_prefix'] : ['in', 'not_in']
            return (props.chunkOptions.ruleOperatorOptions ?? []).filter((item: Omix) => {
                return allowed.includes(item.value)
            })
        }

        return () => (
            <common-base-element is-border class="nexus-sms-route-rule-column flex flex-col overflow-hidden">
                <div class="nexus-handle cursor-move flex items-center p-inline-12 p-block-12">
                    <div class="flex flex-1 gap-x-10 items-center overflow-hidden">
                        <n-text class="text-16 font-600">{`规则组 #${props.index + 1}`}</n-text>
                        <form-base-switch
                            size="medium"
                            checked-value="enable"
                            unchecked-value="disable"
                            v-model:value={node.value.status}
                        />
                    </div>
                    {props.index === 0 ? (
                        <div class="flex gap-x-10 items-center">
                            <common-base-button
                                {...{ secondary: true, size: 'small', content: '添加规则', type: 'primary' }}
                                disabled={node.value.status === 'disable'}
                                onClick={() => list.value.push(props.fetchAdapter())}
                            ></common-base-button>
                            <common-base-button
                                {...{ secondary: true, size: 'small', content: '添加条件', type: 'success' }}
                                disabled={node.value.status === 'disable' || node.value.conditions.length >= 3}
                                onClick={() => node.value.conditions.push(props.fetchConditionsAdapter())}
                            ></common-base-button>
                        </div>
                    ) : (
                        <div class="flex gap-x-10 items-center">
                            <common-base-button
                                {...{ secondary: true, size: 'small', content: '删除规则', type: 'error' }}
                                disabled={node.value.status === 'disable'}
                                onClick={() => list.value.splice(props.index, 1)}
                            ></common-base-button>
                            <common-base-button
                                {...{ secondary: true, size: 'small', content: '添加条件', type: 'success' }}
                                disabled={node.value.status === 'disable' || node.value.conditions.length >= 3}
                                onClick={() => node.value.conditions.push(props.fetchConditionsAdapter())}
                            ></common-base-button>
                        </div>
                    )}
                </div>
                {(node.value.conditions ?? []).map((item: Omix, position: number) => (
                    <div class="flex gap-x-10 p-inline-10 select-none overflow-hidden">
                        <form-base-column show-label={false}>{position === 0 ? '当' : '且'}</form-base-column>
                        <form-base-column
                            show-label={false}
                            path={`list[${props.index}].conditions[${position}].field`}
                            rule={{ required: true, trigger: 'blur', message: '请选择字段' }}
                        >
                            <form-base-select
                                class="w-120"
                                label-field="label"
                                label-value="value"
                                placeholder="请选择字段"
                                options={props.chunkOptions.ruleFieldOptions}
                                v-model:value={item.field}
                                disabled={node.value.status === 'disable'}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column
                            show-label={false}
                            path={`list[${props.index}].conditions[${position}].operator`}
                            rule={{ required: true, trigger: 'blur', message: '请选择条件' }}
                        >
                            <form-base-select
                                class="w-120"
                                label-field="label"
                                label-value="value"
                                placeholder="请选择条件"
                                options={fetchOptionsOperator(item.field)}
                                v-model:value={item.operator}
                                disabled={node.value.status === 'disable'}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column
                            class="flex-1"
                            show-label={false}
                            path={`list[${props.index}].conditions[${position}].value`}
                            rule={{ required: true, type: 'array', trigger: ['blur', 'change'], message: '请选择取值' }}
                        >
                            {item.field === 'country' ? (
                                <form-base-select
                                    multiple
                                    filterable
                                    label-field="showName"
                                    label-value="value"
                                    placeholder="选择方向，可多选"
                                    options={props.countryOptions}
                                    v-model:value={item.value}
                                ></form-base-select>
                            ) : item.field === 'type' ? (
                                <form-base-select
                                    multiple
                                    label-field="label"
                                    label-value="value"
                                    placeholder="选择短信类型，可多选"
                                    options={props.chunkOptions.typeOptions}
                                    v-model:value={item.value}
                                ></form-base-select>
                            ) : (
                                <form-base-select
                                    tag
                                    multiple
                                    filterable
                                    label-field="label"
                                    label-value="label"
                                    placeholder="选择或输入号段"
                                    options={state.options}
                                    v-model:value={item.value}
                                ></form-base-select>
                            )}
                            <common-base-button
                                class="p-inline-6 m-is-10"
                                disabled={node.value.status === 'disable' || node.value.conditions.length === 1}
                                {...{ secondary: true, title: '删除条件', type: 'pink', iconSize: 20, icon: Delete }}
                                onClick={() => node.value.conditions.splice(position, 1)}
                            ></common-base-button>
                        </form-base-column>
                    </div>
                ))}
                <form-base-column show-label={false} show-feedback={false} class="p-inline-10 p-be-10">
                    <form-base-input
                        maxlength={512}
                        placeholder="请输入备注"
                        disabled={node.value.status === 'disable'}
                        v-model:value={node.value.remark}
                    ></form-base-input>
                </form-base-column>
            </common-base-element>
        )
    }
})
</script>
