<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CrmClientContextMailWrapper',
    props: {},
    setup(props, { slots }) {
        return () => (
            <common-element is-white class="crm-client-context-mail-wrapper">
                {Array.from({ length: 50 }, () => (
                    <n-h2>crm-client-context-mail-wrapper</n-h2>
                ))}
            </common-element>
        )
    }
})
</script>
