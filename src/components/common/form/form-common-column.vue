<script lang="tsx">
import { defineComponent, ref, Ref, reactive, inject, toRefs, onMounted, onUnmounted, nextTick, PropType } from 'vue'
import { FormInst, FormItemInst } from 'naive-ui'
import { useVModels } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
    name: 'FormCommonColumn',
    emits: ['update:value'],
    props: {
        /**字段值**/
        value: { type: [Number, String, Boolean, Object, Array] as PropType<any>, default: () => undefined }
    },
    setup(props, { emit, slots }) {
        const { value } = useVModels(props, emit)
        const initialValue = ref<any>(cloneDeep(props.value))
        const element = ref() as Ref<Omix<FormItemInst>>
        /**获取formRef实例**/
        const formRef = inject('FORM_COMMON_INSTANCE', ref({} as Omix<FormInst>))
        /**字段重置**/
        function restore() {
            value.value = initialValue.value ?? null
            return element.value?.restoreValidation()
        }

        /**实例上下文组合**/
        const context = reactive({ ...toRefs(props), restore })
        onUnmounted(() => formRef.value.remove(context))
        onMounted(async () => {
            return await nextTick().then(async () => {
                if (formRef.value.insert) {
                    return await formRef.value.insert(context)
                }
            })
        })

        return () => (
            <n-form-item ref={element} class="form-common-column">
                {slots.default && slots.default()}
            </n-form-item>
        )
    }
})
</script>
