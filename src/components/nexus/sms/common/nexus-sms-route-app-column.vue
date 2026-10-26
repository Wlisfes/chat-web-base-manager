<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'NexusSmsRouteAppColumn',
    emits: ['update:node', 'update:list'],
    props: {
        /**绑定应用item下标**/
        index: { type: Number, required: true },
        /**新增对象格式函数**/
        fetchAdapter: { type: Function, required: true },
        /**短信应用下拉列表**/
        appOptions: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定应用列表**/
        list: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定应用item对象数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { node, list } = useVModels(props, emit)
        /**其他行已选应用不可再选，当前行自己的选项保持可选。**/
        const options = computed(() => {
            const selected = new Set(
                (list.value ?? []).filter((item, index) => index !== props.index && item?.appKeyId).map(item => item.appKeyId)
            )
            return (props.appOptions ?? []).map(item => ({ ...item, disabled: selected.has(item.keyId) }))
        })
        function fetchAppRule(_rule: unknown, value: number) {
            if (!value) {
                return new Error('请选择要绑定的短信应用')
            }
            const duplicated = (list.value ?? []).some((item, index) => index !== props.index && item?.appKeyId === value)
            return duplicated ? new Error('不能重复选择相同短信应用') : true
        }

        return () => (
            <div class="nexus-sms-route-app-column w-full flex gap-x-14">
                <form-base-column
                    class="flex-1"
                    label="绑定应用"
                    show-label={props.index === 0}
                    path={`list[${props.index}].appKeyId`}
                    rule={{ required: true, type: 'number', trigger: 'blur', validator: fetchAppRule }}
                >
                    <form-base-select
                        clearable
                        filterable
                        label-field="label"
                        label-value="keyId"
                        placeholder="请选择要绑定的短信应用"
                        options={options.value}
                        v-model:value={node.value.appKeyId}
                        disabled={node.value.status === 'disable'}
                    ></form-base-select>
                </form-base-column>
                <form-base-column label="绑定状态" show-label={props.index === 0} path={`list[${props.index}].status`}>
                    <form-base-switch
                        round={false}
                        size="large"
                        checked-value="enable"
                        unchecked-value="disable"
                        v-model:value={node.value.status}
                    />
                    {props.index === 0 ? (
                        <common-base-button
                            class="p-inline-6 m-is-14"
                            title="新增"
                            secondary
                            type="primary"
                            icon-size={20}
                            icon="nest-plus"
                            onClick={() => list.value.push(props.fetchAdapter())}
                        ></common-base-button>
                    ) : (
                        <common-base-button
                            class="p-inline-6 m-is-14"
                            title="删除"
                            secondary
                            type="error"
                            icon-size={20}
                            icon="nest-minus"
                            onClick={() => list.value.splice(props.index, 1)}
                        ></common-base-button>
                    )}
                </form-base-column>
            </div>
        )
    }
})
</script>
