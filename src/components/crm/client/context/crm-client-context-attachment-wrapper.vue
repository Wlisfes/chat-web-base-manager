<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CrmClientContextAttachmentWrapper',
    props: {},
    setup(props, { slots }) {
        return () => (
            <common-element is-white class="crm-client-context-attachment-wrapper">
                {Array.from({ length: 50 }, () => (
                    <n-h2>crm-client-context-attachment-wrapper</n-h2>
                ))}
            </common-element>
        )
    }
})
</script>
