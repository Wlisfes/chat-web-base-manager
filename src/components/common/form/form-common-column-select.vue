<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'FormCommonColumnSelect',
    emits: ['-change:value'],
    props: {
        /**选项label的字段名**/
        labelField: { type: String, default: 'name' },
        /**选项value的字段名**/
        labelValue: { type: String, default: 'value' }
    },
    setup(props, { emit }) {
        return () => (
            <n-select
                class="form-common-column-select"
                label-field={props.labelField}
                value-field={props.labelValue}
                onUpdate:value={(...args: Array<any>) => emit('-change:value', ...args)}
            ></n-select>
        )
    }
})
</script>
