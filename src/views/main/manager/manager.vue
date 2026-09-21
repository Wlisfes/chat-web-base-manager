<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BaseManager',
    setup() {
        return () => <layout-common-container class="absolute inset-0 flex-wrap"></layout-common-container>
    }
})
</script>
