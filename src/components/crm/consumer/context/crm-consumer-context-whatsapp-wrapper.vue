<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CrmConsumerContextWhatsappWrapper',
    props: {},
    setup(props, { slots }) {
        return () => (
            <common-element is-white class="crm-consumer-context-whatsapp-wrapper">
                {Array.from({ length: 50 }, () => (
                    <n-h2>crm-consumer-context-whatsapp-wrapper</n-h2>
                ))}
            </common-element>
        )
    }
})
</script>
