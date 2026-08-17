<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CommonElementAuthorize',
    props: {
        /**是否显示边框**/
        bordered: { type: Boolean, default: true },
        /**是否显示图标**/
        showIcon: { type: Boolean, default: false },
        /**是否可关闭**/
        closable: { type: Boolean, default: false }
    },
    setup(props, { slots }) {
        return () => (
            <n-alert class="common-element-alert-wrapper" closable={props.closable} bordered={props.bordered} show-icon={props.showIcon}>
                {slots.default && slots.default()}
            </n-alert>
        )
    }
})
</script>

<style lang="scss" scoped>
.common-element-alert-wrapper.n-alert {
    display: flex;
    flex-direction: column;
    :deep(.n-alert-body),
    :deep(.n-alert-body__content) {
        flex-direction: column;
        display: flex;
        flex: 1;
        padding: 0;
    }
    &.n-alert--closable :deep(.n-alert-body) {
        margin-right: calc(var(--n-close-size) + var(--n-padding));
    }
}
</style>
