<script lang="tsx">
import { defineComponent, onMounted } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { createStripe } from '@/plugins'

export default defineComponent({
    name: 'LayoutCommonStripe',
    setup(props) {
        const element = useCurrentElement()

        onMounted(() => {
            createStripe(element.value)
        })
        return () => <div class="layout-common-stripe position-absolute left-0 top-0 right-0 bottom-0 overflow-hidden"></div>
    }
})
</script>
