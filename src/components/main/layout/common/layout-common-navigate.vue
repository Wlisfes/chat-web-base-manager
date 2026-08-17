<script lang="tsx">
import { defineComponent } from 'vue'
import { useFullscreen } from '@vueuse/core'
import { useConfiger } from '@/store'

export default defineComponent({
    name: 'LayoutCommonNavigate',
    setup(props, ctx) {
        const configer = useConfiger()
        const { isFullscreen, toggle } = useFullscreen()

        return () => (
            <div class="flex flex-1 justify-end gap-16">
                <n-button text focusable={false}>
                    <common-element-icon size={22} name="nest-github"></common-element-icon>
                </n-button>
                <n-button text focusable={false} onClick={toggle}>
                    <common-element-icon size={22} name={isFullscreen.value ? 'nest-shrink' : 'nest-screen'}></common-element-icon>
                </n-button>
                <n-button text focusable={false} onClick={() => configer.fetchThemeUpdate()}>
                    <common-element-icon size={22} name={configer.theme === 'light' ? 'nest-light' : 'nest-dark'}></common-element-icon>
                </n-button>
                <n-button text focusable={false}>
                    <common-element-icon size={22} name="nest-notify"></common-element-icon>
                </n-button>
            </div>
        )
    }
})
</script>
