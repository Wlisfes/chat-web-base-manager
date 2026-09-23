<script lang="tsx">
import { defineComponent, nextTick } from 'vue'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'FormBaseCascader',
    emits: ['update:value', '-change:value'],
    props: {
        /**开启多选**/
        multiple: { type: Boolean, default: false },
        /**多选标签的最大显示数量**/
        maxTagCount: { type: String, default: 'responsive' },
        /**绑定数据**/
        value: { type: [Number, String, Array] },
        /**选项label的字段名**/
        labelField: { type: String, default: 'label' },
        /**选项value的字段名**/
        labelValue: { type: String, default: 'value' },
        /**选项children的字段名**/
        childrenField: { type: String, default: 'children' }
    },
    setup(props, { emit }) {
        const { value } = useVModels(props, emit)

        async function fetchUpdate(vague: string, e: Omix, p: any) {
            return await nextTick(() => (value.value = vague)).then(() => {
                return emit('-change:value', value.value, e, p)
            })
        }

        return () => (
            <n-cascader
                class={{ 'form-base-cascader': true, 'is-multiple': props.multiple }}
                multiple={props.multiple}
                max-tag-count={props.maxTagCount}
                label-field={props.labelField}
                value-field={props.labelValue}
                children-field={props.childrenField}
                v-model:value={value.value}
                on-update:value={fetchUpdate}
            ></n-cascader>
        )
    }
})
</script>

<style lang="scss" scoped>
.form-base-cascader.is-multiple {
    // 与 form-base-select 相同：保留 Naive 多选 tag / 聚焦输入框的 3px 成对间距，避免聚焦时 tag 上移。
    :deep(.n-base-selection-tags) {
        row-gap: 3px;
    }
}
</style>
