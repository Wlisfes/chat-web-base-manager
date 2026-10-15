<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CrmConsumerContextBasicSkeleton',
    props: {
        /**骨架屏**/
        initialize: { type: Boolean, default: true }
    },
    setup(props, { slots }) {
        return () => (
            <common-skeleton-provider
                class-name="flex flex-col flex-1 overflow-hidden"
                loading={props.initialize}
                v-slots={{ render: slots.default }}
            >
                <common-base-element is-white is-border wrap="p-inline-14 p-bs-14" class-name="flex flex-col p-14 gap-y-10 overflow-hidden">
                    <n-skeleton sharp={false} height="24px" width="100px" />
                    <common-base-columns-template class="gap-y-10 gap-x-20" type="auto-fit" number={400}>
                        {Array.from({ length: 15 }, () => (
                            <common-base-columns-wrapper
                                label-class="w-70"
                                content-class="flex p-block-2"
                                label={<n-skeleton sharp={false} height="20px" width="60px" />}
                            >
                                <n-skeleton sharp={false} height="20px" width="85%" />
                            </common-base-columns-wrapper>
                        ))}
                    </common-base-columns-template>
                </common-base-element>
                <common-base-element is-white is-border wrap="p-inline-14 p-bs-14" class-name="flex flex-col p-14 gap-y-10 overflow-hidden">
                    <n-skeleton sharp={false} height="24px" width="100px" />
                    <common-base-columns-template class="gap-y-10 gap-x-20" type="auto-fit" number={400}>
                        {Array.from({ length: 15 }, () => (
                            <common-base-columns-wrapper
                                label-class="w-70"
                                content-class="flex p-block-2"
                                label={<n-skeleton sharp={false} height="20px" width="60px" />}
                            >
                                <n-skeleton sharp={false} height="20px" width="85%" />
                            </common-base-columns-wrapper>
                        ))}
                    </common-base-columns-template>
                </common-base-element>
            </common-skeleton-provider>
        )
    }
})
</script>
