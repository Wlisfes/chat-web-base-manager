<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'DeployChunkSrmManager',
    setup(props, ctx) {
        return () => (
            <layout-common-container>
                <deploy-chunk-container module="CHUNK_SRM"></deploy-chunk-container>
            </layout-common-container>
        )
    }
})
</script>
