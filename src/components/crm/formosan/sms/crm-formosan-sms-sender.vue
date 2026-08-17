<script lang="tsx">
import { defineComponent, Fragment, PropType, onMounted, ref, watch } from 'vue'
import { useVModels } from '@vueuse/core'
import { 
    httpSmsFormosanPublish,
    httpBaseCrmClientResolver
} from '@/api/instance.service'
import { fetchNotifyService } from '@/plugins'

export default defineComponent({
    name: 'CrmFormosanSmsSender',
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
        const clientInfo = ref<any>({})
        const mailContent = ref('')
        const loading = ref(false)

        // 当选中的客户变更或进入本步骤时，获取客户信息并初始化默认邮件模板
        watch(() => props.state.current, (newStep) => {
            if (newStep === 4) {
                fetchClientAndInitMail()
            }
        }, { immediate: true })

        async function fetchClientAndInitMail() {
            const f = formState.value
            if (!f.clientId) return
            try {
                const clientRes = await httpBaseCrmClientResolver({ keyId: f.clientId })
                clientInfo.value = clientRes.data || {}
                
                // 初始化默认邮件 HTML 模板
                const clientName = clientInfo.value.name || 'Customer'
                mailContent.value = `<p>Dear ${clientName},</p>\n<p>Please find the attached SMS pricing sheet for your application: <strong>${f.appId || ''}</strong>.</p>\n<p>If you have any questions, feel free to contact us.</p>\n<p>Best regards,</p>\n<p>Sales Team</p>`
            } catch (err: any) {
                fetchNotifyService({ type: 'error', title: '加载发送信息失败', message: err.message })
            }
        }

        // 发送报价
        async function handleSend() {
            const f = formState.value
            if (!f.clientId || !f.appId) return

            try {
                loading.value = true
                await httpSmsFormosanPublish({
                    clientId: f.clientId,
                    appId: f.appId,
                    mailContent: mailContent.value
                })
                fetchNotifyService({ type: 'success', title: '报价发布并发送成功！' })
                
                // 重置表单，返回第一步
                props.setForm({
                    clientId: undefined,
                    appId: undefined,
                    items: []
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
            const targetEmail = clientInfo.value.email || '未配置邮箱'

            return (
                <Fragment>
                    <common-element class="crm-formosan-sms-sender flex flex-col flex-1 p-14 overflow-y-auto">
                        <common-element is-white class="p-20 flex-1 flex flex-col b-rd-3 shadow-sm border border-gray-100 max-w-1000 mx-auto w-full">
                            <common-business-header bar title="发送报价邮件内容" class="m-be-16"></common-business-header>
                            
                            <common-element class="flex flex-col gap-14 flex-1">
                                <div class="text-13 text-gray-600 bg-indigo-50/50 p-12 b-rd-2 border border-indigo-100 flex flex-col gap-4">
                                    <div>收件客户：<span class="font-bold text-gray-800">{clientInfo.value.name || '-'} ({clientInfo.value.alias || '-'})</span></div>
                                    <div>收件邮箱：<span class="font-bold text-indigo-600">{targetEmail}</span></div>
                                    <div class="text-11 text-gray-400 m-ts-4">* 发送报价将同时生效该应用下所有新配费率，并将生成的报价 Excel 附件同步发送至客户邮箱。</div>
                                </div>

                                <form-common-column label="邮件正文 (HTML)" class="flex-1 flex flex-col">
                                    <n-input
                                        type="textarea"
                                        placeholder="请输入发送邮件正文内容..."
                                        value={mailContent.value}
                                        on-update:value={(val: string) => { mailContent.value = val }}
                                        rows={12}
                                        class="flex-1 text-13 font-mono"
                                    />
                                </form-common-column>
                            </common-element>
                        </common-element>
                    </common-element>
                    
                    <common-element is-white class="flex p-14 gap-x-14 justify-center items-center border-t border-gray-100 shadow-sm">
                        <n-button class="min-w-168 h-36 font-semibold" onClick={handlePrev}>
                            上一步：报价预览
                        </n-button>
                        <n-button 
                            class="min-w-168 h-36 font-semibold" 
                            type="primary" 
                            loading={loading.value}
                            onClick={handleSend}
                        >
                            发送报价
                        </n-button>
                    </common-element>
                </Fragment>
            )
        }
    }
})
</script>
