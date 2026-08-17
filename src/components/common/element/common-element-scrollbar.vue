<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CommonElementScrollbar',
    props: {
        /**滚动容器类名**/
        className: { type: String, default: '' }
    },
    setup(props, { slots }) {
        return () => (
            <n-scrollbar
                class="common-element-scrollbar flex-1 overflow-hidden"
                content-class={`min-h-full flex flex-col ${props.className}`}
                trigger="none"
            >
                {slots.default && slots.default()}
            </n-scrollbar>
        )
    }
})
</script>
