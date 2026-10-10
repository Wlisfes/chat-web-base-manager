<script lang="tsx">
import { defineComponent, ref, Ref, reactive, inject, toRefs, onMounted, onUnmounted } from 'vue'
import { nextTick, computed, PropType, CSSProperties } from 'vue'
import { FormInst, FormItemInst } from 'naive-ui'
import { useVModels } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
    name: 'FormBaseColumn',
    emits: ['update:value'],
    props: {
        /**字段值**/
        value: { type: [Number, String, Boolean, Object, Array] as PropType<any>, default: () => undefined },
        /**占满一行**/
        full: { type: Boolean, default: false },
        /**占据栅格列数（如 2 表示占两列）**/
        span: { type: Number, default: undefined }
    },
    setup(props, { emit, slots }) {
        const { value } = useVModels(props, emit)
        const initialValue = ref<any>(cloneDeep(props.value))
        const element = ref() as Ref<Omix<FormItemInst>>
        /**获取formRef实例**/
        const formRef = inject('FORM_BASE_INSTANCE', ref({} as Omix<FormInst>))
        /**字段重置**/
        function restore() {
            value.value = initialValue.value ?? null
            return element.value?.restoreValidation()
        }

        /**父级栅格当前列数（auto-fit 布局随宽度变化）**/
        const gridColumns = ref(0)
        let observer: ResizeObserver | undefined
        function measureColumns() {
            const parent = (element.value as any)?.$el?.parentElement as HTMLElement | undefined
            if (!parent) return
            const template = getComputedStyle(parent).gridTemplateColumns
            gridColumns.value = template && template !== 'none' ? template.split(' ').filter(Boolean).length : 0
        }
        /**
         * 栅格占位
         * - full：占满整行
         * - span：占据指定列数；当前列数不足时占满整行，避免产生隐式列撑破布局
         */
        const columnStyle = computed<CSSProperties | undefined>(() => {
            if (props.full) {
                return { gridColumn: '1 / -1' }
            }
            if (!props.span || props.span <= 1) {
                return undefined
            }
            if (gridColumns.value && gridColumns.value <= props.span) {
                return { gridColumn: '1 / -1', minWidth: 0 }
            }
            return { gridColumn: `span ${props.span}`, minWidth: 0 }
        })
        onMounted(() => {
            if (!props.span || props.span <= 1) return
            nextTick(() => {
                measureColumns()
                const parent = (element.value as any)?.$el?.parentElement as HTMLElement | undefined
                if (parent && typeof ResizeObserver !== 'undefined') {
                    observer = new ResizeObserver(measureColumns)
                    observer.observe(parent)
                }
            })
        })
        onUnmounted(() => observer?.disconnect())

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
            <n-form-item ref={element} class={{ 'form-base-column': true, 'w-full': props.full }} style={columnStyle.value}>
                {slots.default && slots.default()}
            </n-form-item>
        )
    }
})
</script>
