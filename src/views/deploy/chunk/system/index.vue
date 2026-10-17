<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'DeployChunkSystemManager',
    setup(props, ctx) {
        return () => (
            <layout-common-container>
                <deploy-chunk-container module="CHUNK_SKYLINE" key-name="chat:deploy:chunk:system"></deploy-chunk-container>
            </layout-common-container>
        )
    }
})
</script>
