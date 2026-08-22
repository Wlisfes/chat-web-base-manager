<script lang="tsx">
import { defineComponent, Fragment, PropType, ref, watch } from 'vue'
import { useVModels } from '@vueuse/core'
import { httpBaseAccountResolverConsumer, httpBaseCrmPublishSmsQuote } from '@/api/instance.service'
import { fetchNotifyService } from '@/plugins'

export default defineComponent({
    name: 'CrmSmsQuotePublish',
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
        formState: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState } = useVModels(props, emit)
        const consumerInfo = ref<any>({})
        const loading = ref(false)

        /**进入发布步骤时加载客户信息。*/
        watch(() => props.state.current, (newStep) => {
            if (newStep === 4) {
                fetchConsumer()
            }
        }, { immediate: true })

        async function fetchConsumer() {
            const f = formState.value
            if (!f.consumerKeyId) return
            try {
                const consumerResponse = await httpBaseAccountResolverConsumer({ keyId: f.consumerKeyId })
                consumerInfo.value = consumerResponse.data || {}
            } catch (err: any) {
                fetchNotifyService({ type: 'error', title: '加载客户信息失败', message: err.message })
            }
        }

        /**发布报价。*/
        async function handlePublish() {
            const f = formState.value
            if (!f.draftBatchId) return

            try {
                loading.value = true
                await httpBaseCrmPublishSmsQuote({ draftBatchId: f.draftBatchId })
                fetchNotifyService({ type: 'success', title: '报价发布成功' })

                props.setForm({
                    consumerKeyId: undefined,
                    appId: undefined,
                    countryKeyIds: [],
                    draftBatchId: undefined
                })
                await props.setState({ current: 1 })
            } catch (err: any) {
                fetchNotifyService({ type: 'error', title: '发布报价失败', message: err.message })
            } finally {
                loading.value = false
            }
        }

        function handlePrev() {
            props.setState({ current: 3 })
        }

        return () => {
            const f = formState.value

            return (
                <Fragment>
                    <common-element class="crm-sms-quote-publish flex flex-col flex-1 p-14 overflow-y-auto">
                        <common-element is-white class="p-20 flex-1 flex flex-col b-rd-3 shadow-sm border border-gray-100 max-w-1000 mx-auto w-full">
                            <common-business-header bar title="发布报价确认" class="m-be-16"></common-business-header>

                            <common-element class="flex flex-col gap-14 flex-1">
                                <div class="text-13 text-gray-600 bg-indigo-50/50 p-12 b-rd-2 border border-indigo-100 flex flex-col gap-4">
                                    <div>报价客户：<span>{consumerInfo.value.name || '-'} ({consumerInfo.value.alias || '-'})</span></div>
                                    <div>报价应用：<span>{f.appId || '-'}</span></div>
                                    <div class="text-11 text-gray-400 m-ts-4">发布后将按设置的生效时间更新该应用的国家/地区短信报价。</div>
                                </div>
                                <n-alert type="info" title="本次操作仅发布报价数据，不发送邮件通知。" />
                            </common-element>
                        </common-element>
                    </common-element>
                    
                    <common-element is-white class="flex p-14 gap-x-14 justify-center items-center border-t border-gray-100 shadow-sm">
                        <n-button class="min-w-168 h-36" onClick={handlePrev}>
                            上一步：报价预览
                        </n-button>
                        <n-button
                            class="min-w-168 h-36"
                            type="primary"
                            loading={loading.value}
                            onClick={handlePublish}
                        >
                            确认发布
                        </n-button>
                    </common-element>
                </Fragment>
            )
        }
    }
})
</script>
