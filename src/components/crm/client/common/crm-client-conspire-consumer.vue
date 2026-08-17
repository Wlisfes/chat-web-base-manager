<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService } from '@/hooks'
import { stop, EventType } from '@/utils'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmClientConspireConsumer',
    props: {
        /**通讯实例**/
        observer: { type: Object as PropType<EventType>, required: true }
    },
    setup(props, ctx) {
        return () => <n-element class="crm-client-conspire-consumer h-full flex flex-col gap-14 overflow-hidden"></n-element>
    }
})
</script>
