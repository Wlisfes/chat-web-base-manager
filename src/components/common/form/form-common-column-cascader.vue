<script lang="tsx">
import { defineComponent, nextTick } from 'vue'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'FormCommonColumnCascader',
    emits: ['update:value', '-change:value'],
    props: {
        /**开启多选**/
        multiple: { type: Boolean, default: false },
        /**多选标签的最大显示数量**/
        maxTagCount: { type: String, default: 'responsive' },
        /**绑定数据**/
        value: { type: [Number, String, Array] },
        /**选项label的字段名**/
        labelField: { type: String, default: 'name' },
        /**选项value的字段名**/
        labelValue: { type: String, default: 'keyId' },
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
                class={{ 'form-common-column-cascader': true, 'is-multiple': props.multiple }}
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
.form-common-column-cascader.is-multiple {
    :deep(.n-base-selection-tags) {
        padding-block-start: 0;
        height: 100%;
    }
    :deep(.n-base-selection-tags) {
        row-gap: 3px;
    }
    :deep(.n-base-selection-tag-wrapper) {
        padding-block-end: 0;
    }
}
</style>
