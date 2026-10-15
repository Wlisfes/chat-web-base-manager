<script lang="tsx">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    name: 'CrmConsumerContextBasicSkeleton',
    props: {
        /**骨架屏**/
        initialize: { type: Boolean, default: true }
    },
    setup(props, { slots }) {
        const columns = ref([
            { title: '序号', key: 'index', width: 90, align: 'center' },
            { title: '联系人名称', key: 'name', width: 200 },
            { title: '联系方式', key: 'items', width: 300, ellipsis: false },
            { title: '地址', key: 'address', minWidth: 300 },
            { title: '备注', key: 'remark', minWidth: 260, check: false },
            { title: '状态', key: 'status', width: 120 },
            { title: '创建人', key: 'createBy', width: 120 },
            { title: '创建时间', key: 'createTime', width: 160 },
            { title: '更新人', key: 'modifyBy', width: 120 },
            { title: '更新时间', key: 'modifyTime', width: 160 }
        ])

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
                <common-base-element is-white is-border wrap="p-inline-14 p-bs-14" class-name="flex flex-col p-14 gap-y-10">
                    <n-skeleton sharp={false} height="24px" width="100px" />
                    <common-database-table
                        limit={0}
                        initialize
                        loading={false}
                        bordered={false}
                        pagination={false}
                        flex-height={false}
                        columns={columns.value}
                    />
                </common-base-element>
            </common-skeleton-provider>
        )
    }
})
</script>
