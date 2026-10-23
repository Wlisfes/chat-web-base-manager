<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'NexusSmsChannelPortColumn',
    emits: ['update:node', 'update:list'],
    props: {
        /**绑定端口item下标**/
        index: { type: Number, required: true },
        /**新增对象格式函数**/
        fetchAdapter: { type: Function, required: true },
        /**simbank端口列表**/
        simbankPortOptions: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定端口列表**/
        list: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定端口item对象数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) },
        /**枚举对象**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { node, list } = useVModels(props, emit)
        /**其他行已选端口不可再选，当前行自己的选项保持可选。**/
        const portOptions = computed(() => {
            const selected = new Set(
                (list.value ?? []).filter((item, index) => index !== props.index && item?.portKeyId).map(item => item.portKeyId)
            )
            return (props.simbankPortOptions ?? []).map(item => ({ ...item, disabled: selected.has(item.keyId) }))
        })
        function fetchPortRule(_rule: unknown, value: number) {
            if (!value) return new Error('请选择要绑定的端口')
            const duplicated = (list.value ?? []).some((item, index) => index !== props.index && item?.portKeyId === value)
            return duplicated ? new Error('不能重复选择相同端口') : true
        }

        return () => (
            <div class="nexus-sms-channel-port-column w-full flex gap-x-14">
                <form-base-column
                    class="flex-1"
                    label="绑定端口"
                    show-label={props.index === 0}
                    path={`list[${props.index}].portKeyId`}
                    rule={{ required: true, type: 'number', trigger: 'blur', validator: fetchPortRule }}
                >
                    <form-base-select
                        label-field="showName"
                        label-value="keyId"
                        placeholder="请选择要绑定的端口，可输入 SIM、IMEI、ICCID 搜索"
                        options={portOptions.value}
                        v-model:value={node.value.portKeyId}
                    ></form-base-select>
                </form-base-column>
                <form-base-column
                    class="w-240"
                    label="端口权重"
                    show-label={props.index === 0}
                    path={`list[${props.index}].weight`}
                    rule={{ required: true, type: 'number', message: '请输入端口权重', trigger: 'blur' }}
                >
                    <form-base-input-number
                        min={1}
                        max={100}
                        show-button={false}
                        placeholder="请输入端口权重"
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

<style lang="scss" scoped>
.nexus-sms-channel-port-column :deep(.n-input-number .n-input-wrapper) {
    --n-padding-right: 3px;
}
</style>
