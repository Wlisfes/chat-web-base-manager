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
        /**客户静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**注册来源字典枚举**/
        sourceOptions: { type: Array as PropType<Array<Omix>>, default: () => [] }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)

        return () => (
            <common-base-scrollbar
                element
                class="crm-consumer-context-basic-wrapper"
                element-props={{ isWhite: true, class: 'flex flex-col flex-1 p-14 overflow-hidden' }}
            >
                <div class="flex flex-col gap-y-10 overflow-hidden">
                    <common-business-header bar title="基本信息"></common-business-header>
                    <common-base-columns-template is-border class="gap-y-10 gap-x-20 p-10" type="auto-fit" number={400}>
                        <common-base-columns-wrapper label-class={props.labelClass} label="客户名称：">
                            {faseNode.value.name ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="品牌：">
                            <common-base-content value={faseNode.value.brandKeyIdOptions?.name}></common-base-content>
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
                            <common-base-user element="text" data={faseNode.value.ownerUserUidOptions}></common-base-user>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="归属部门：">
                            <common-base-content value={faseNode.value.ownerUserUidOptions?.organizations}></common-base-content>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="币种：">
                            {faseNode.value.currency ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="信用额度：">
                            {faseNode.value.credit ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="当前等级：">
                            {faseNode.value.level ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="当前阶段：">
                            <common-base-chunk value={faseNode.value.stage} items={props.chunkOptions.stageOptions}></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="客户类型：">
                            <common-base-chunk
                                value={faseNode.value.classType}
                                items={props.chunkOptions.classTypeOptions}
                            ></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="认证状态：">
                            <common-base-chunk
                                value={faseNode.value.authStatus}
                                items={props.chunkOptions.authStatusOptions}
                            ></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="注册来源：">
                            <common-base-chunk value={faseNode.value.source} items={props.sourceOptions}></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="付款模式：">
                            <common-base-chunk value={faseNode.value.payMode} items={props.chunkOptions.payModeOptions}></common-base-chunk>
                        </common-base-columns-wrapper>
                    </common-base-columns-template>
                </div>
            </common-base-scrollbar>
        )
    }
})
</script>
