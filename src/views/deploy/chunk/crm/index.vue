<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'DeployChunkCrmManager',
    setup(props, ctx) {
        return () => (
            <layout-common-container>
                <deploy-chunk-container module="CHUNK_CRM"></deploy-chunk-container>
            </layout-common-container>
        )
    }
})
</script>
