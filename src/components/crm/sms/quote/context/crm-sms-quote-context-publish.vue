<script lang="tsx">
import { defineComponent, Fragment, PropType } from 'vue'
import { fetchNotifyService } from '@/plugins'
import { useVModels } from '@vueuse/core'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteContextPublish',
    emits: ['update:formState'],
    props: {
        /**表单基础状态**/
        state: { type: Object as PropType<Omix>, default: () => ({}) },
        /**设置表单基础状态方法**/
        setState: { type: Function, required: true },
        /**表单更新方法**/
        setForm: { type: Function, required: true },
        /**验证表单方法**/
        fetchValidater: { type: Function, required: true },
        /**表单对象**/
        formState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**当前客户信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState } = useVModels(props, emit)

        /**确认发布**/
        async function fetchSubmit() {
            return await props.fetchValidater().then(async (error: boolean) => {
                if (error) {
                    return await props.setState({ loading: false, disabled: false })
                }
                try {
                    return await Service.httpBaseCrmPublishSmsQuote({ draftBatchId: formState.value.draftBatchId }).then(async () => {
                        return fetchNotifyService({ type: 'success', title: '报价发布成功' })
                    })
                } catch (err) {
                    return await props.setState({ loading: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        return () => {
            return (
                <Fragment>
                    <common-base-element
                        is-white
                        is-border
                        wrap="p-inline-14 p-bs-14"
                        class-name="flex flex-col p-14 gap-y-10 overflow-hidden"
                    >
                        <common-business-header bar title="基本信息"></common-business-header>
                        <common-base-columns-template class="gap-x-10 gap-y-5" type="auto-fill" number={240}>
                            <common-base-columns-wrapper label="客户名称：">
                                <common-skeleton-block initialize={props.state.initialize}>
                                    {props.faseNode.name ?? '-'}
                                </common-skeleton-block>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label="客户别名：">
                                <common-skeleton-block initialize={props.state.initialize}>
                                    {props.faseNode.alias ?? '-'}
                                </common-skeleton-block>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label="应用别名：">
                                <common-skeleton-block initialize={props.state.initialize}>
                                    {formState.value.appAlias ?? '-'}
                                </common-skeleton-block>
                            </common-base-columns-wrapper>
                            <common-base-columns-wrapper label="报价币种：">
                                <common-skeleton-block initialize={props.state.initialize}>
                                    {props.faseNode.currency ?? '-'}
                                </common-skeleton-block>
                            </common-base-columns-wrapper>
                        </common-base-columns-template>
                    </common-base-element>
                    <common-base-element class="flex flex-col flex-1 p-14 overflow-hidden"></common-base-element>
                    <common-base-element is-white class="flex p-14 gap-x-14 justify-center items-center border-t border-gray-100 shadow-sm">
                        <common-skeleton-block initialize={props.state.initialize}>
                            <n-button class="min-w-160" disabled={props.state.loading} onClick={() => props.setState({ current: 2 })}>
                                上一步：报价预览
                            </n-button>
                        </common-skeleton-block>
                        <common-skeleton-block initialize={props.state.initialize}>
                            <n-button
                                class="min-w-160"
                                type="primary"
                                loading={props.state.loading}
                                disabled={props.state.loading}
                                onClick={fetchSubmit}
                            >
                                确认发布
                            </n-button>
                        </common-skeleton-block>
                    </common-base-element>
                </Fragment>
            )
        }
    }
})
</script>
