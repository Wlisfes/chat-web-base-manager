<script lang="tsx">
import { defineComponent, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
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
        const scroll = ref<InstanceType<typeof BScroll>>()
        const scrollState = ref({ prev: false, next: false })
        const current = computed(() => tabOptions.value.find(item => item.fullPath === router.currentRoute.value.fullPath))
        const closeOptions = computed(() => {
            const index = tabOptions.value.findIndex(item => item.fullPath === current.value?.fullPath)
            return [
                { key: 'left', label: '关闭左侧', disabled: !tabOptions.value.some((item, x) => x < index && global.fetchClosable(item)) },
                {
                    key: 'right',
                    label: '关闭右侧',
                    disabled: index === -1 || !tabOptions.value.some((item, x) => x > index && global.fetchClosable(item))
                },
                {
                    key: 'other',
                    label: '关闭其他',
                    disabled: !tabOptions.value.some((item, x) => x !== index && global.fetchClosable(item))
                },
                { key: 'all', label: '关闭全部', disabled: !tabOptions.value.some(item => global.fetchClosable(item)) }
            ]
        })

        async function fetchJumpRouter(data: Omix) {
            if (data.fullPath !== router.currentRoute.value.fullPath) {
                return await router.push({ path: data.fullPath })
            }
        }

        async function fetchCloseTab(e: Event, data: Omix) {
            e.stopPropagation()
            return await global.fetchRemoveRouter(data, router)
        }

        /**左右移动标签页**/
        function fetchMoveScroll(direction: 1 | -1) {
            const instance = scroll.value
            if (!instance) {
                return
            }
            instance.refresh()
            const width = (element.value?.clientWidth ?? 0) * 0.8
            const x = Math.min(0, Math.max(instance.maxScrollX, instance.x + direction * width))
            return instance.scrollTo(x, 0, 300)
        }

        /**更新左右移动按钮状态：内容未溢出或已到达边界时禁用**/
        function fetchUpdateScrollState() {
            const instance = scroll.value
            if (!instance) {
                return (scrollState.value = { prev: false, next: false })
            }
            return (scrollState.value = { prev: instance.x < -1, next: instance.x > instance.maxScrollX + 1 })
        }

        /**滚动到当前标签页**/
        async function fetchScrollCurrent() {
            await nextTick()
            const instance = scroll.value
            const node = element.value?.querySelector('.element-active') as HTMLElement | null
            if (!instance || !node) {
                return
            }
            instance.refresh()
            instance.scrollToElement(node, 300, true, false)
            return fetchUpdateScrollState()
        }

        /**批量关闭标签页**/
        async function fetchSelectClose(key: 'left' | 'right' | 'other' | 'all') {
            await global.fetchRemoveRouters(key, current.value ?? {}, router)
            return await fetchScrollCurrent()
        }

        watch(() => [router.currentRoute.value.fullPath, tabOptions.value.length], fetchScrollCurrent)
        onMounted(fetchInitScrollbar)
        onBeforeUnmount(() => scroll.value?.destroy())
        async function fetchInitScrollbar() {
            scroll.value = new BScroll(element.value as HTMLElement, {
                probeType: 1,
                scrollX: true,
                scrollY: false,
                bounce: false,
                mouseWheel: true,
                observeDOM: true,
                scrollbar: { fade: true, interactive: true }
            })
            scroll.value.on('scroll', fetchUpdateScrollState)
            scroll.value.on('scrollEnd', fetchUpdateScrollState)
            scroll.value.on('refresh', fetchUpdateScrollState)
            return await fetchScrollCurrent()
        }

        return () => (
            <n-layout-header class="layout-common-store flex overflow-hidden">
                <div ref={element} class="element-wrapper flex-1 whitespace-nowrap p-be-8 cursor-pointer overflow-hidden">
                    <div class="inline-flex gap-x-8 element-bscrollbar">
                        {tabOptions.value.map(item => (
                            <div
                                key={item.fullPath}
                                class={[
                                    'select-none inline-flex element-block',
                                    { 'element-active': item.fullPath === current.value?.fullPath }
                                ]}
                            >
                                <common-base-button
                                    class={{ 'p-ie-2': global.fetchClosable(item) }}
                                    secondary
                                    size="small"
                                    type={item.fullPath === router.currentRoute.value.fullPath ? 'primary' : undefined}
                                    onClick={() => fetchJumpRouter(item)}
                                >
                                    <span class="flex items-center overflow-hidden">
                                        {item.meta.title}
                                        {global.fetchClosable(item) && (
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
                    <common-base-button
                        secondary
                        size="small"
                        class="p-inline-4!"
                        //disabled={!scrollState.value.prev}
                        onClick={() => fetchMoveScroll(1)}
                    >
                        <common-base-icon size={20} name="nest-double-left"></common-base-icon>
                    </common-base-button>
                    <common-base-button
                        secondary
                        size="small"
                        class="p-inline-4!"
                        //disabled={!scrollState.value.next}
                        onClick={() => fetchMoveScroll(-1)}
                    >
                        <common-base-icon size={20} name="nest-double-right"></common-base-icon>
                    </common-base-button>
                    <n-dropdown
                        trigger="click"
                        placement="bottom-end"
                        options={closeOptions.value}
                        style={{ '--n-space': '10px', 'user-select': 'none' }}
                        onSelect={fetchSelectClose}
                    >
                        <common-base-button secondary size="small" class="p-inline-3!">
                            <common-base-icon size={22} name="nest-vertical-more"></common-base-icon>
                        </common-base-button>
                    </n-dropdown>
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
