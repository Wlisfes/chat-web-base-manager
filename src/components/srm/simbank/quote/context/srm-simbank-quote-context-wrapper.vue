<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { useFormService, useSelectService, useChunkService, fetchCurrent } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSimbankQuoteContextWrapper',
    props: {
        /**页面路径快照注入**/
        router: { type: String, required: true }
    },
    setup(props, ctx) {
        const { formRef, formState, state, setState, setForm, fetchValidater } = useFormService({
            callback: fetchInitialization,
            options: { current: 1 },
            formState: {
                /**供应商ID**/
                userKeyId: undefined,
                /**simbank 设备主键**/
                simbankKeyId: undefined,
                /**simbank 别名**/
                simbankAlias: undefined,
                /**报价国家/地区主键**/
                countryKeyIds: [],
                /**报价草稿批次ID**/
                draftBatchId: undefined
            }
        })
        /**短信报价静态枚举**/
        const { chunkOptions, fetchChunkService } = useChunkService(e => Service.httpBaseSrmSimbankQuoteEnums(), {
            immediate: false
        })
        /**供应商下拉数据**/
        const userOptions = useSelectService(() => Service.httpBaseSrmSelectUser({}), {
            immediate: false,
            transform: data => data.map(item => ({ ...item, showName: `${item.alias} - ${item.name}` }))
        })
        /**simbank 下拉数据**/
        const simbankOptions = useSelectService(() => Service.httpBaseSrmSelectSimbank({ userKeyId: formState.value.userKeyId }), {
            transform: data => data.map(item => ({ ...item, showName: [item.alias, item.name].filter(Boolean).join(' - ') })),
            loading: false,
            immediate: false
        })
        /**MCC下拉数据**/
        const mccOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: false,
            transform: data => data.map(item => ({ value: item.keyId, label: `[${item.code}] ${item.cnName} - ${item.enName}` }))
        })
        /**当前供应商信息**/
        const faseNode = computed(() => {
            return fetchCurrent(userOptions.dataSource.value, (e: Omix) => e.keyId == formState.value.userKeyId)
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
                        <n-tab-pane name={1} tab="填写报价内容" display-directive="show:lazy">
                            <srm-simbank-quote-context-initialize
                                state={state}
                                fase-node={faseNode.value}
                                user-options={userOptions}
                                simbank-options={simbankOptions}
                                mcc-options={mccOptions}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></srm-simbank-quote-context-initialize>
                        </n-tab-pane>
                        <n-tab-pane name={2} tab="编辑报价" display-directive="show:lazy">
                            <srm-simbank-quote-context-update
                                state={state}
                                fase-node={faseNode.value}
                                user-options={userOptions}
                                simbank-options={simbankOptions}
                                mcc-options={mccOptions}
                                chunk-options={chunkOptions.value}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></srm-simbank-quote-context-update>
                        </n-tab-pane>
                        <n-tab-pane name={3} tab="报价预览" display-directive="show:lazy">
                            <srm-simbank-quote-context-preview
                                state={state}
                                fase-node={faseNode.value}
                                user-options={userOptions}
                                simbank-options={simbankOptions}
                                mcc-options={mccOptions}
                                chunk-options={chunkOptions.value}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></srm-simbank-quote-context-preview>
                        </n-tab-pane>
                        <n-tab-pane name={4} tab="发布报价" display-directive="show:lazy">
                            <srm-simbank-quote-context-publish
                                state={state}
                                router={props.router}
                                fase-node={faseNode.value}
                                set-state={setState}
                                set-form={setForm}
                                fetch-validater={fetchValidater}
                                v-model:formState={formState.value}
                            ></srm-simbank-quote-context-publish>
                        </n-tab-pane>
                    </n-tabs>
                </form-base-container>
            </layout-common-container>
        )
    }
})
</script>
