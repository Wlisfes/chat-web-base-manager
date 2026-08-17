<script lang="tsx">
import { defineComponent, PropType, VNode } from 'vue'

export default defineComponent({
    name: 'CommonBusinessHeader',
    props: {
        /**标题**/
        title: { type: [String, Number, Object] as PropType<string | number | VNode> },
        /**是否显示加粗条**/
        bar: { type: Boolean, default: false }
    },
    setup(props, { slots }) {
        return () => (
            <common-element class={{ 'common-business-header': true, 'is-bar': props.bar }}>
                {slots.default ? slots.default() : props.title}
            </common-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.common-business-header {
    position: relative;
    overflow: hidden;
    font-size: 16px;
    line-height: 24px;
    color: var(--text-color-1);
    padding-inline-start: 10px;
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 2px;
        bottom: 2px;
        width: 3px;
        border-radius: 2px;
        transition: background-color 0.3s var(--n-bezier);
        background-color: var(--placeholder-color-disabled);
    }
}
</style>
