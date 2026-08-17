<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CrmClientContextWhatsappWrapper',
    props: {},
    setup(props, { slots }) {
        return () => (
            <common-element is-white class="crm-client-context-whatsapp-wrapper">
                {Array.from({ length: 50 }, () => (
                    <n-h2>crm-client-context-whatsapp-wrapper</n-h2>
                ))}
            </common-element>
        )
    }
})
</script>
