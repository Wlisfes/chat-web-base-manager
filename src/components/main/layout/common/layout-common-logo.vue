<script lang="tsx">
import { defineComponent } from 'vue'
import { useConfiger, useStore } from '@/store'

export default defineComponent({
    name: 'LayoutCommonLogo',
    setup(props, ctx) {
        const { collapsed } = useStore(useConfiger)

        return () => (
            <router-link to="/manager" class={{ 'layout-common-logo p-inline-16': true, 'p-inline-11!': collapsed.value }}>
                <div class="h-full flex gap-8 items-center overflow-hidden transform-gpu">
                    <common-element-icon size={36} color="var(--primary-color)" name="nest-logo"></common-element-icon>
                    <common-element-icon size={30} color="var(--primary-color)" name="nest-logo-name"></common-element-icon>
                </div>
            </router-link>
        )
    }
})
</script>

<style lang="scss" scoped>
.layout-common-logo {
    position: relative;
    transition: padding 0.3s var(--n-bezier);
    display: flex;
    flex-direction: column;
    cursor: pointer;
}
</style>
