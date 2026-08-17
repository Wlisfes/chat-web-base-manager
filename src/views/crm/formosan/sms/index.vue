<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useFormService, useSelectService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmClientFormosanSms',
    setup(props, ctx) {
        const { formRef, formState, state, setState, setForm, fetchValidater } = useFormService({
            options: { current: 1 },
            formState: {
                /**客户ID**/
                clientId: undefined,
                /**应用ID**/
                appId: undefined,
                /**报价方向**/
                items: [] as Array<number>
            }
        })
        /**客户下拉数据**/
        const clientOptions = useSelectService(() => Service.httpBaseCrmClientSelect({}), {
            immediate: true,
            transform: data => data.map(item => ({ ...item, showName: `${item.alias} - ${item.name}` }))
        })
        /**应用下拉数据**/
        const appOptions = useSelectService(() => Service.httpBaseCrmClientSmsSelect({ clientId: formState.value.clientId }), {
            immediate: false
        })
        /**MCC下拉数据**/
        const mccOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: true,
            transform: data => data.map(item => ({ value: item.keyId, label: `[${item.code}] ${item.cnName} - ${item.enName}` }))
        })

        return () => (
            <layout-common-container>
                <common-element is-white class="flex justify-center p-inline-14 p-bs-10 p-be-16">
                    <common-business-steps-wrapper current={state.current} class="max-w-680">
                        <n-step class="items-center" title="填写报价内容" />
                        <n-step class="items-center" title="编辑报价" />
                        <n-step class="items-center" title="报价预览" />
                        <n-step class="items-center" title="发送报价" />
                    </common-business-steps-wrapper>
                </common-element>
                <form-common-container
                    class="flex flex-col flex-1 overflow-hidden"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <n-tabs
                        animated
                        type="line"
                        tabs-padding={14}
                        class="common-element-tabser inset-absolute inset-bar flex-1 overflow-hidden "
                        v-model:value={state.current}
                    >
                        <n-tab-pane name={1} tab="填写报价内容">
                            <crm-formosan-sms-initialize
                                state={state}
                                client-options={clientOptions}
                                app-options={appOptions}
                                mcc-options={mccOptions}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></crm-formosan-sms-initialize>
                        </n-tab-pane>
                        <n-tab-pane name={2} tab="编辑报价">
                            <crm-formosan-sms-update
                                state={state}
                                client-options={clientOptions}
                                app-options={appOptions}
                                mcc-options={mccOptions}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></crm-formosan-sms-update>
                        </n-tab-pane>
                        <n-tab-pane name={3} tab="报价预览">
                            <crm-formosan-sms-preview
                                state={state}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></crm-formosan-sms-preview>
                        </n-tab-pane>
                        <n-tab-pane name={4} tab="发送报价">
                            <crm-formosan-sms-sender
                                state={state}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></crm-formosan-sms-sender>
                        </n-tab-pane>
                    </n-tabs>
                </form-common-container>
            </layout-common-container>
        )
    }
})
</script>
