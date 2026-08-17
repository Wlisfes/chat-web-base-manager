<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CommonBusinessStepsWrapper',
    setup(props, { slots }) {
        return () => (
            <n-steps
                class={{ 'common-business-steps-wrapper': true, 'is-bar': (slots.default?.() ?? []).length > 1 }}
                content-placement="bottom"
            >
                {slots.default && slots.default()}
            </n-steps>
        )
    }
})
</script>
<style lang="scss" scoped>
.common-business-steps-wrapper {
    position: relative;
    :deep(.n-step-line) {
        z-index: 2;
        .n-step-indicator {
            --n-indicator-color: var(--divider-color);
        }
        .n-step-splitor {
            display: none;
        }
    }
    :deep(.n-step) {
        position: relative;
        --n-step-header-font-weight: 500;
        --n-indicator-text-color: var(--text-color-1);
        --n-indicator-border-color: var(--divider-color);
        &.n-step--finish-status {
            .n-step-indicator {
                --n-indicator-text-color: var(--base-color);
                background-color: var(--primary-color);
            }
            .n-step-content-header {
                --n-header-text-color: var(--text-color-1);
            }
        }
        &.n-step--process-status .n-step-indicator {
            --n-indicator-text-color: var(--base-color);
            background-color: var(--primary-color);
        }
    }
    &.is-bar :deep(.n-step) {
        &:first-child::before {
            content: '';
            position: absolute;
            height: 2px;
            top: 13px;
            right: 0;
            width: calc(50% - 20px);
            z-index: 1;
            background-color: var(--border-color);
            transition: background-color 0.3s var(--n-bezier);
        }
        &:last-child:before {
            content: '';
            position: absolute;
            height: 2px;
            top: 13px;
            left: 0;
            width: calc(50% - 20px);
            z-index: 1;
            background-color: var(--border-color);
            transition: background-color 0.3s var(--n-bezier);
        }
        &:not(:first-child):not(:last-child)::before {
            content: '';
            position: absolute;
            height: 2px;
            top: 13px;
            left: 0;
            width: calc(50% - 20px);
            z-index: 1;
            background-color: var(--border-color);
            transition: background-color 0.3s var(--n-bezier);
        }
        &:not(:first-child):not(:last-child)::after {
            content: '';
            position: absolute;
            height: 2px;
            top: 13px;
            right: 0;
            width: calc(50% - 20px);
            z-index: 1;
            background-color: var(--border-color);
            transition: background-color 0.3s var(--n-bezier);
        }
    }
}
</style>
