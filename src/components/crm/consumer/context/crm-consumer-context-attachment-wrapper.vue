<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CrmConsumerContextAttachmentWrapper',
    props: {},
    setup(props, { slots }) {
        return () => (
            <common-base-element is-white class="crm-consumer-context-attachment-wrapper">
                {Array.from({ length: 50 }, () => (
                    <n-h2>crm-consumer-context-attachment-wrapper</n-h2>
                ))}
            </common-base-element>
        )
    }
})
</script>
