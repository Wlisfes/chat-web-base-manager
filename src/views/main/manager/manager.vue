<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BaseManager',
    setup() {
        return () => (
            <layout-common-container class="absolute inset-0" class-name="flex-col overflow-hidden">
                <deploy-system-dept-orgchart></deploy-system-dept-orgchart>
            </layout-common-container>
        )
    }
})
</script>
