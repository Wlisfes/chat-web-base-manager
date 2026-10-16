<script lang="tsx">
import { defineComponent } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteContextWrapper',
    setup(props, ctx) {
        const { formRef, formState, state, setState, setForm, fetchValidater } = useFormService({
            callback: fetchInitialization,
            options: { current: 2 },
            formState: {
                /**客户ID**/
                userKeyId: 10241010,
                /**应用ID**/
                appId: `wFBLI3u78MuNNSmT`,
                /**应用别名**/
                appAlias: undefined,
                /**报价国家/地区主键**/
                countryKeyIds: [1136, 1133, 1134, 1135, 1130, 1131, 1132, 1127, 1128, 1129],
                /**报价草稿批次ID**/
                draftBatchId: `5a9379d4-2db4-4288-978e-52f012459154`
            }
        })
        /**短信报价静态枚举**/
        const { chunkOptions, fetchChunkService } = useChunkService(e => Service.httpBaseCrmSmsQuoteEnums(), {
            immediate: false
        })
        /**客户下拉数据**/
        const userOptions = useSelectService(() => Service.httpBaseCrmSelectUser({}), {
            immediate: false,
            transform: data => data.map(item => ({ ...item, showName: `${item.alias} - ${item.name}` }))
        })
        /**应用下拉数据**/
        const appOptions = useSelectService(() => Service.httpBaseCrmSelectSmsApp({ userKeyId: formState.value.userKeyId }), {
            loading: false,
            immediate: false
        })
        /**MCC下拉数据**/
        const mccOptions = useSelectService(() => Service.httpBaseFinanceSelectCountry(), {
            immediate: false,
            transform: data => data.map(item => ({ value: item.keyId, label: `[${item.code}] ${item.cnName} - ${item.enName}` }))
        })
        /**数据初始化**/
        async function fetchInitialization() {
            return await Promise.all([fetchChunkService(), userOptions.fetchRequest(), mccOptions.fetchRequest()]).then(async () => {
                return await setState({ initialize: false, loading: false })
            })
        }

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
                <form-base-container
                    class="flex flex-col flex-1 relative overflow-hidden"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <n-tabs
                        animated
                        type="line"
                        tabs-padding={14}
                        class="common-base-tabser inset-absolute inset-bar flex-1 overflow-hidden "
                        v-model:value={state.current}
                    >
                        <n-tab-pane name={1} tab="填写报价内容">
                            <crm-sms-quote-context-initialize
                                state={state}
                                user-options={userOptions}
                                app-options={appOptions}
                                mcc-options={mccOptions}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></crm-sms-quote-context-initialize>
                        </n-tab-pane>
                        <n-tab-pane name={2} tab="编辑报价">
                            <crm-sms-quote-context-update
                                state={state}
                                user-options={userOptions}
                                app-options={appOptions}
                                mcc-options={mccOptions}
                                chunk-options={chunkOptions.value}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></crm-sms-quote-context-update>
                        </n-tab-pane>
                        <n-tab-pane name={3} tab="报价预览">
                            <crm-sms-quote-context-preview
                                state={state}
                                user-options={userOptions}
                                app-options={appOptions}
                                mcc-options={mccOptions}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></crm-sms-quote-context-preview>
                        </n-tab-pane>
                        <n-tab-pane name={4} tab="发布报价">
                            <crm-sms-quote-context-publish
                                state={state}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></crm-sms-quote-context-publish>
                        </n-tab-pane>
                    </n-tabs>
                </form-base-container>
            </layout-common-container>
        )
    }
})
</script>
