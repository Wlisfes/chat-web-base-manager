<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BaseManager',
    setup() {
        function onNodeClick(data: Record<string, any>) {
            console.log('node-click', data)
        }

        return () => (
            <layout-common-container class="absolute inset-0" class-name="flex-col overflow-hidden">
                {/* <main-manager-orgchart class="h-full min-h-0 w-full" /> */}
                <common-chart-dept-manager class="h-full min-h-0 w-full" onNodeClick={onNodeClick}></common-chart-dept-manager>
            </layout-common-container>
        )
    }
})
</script>
