<script lang="tsx">
import { defineComponent } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteContextWrapper',
    setup(props, ctx) {
        const { formRef, formState, state, setState, setForm, fetchValidater } = useFormService({
            options: { current: 1 },
            formState: {
                /**客户ID**/
                userKeyId: undefined,
                /**应用ID**/
                appId: undefined,
                /**报价国家/地区主键**/
                countryKeyIds: [] as Array<number>,
                /**报价草稿批次ID**/
                draftBatchId: undefined
            }
        })
        /**客户下拉数据**/
        const consumerOptions = useSelectService(() => Service.httpBaseCrmSelectUser({}), {
            immediate: true,
            transform: data => data.map(item => ({ ...item, showName: `${item.alias} - ${item.name}` }))
        })
        /**应用下拉数据**/
        const appOptions = useSelectService(() => Service.httpBaseCrmSelectSmsApp({ userKeyId: formState.value.userKeyId }), {
            immediate: false
        })
        /**MCC下拉数据**/
        const mccOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: true,
            transform: data => data.map(item => ({ value: item.keyId, label: `[${item.code}] ${item.cnName} - ${item.enName}` }))
        })

        return () => (
            <layout-common-container>
                <common-base-element is-white class="flex justify-center p-inline-14 p-bs-10 p-be-16">
                    <common-business-steps-wrapper current={state.current} class="max-w-680">
                        <n-step class="items-center" title="填写报价内容" />
                        <n-step class="items-center" title="编辑报价" />
                        <n-step class="items-center" title="报价预览" />
                        <n-step class="items-center" title="发布报价" />
                    </common-business-steps-wrapper>
                </common-base-element>
            </layout-common-container>
        )
    }
})
</script>
