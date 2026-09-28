<script lang="tsx">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobal, useStore } from '@/store'
import { BScroll } from '@/plugins'

export default defineComponent({
    name: 'LayoutCommonStore',
    setup(props, ctx) {
        const { tabOptions } = useStore(useGlobal)
        const global = useGlobal()
        const router = useRouter()
        const element = ref<HTMLElement>()

        async function fetchJumpRouter(data: Omix) {
            if (data.fullPath !== router.currentRoute.value.fullPath) {
                return await router.push({ path: data.fullPath })
            }
        }

        async function fetchCloseTab(e: Event, data: Omix) {
            e.stopPropagation()
            return await global.fetchRemoveRouter(data, router)
        }

        onMounted(fetchInitScrollbar)
        async function fetchInitScrollbar() {
            return new BScroll(element.value as HTMLElement, {
                probeType: 1,
                scrollX: true,
                scrollY: false,
                bounce: false,
                mouseWheel: true,
                observeDOM: true,
                scrollbar: { fade: true, interactive: true }
            })
        }

        return () => (
            <n-layout-header class="layout-common-store flex overflow-hidden">
                <div ref={element} class="element-wrapper flex-1 whitespace-nowrap p-be-8 cursor-pointer overflow-hidden">
                    <div class="inline-flex gap-x-8 element-bscrollbar">
                        {tabOptions.value.map(item => (
                            <div key={item.fullPath} class="select-none inline-flex element-block">
                                <common-base-button
                                    class={{ 'p-ie-2': item.meta.showClose ?? true }}
                                    secondary
                                    size="small"
                                    type={item.fullPath === router.currentRoute.value.fullPath ? 'primary' : undefined}
                                    onClick={() => fetchJumpRouter(item)}
                                >
                                    <span class="flex items-center overflow-hidden">
                                        {item.meta.title}
                                        {(item.meta.showClose ?? true) && (
                                            <div class="flex items-center p-7" onClick={(e: Event) => fetchCloseTab(e, item)}>
                                                <n-icon size={14}>
                                                    <common-base-icon size={14} name="nest-close"></common-base-icon>
                                                </n-icon>
                                            </div>
                                        )}
                                    </span>
                                </common-base-button>
                            </div>
                        ))}
                    </div>
                </div>
                <div class="flex gap-x-8 p-is-8 p-ie-12 p-be-8 overflow-hidden">
                    <common-base-button secondary size="small" class="p-inline-4!">
                        <common-base-icon size={20} name="nest-double-left"></common-base-icon>
                    </common-base-button>
                    <common-base-button secondary size="small" class="p-inline-4!">
                        <common-base-icon size={20} name="nest-double-right"></common-base-icon>
                    </common-base-button>
                    <common-base-button secondary size="small" class="p-inline-3!">
                        <common-base-icon size={22} name="nest-vertical-more"></common-base-icon>
                    </common-base-button>
                </div>
            </n-layout-header>
        )
    }
})
</script>

<style lang="scss" scoped>
.element-wrapper {
    position: relative;
    &:hover :deep(.bscroll-horizontal-scrollbar) {
        opacity: 1 !important;
    }
    &:hover :deep(.bscroll-horizontal-scrollbar .bscroll-indicator) {
        pointer-events: auto !important;
    }
    :deep(.bscroll-horizontal-scrollbar) {
        height: 6px !important;
        bottom: 1px !important;
        transition: opacity 500ms;
    }
    :deep(.bscroll-indicator) {
        background-color: var(--scrollbar-color) !important;
    }
}
</style>
