<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'LayoutCommonContainer',
    props: {
        /**根节点样式**/
        className: { type: String, default: 'flex-col' },
        /**是否使用滚动容器**/
        scrollbar: { type: Boolean, default: false },
        /**滚动容器样式**/
        scrollbarProps: { type: Object, default: () => ({}) }
    },
    setup(props, { slots }) {
        return () => (
            <n-element class={`layout-common-container flex flex-1 overflow-hidden ${props.className}`}>
                {props.scrollbar ? (
                    <n-scrollbar trigger="none" class="flex-1 overflow-hidden" {...props.scrollbarProps}>
                        {slots.default && slots.default()}
                    </n-scrollbar>
                ) : (
                    slots.default && slots.default()
                )}
            </n-element>
        )
    }
})
</script>
