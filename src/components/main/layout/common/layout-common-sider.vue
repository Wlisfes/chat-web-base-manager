<script lang="tsx">
import { defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { useConfiger, useGlobal, useStore } from '@/store'
import { isEmpty } from '@/utils'

export default defineComponent({
    name: 'LayoutCommonSider',

    setup(props, ctx) {
        const router = useRouter()
        const configer = useConfiger()
        const { menuOptions } = useStore(useGlobal)

        async function fetchSelecter(path: string, data: Omix) {
            return await router.push({ path })
        }

        /**渲染图标**/
        function fetchIconRender(data: Omix) {
            return isEmpty(data.iconName) ? null : h(<common-element-icon name={data.iconName}></common-element-icon>)
        }

        return () => (
            <n-menu
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
