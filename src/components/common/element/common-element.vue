<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CommonElement',
    props: {
        /**开启背景色**/
        isWhite: { type: Boolean, default: false }
    },
    setup(props, { slots }) {
        return () => <n-element class={{ 'common-element': true, 'is-white': props.isWhite }}>{slots.default && slots.default()}</n-element>
    }
})
</script>

<style lang="scss" scoped>
.common-element {
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
