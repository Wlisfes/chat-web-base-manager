<script lang="tsx">
import { defineComponent, computed, PropType } from 'vue'
import { v4, fetchCurrent, isEmpty, isEmail } from '@/utils'
import { useVModels } from '@vueuse/core'
import { FormItemRule } from 'naive-ui'

export default defineComponent({
    name: 'CommonBusinessContactBlock',
    emits: ['update:list', 'update:node'],
    props: {
        /**数组下标**/
        index: { type: Number, required: true },
        /**联系方式枚举**/
        options: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**联系方式列表**/
        list: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**联系方式节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props) {
        const { node, list } = useVModels(props)
        /**联系方式占位符**/
        const placeholder = computed(() => {
            const item = fetchCurrent(props.options, e => e.value == node.value.type)
            return isEmpty(item.value) ? `请输入联系方式` : `请输入${item.label}`
        })

        /**自定义验证**/
        async function fetchContactValidator(rule: FormItemRule, value: string) {
            return await new Promise<void>((resolve, reject) => {
                if (isEmpty(value)) {
                    return reject(new Error(placeholder.value))
                } else if (['1024188'].includes(String(node.value.type)) && !isEmail(String(value).trim())) {
                    return reject(new Error('邮箱格式不正确，请重新输入'))
                }
                return resolve()
            })
        }

        return () => (
            <div class="common-business-contact-block flex gap-x-10">
                <form-base-column
                    show-label={false}
                    path={`items[${props.index}].type`}
                    rule={{ required: true, message: '请选择联系方式', trigger: 'blur' }}
                >
                    <form-base-select
                        class="w-160"
                        placeholder="请选择联系方式"
                        label-field="label"
                        label-value="value"
                        options={props.options}
                        disabled={node.value.disabled}
                        v-model:value={node.value.type}
                    ></form-base-select>
                </form-base-column>
                <form-base-column
                    show-label={false}
                    class="flex-1"
                    path={`items[${props.index}].value`}
                    rule={{ required: true, trigger: 'blur', validator: fetchContactValidator }}
                >
                    <form-base-input
                        class="flex-1"
                        maxlength={128}
                        placeholder={placeholder.value}
                        v-model:value={node.value.value}
                    ></form-base-input>
                    {props.index === 0 ? (
                        <common-base-button
                            class="p-inline-6 m-is-10"
                            title="新增"
                            secondary
                            type="primary"
                            icon-size={20}
                            icon="nest-plus"
                            onClick={() => list.value.push({ keyId: v4(), type: undefined, value: undefined })}
                        ></common-base-button>
                    ) : (
                        <common-base-button
                            class="p-inline-6 m-is-10"
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
