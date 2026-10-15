<script lang="tsx">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    name: 'CommonBaseElementDouble',
    props: {
        /**嵌套eleement组件参数**/
        baseProps: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { slots }) {
        return () => (
            <common-base-element class="common-base-element-double">
                <common-base-element {...props.baseProps}>{slots.default && slots.default()}</common-base-element>
            </common-base-element>
        )
    }
})
</script>
