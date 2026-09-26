<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'CrmConsumerContextBasicWrapper',
    emits: ['update:faseNode'],
    props: {
        /**字段描述样式**/
        labelClass: { type: String, default: 'w-70' },
        /**客户详情信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**枚举对象信息**/
        chunkState: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)

        return () => (
            <common-base-scrollbar class="crm-consumer-context-basic-wrapper">
                <common-base-element is-white class="flex flex-col flex-1 p-14 overflow-hidden">
                    <div class="flex flex-col overflow-hidden">
                        <common-business-header bar title="基本信息"></common-business-header>
                        <common-base-columns-template class="gap-y-10 gap-x-20 p-inline-10 p-block-10" type="auto-fit" number={400}>
                            <common-base-columns-wrapper label-class={props.labelClass} label="客户名称：">
                                {faseNode.value.name ?? '-'}
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="客户类型：">
                                <common-database-table-chunk
                                    element="content"
                                    value={faseNode.value.classType}
                                    // 本地静态枚举已废弃，待切换为后端枚举接口: options={props.chunkState.CHUNK_CONSUMER_CLASS}
                                ></common-database-table-chunk>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="品牌：">
                                {faseNode.value.brandOptions?.name ?? '-'}
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="邮箱：">
                                {faseNode.value.email ?? '-'}
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="电话号码：">
                                {faseNode.value.phone ?? '-'}
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="客户别名：">
                                {faseNode.value.alias ?? '-'}
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="归属人：">
                                <common-database-table-user
                                    element="text"
                                    data={faseNode.value.accountOptions}
                                ></common-database-table-user>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="归属部门：">
                                {faseNode.value.deptOptions?.deptName ?? '-'}
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="当前等级：">
                                {faseNode.value.level ?? '-'}
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="当前阶段：">
                                <common-database-table-chunk
                                    element="content"
                                    value={faseNode.value.stage}
                                    // 本地静态枚举已废弃，待切换为后端枚举接口: options={props.chunkState.CHUNK_CONSUMER_STAGE}
                                ></common-database-table-chunk>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="币种：">
                                {faseNode.value.currency ?? '-'}
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="认证状态：">
                                <common-database-table-chunk
                                    element="content"
                                    value={faseNode.value.authStatus}
                                    // 本地静态枚举已废弃，待切换为后端枚举接口: options={props.chunkState.CHUNK_CONSUMER_AUTH_STATUS}
                                ></common-database-table-chunk>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="注册来源：">
                                <common-database-table-chunk
                                    element="content"
                                    value={faseNode.value.source}
                                    // 本地静态枚举已废弃，待切换为后端枚举接口: options={props.chunkState.CHUNK_CONSUMER_SOURCE}
                                ></common-database-table-chunk>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="付款模式：">
                                <common-database-table-chunk
                                    element="content"
                                    value={faseNode.value.payMode}
                                    // 本地静态枚举已废弃，待切换为后端枚举接口: options={props.chunkState.CHUNK_CONSUMER_PAY_MODE}
                                ></common-database-table-chunk>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label-class={props.labelClass} label="信用额度：">
                                {faseNode.value.credit ?? '-'}
                            </common-base-columns-wrapper>
                        </common-base-columns-template>
                    </div>
                </common-base-element>
            </common-base-scrollbar>
        )
    }
})
</script>
