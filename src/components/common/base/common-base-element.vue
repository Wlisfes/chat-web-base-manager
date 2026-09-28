<script lang="tsx">
import { defineComponent, PropType, VNode } from 'vue'

export default defineComponent({
    name: 'CommonBaseElement',
    props: {
        /**开启背景色**/
        isWhite: { type: Boolean, default: false },
        /**是否开启空节点过滤、常用于权限根节点**/
        abstract: { type: Boolean, default: false },
        /**空节点内容**/
        empty: { type: [Number, String, Object] as PropType<string | number | VNode> }
    },
    setup(props, { slots }) {
        return () => {
            if (props.abstract) {
                const vnode = slots.default?.() ?? []
                return vnode.length === 0 ? (
                    props.empty
                ) : (
                    <n-element class={{ 'common-base-element': true, 'is-white': props.isWhite }}>{vnode}</n-element>
                )
            }
            return (
                <n-element class={{ 'common-base-element': true, 'is-white': props.isWhite }}>{slots.default && slots.default()}</n-element>
            )
        }
    }
})
</script>

<style lang="scss" scoped>
.common-base-element {
    box-sizing: border-box;
    transition:
        color 0.3s var(--n-bezier),
        border-color 0.3s var(--n-bezier),
        background-color 0.3s var(--n-bezier);
    &.is-white {
        background-color: var(--card-color);
    }
}
</style>
