<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'NexusSmsRouteChannelColumn',
    emits: ['update:node', 'update:list'],
    props: {
        /**绑定通道item下标**/
        index: { type: Number, required: true },
        /**新增对象格式函数**/
        fetchAdapter: { type: Function, required: true },
        /**通道下拉列表**/
        channelOptions: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定通道列表**/
        list: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定通道item对象数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { node, list } = useVModels(props, emit)
        /**其他行已选通道不可再选，当前行自己的选项保持可选。**/
        const options = computed(() => {
            const selected = new Set(
                (list.value ?? []).filter((item, index) => index !== props.index && item?.channelKeyId).map(item => item.channelKeyId)
            )
            return (props.channelOptions ?? []).map(item => ({ ...item, disabled: selected.has(item.keyId) }))
        })
        function fetchChannelRule(_rule: unknown, value: number) {
            if (!value) {
                return new Error('请选择要绑定的通道')
            }
            const duplicated = (list.value ?? []).some((item, index) => index !== props.index && item?.channelKeyId === value)
            return duplicated ? new Error('不能重复选择相同通道') : true
        }

        return () => (
            <div class="nexus-sms-route-channel-column w-full flex gap-x-14">
                <form-base-column
                    class="flex-1"
                    label="绑定通道"
                    show-label={props.index === 0}
                    path={`list[${props.index}].channelKeyId`}
                    rule={{ required: true, type: 'number', trigger: 'blur', validator: fetchChannelRule }}
                >
                    <form-base-select
                        label-field="alias"
                        label-value="keyId"
                        placeholder="请选择要绑定的通道"
                        options={options.value}
                        v-model:value={node.value.channelKeyId}
                        disabled={node.value.status === 'disable'}
                    ></form-base-select>
                </form-base-column>
                <form-base-column
                    class="w-180"
                    label="通道优先级"
                    show-label={props.index === 0}
                    path={`list[${props.index}].priority`}
                    rule={{ required: true, type: 'number', message: '请输入通道优先级', trigger: 'blur' }}
                >
                    <form-base-input-number
                        min={1}
                        max={9}
                        placeholder="请输入通道优先级"
                        v-model:value={node.value.priority}
                        disabled={node.value.status === 'disable'}
                    ></form-base-input-number>
                </form-base-column>
                <form-base-column
                    class="w-240"
                    label="通道权重"
                    show-label={props.index === 0}
                    path={`list[${props.index}].weight`}
                    rule={{ required: true, type: 'number', message: '请输入通道权重', trigger: 'blur' }}
                >
                    <form-base-input-number
                        min={1}
                        max={100}
                        show-button={false}
                        placeholder="请输入通道权重"
                        v-model:value={node.value.weight}
                        disabled={node.value.status === 'disable'}
                        suffix={
                            <form-base-switch
                                round={false}
                                size="large"
                                checked-value="enable"
                                unchecked-value="disable"
                                v-model:value={node.value.status}
                            />
                        }
                    ></form-base-input-number>
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
