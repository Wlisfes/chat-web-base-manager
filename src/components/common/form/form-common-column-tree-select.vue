<script lang="tsx">
import { defineComponent, nextTick } from 'vue'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'FormCommonColumnTreeSelect',
    emits: ['update:value', '-change:value'],
    props: {
        /**绑定数据**/
        value: { type: [Number, String, Array] },
        /**选项label的字段名**/
        labelField: { type: String, default: 'name' },
        /**选项value的字段名**/
        keyField: { type: String, default: 'id' },
        /**选项children的字段名**/
        childrenField: { type: String, default: 'children' }
    },
    setup(props, { emit }) {
        const { value } = useVModels(props, emit)

        async function fetchUpdate(vague: string) {
            return await nextTick(() => (value.value = vague)).then(() => {
                return emit('-change:value', value.value)
            })
        }

        return () => (
            <n-tree-select
                class="form-common-column-tree-select"
                label-field={props.labelField}
                key-field={props.keyField}
                children-field={props.childrenField}
                v-model:value={value.value}
                on-update:value={fetchUpdate}
            ></n-tree-select>
        )
    }
})
</script>
