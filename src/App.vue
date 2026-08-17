<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'App',
    setup(props) {
        return () => (
            <layout-common-provider global-style>
                <layout-common-mount>
                    <router-view />
                </layout-common-mount>
            </layout-common-provider>
        )
    }
})
</script>
