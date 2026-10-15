<script lang="tsx">
import { defineComponent } from 'vue'
import { Chat } from '@vicons/carbon'

export default defineComponent({
    name: 'CrmConsumerContextBasicSkeleton',
    props: {
        /**最大骨架屏数量**/
        max: { type: Number, default: 20 },
        /**骨架屏**/
        initialize: { type: Boolean, default: true }
    },
    setup(props, { slots }) {
        return () => (
            <common-skeleton-provider
                class-name="flex flex-col flex-1 p-12 gap-y-24 overflow-hidden"
                loading={props.initialize}
                v-slots={{ render: slots.default }}
            >
                <div class="flex flex-col gap-y-10 overflow-hidden">
                    <common-business-header bar title="基本信息"></common-business-header>
                </div>
            </common-skeleton-provider>
        )
    }
})
</script>
