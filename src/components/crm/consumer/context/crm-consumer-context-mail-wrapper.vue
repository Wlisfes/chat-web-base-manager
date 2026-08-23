<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CrmConsumerContextMailWrapper',
    props: {},
    setup(props, { slots }) {
        return () => (
            <common-element is-white class="crm-consumer-context-mail-wrapper">
                {Array.from({ length: 50 }, () => (
                    <n-h2>crm-consumer-context-mail-wrapper</n-h2>
                ))}
            </common-element>
        )
    }
})
</script>
