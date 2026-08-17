<script lang="tsx">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfiger, useGlobal, useStore } from '@/store'
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
                scrollbar: true
            })
        }

        return () => (
            <n-layout-header class="layout-common-store flex gap-10 overflow-hidden p-inline-12 p-be-8">
                <div ref={element} class="flex-1 whitespace-nowrap overflow-hidden relative  cursor-pointer">
                    <div class="inline-flex gap-10 element-bscrollbar">
                        {tabOptions.value.map(item => (
                            <div key={item.fullPath} class="select-none inline-flex element-block">
                                <common-element-button
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
                                                    <common-element-icon size={14} name="nest-close"></common-element-icon>
                                                </n-icon>
                                            </div>
                                        )}
                                    </span>
                                </common-element-button>
                            </div>
                        ))}
                    </div>
                </div>
                <div class="flex gap-10">
                    <common-element-button secondary size="small" class="p-inline-4!">
                        <common-element-icon size={20} name="nest-double-left"></common-element-icon>
                    </common-element-button>
                    <common-element-button secondary size="small" class="p-inline-4!">
                        <common-element-icon size={20} name="nest-double-right"></common-element-icon>
                    </common-element-button>
                    <common-element-button secondary size="small" class="p-inline-3!">
                        <common-element-icon size={22} name="nest-vertical-more"></common-element-icon>
                    </common-element-button>
                </div>
            </n-layout-header>
        )
    }
})
</script>
