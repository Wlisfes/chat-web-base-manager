<script lang="tsx">
import { defineComponent, h, nextTick, ref, watch } from 'vue'
import { useConfiger, useGlobal, useStore } from '@/store'
import { isEmpty, isNotEmpty } from '@/utils'
import { useRouter } from 'vue-router'

export default defineComponent({
    name: 'LayoutCommonSider',

    setup(props, ctx) {
        const menuRef = ref()
        const router = useRouter()
        const configer = useConfiger()
        const { menuOptions } = useStore(useGlobal)

        /**高亮菜单变化时展开其所在的父级菜单，保证从标签页或无菜单页面进入时左侧菜单同步展开**/
        watch(() => [configer.router, menuOptions.value], fetchWatchRouter, { immediate: true })
        async function fetchWatchRouter() {
            return await nextTick().then(() => {
                if (isNotEmpty(menuRef.value) && menuRef.value?.showOption) {
                    return menuRef.value.showOption(configer.router)
                }
            })
        }

        async function fetchSelecter(path: string, data: Omix) {
            return await router.push({ path })
        }

        /**渲染图标**/
        function fetchIconRender(data: Omix) {
            return isEmpty(data.iconName) ? null : h(<common-base-icon name={data.iconName}></common-base-icon>)
        }

        return () => (
            <n-menu
                ref={menuRef}
                class="layout-common-sider select-none"
                style={{ '--n-item-height': '36px' }}
                label-field="name"
                key-field="router"
                accordion
                root-indent={14}
                collapsed-width={64}
                value={configer.router}
                options={menuOptions.value}
                render-icon={fetchIconRender}
                on-update:value={fetchSelecter}
            ></n-menu>
        )
    }
})
</script>

<style lang="scss" scoped>
.layout-common-sider.n-menu {
    > :deep(.n-menu-item):first-child {
        margin-top: 0;
    }
}
</style>
