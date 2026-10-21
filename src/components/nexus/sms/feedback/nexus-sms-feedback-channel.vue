<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackChannel',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作类型：CREATE 新增、UPDATE 编辑**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑的通道**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmChannelEnums(), { immediate: true })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), { immediate: true })
        /**负责人下拉**/
        const userOptions = useSelectService(() => Service.httpBaseSkylineSelectUser(), { immediate: true })
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            initialize: false,
            formState: {
                /**方向：仅新增可选**/
                countryKeyId: props.node.countryKeyId,
                /**通道类型：仅新增可选**/
                type: props.node.type,
                /**负责人：不选默认当前登录人**/
                ownerUserUid: props.node.ownerUserUid,
                /**端口发送间隔（毫秒）**/
                sendInterval: props.node.sendInterval ?? 3000,
                /**最大重试次数**/
                maxRetry: props.node.maxRetry ?? 3,
                /**备注**/
                remark: props.node.remark
            },
            rules: {
                countryKeyId: { required: true, type: 'number', message: '请选择方向', trigger: 'blur' },
                type: { required: true, message: '请选择通道类型', trigger: 'blur' },
                ownerUserUid: { required: ['UPDATE'].includes(props.command), message: '请选择负责人', trigger: 'blur' },
                sendInterval: { required: true, type: 'number', message: '请输入端口发送间隔', trigger: 'blur' },
                maxRetry: { required: true, type: 'number', message: '请输入最大重试次数', trigger: 'blur' }
            }
        })

        /**提交：别名由后端生成，方向和类型仅新增时提交**/
        async function fetchSubmit() {
            return await fetchValidater(['CREATE'].includes(props.command) ? [] : ['ownerUserUid', 'sendInterval', 'maxRetry']).then(
                async error => {
                    if (error) return await setState({ loading: false, disabled: false })
                    try {
                        const body = {
                            ownerUserUid: formState.value.ownerUserUid || undefined,
                            sendInterval: formState.value.sendInterval,
                            maxRetry: formState.value.maxRetry,
                            remark: formState.value.remark
                        }
                        if (['CREATE'].includes(props.command)) {
                            await Service.httpBaseSrmCreateChannel({
                                ...body,
                                countryKeyId: formState.value.countryKeyId,
                                type: formState.value.type
                            })
                        } else {
                            await Service.httpBaseSrmUpdateChannel({ ...body, keyId: props.node.keyId })
                        }
                        return await setState({ visible: false }).then(async () => {
                            await emit('submit', { done: setState })
                            return await fetchNotifyService({ title: '操作成功' })
                        })
                    } catch (err) {
                        return await setState({ loading: false, disabled: false }).then(async () => {
                            return await fetchNotifyService({ type: 'error', title: err.message })
                        })
                    }
                }
            )
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={520}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-base-container
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    {['UPDATE'].includes(props.command) && (
                        <form-base-column label="通道别名">
                            <form-base-input disabled value={props.node.alias}></form-base-input>
                        </form-base-column>
                    )}
                    <form-base-column label="方向" path="countryKeyId">
                        <form-base-select
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择方向，创建后不可修改"
                            disabled={['UPDATE'].includes(props.command)}
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="通道类型" path="type">
                        <form-base-select
                            placeholder="请选择通道类型，创建后不可修改"
                            disabled={['UPDATE'].includes(props.command)}
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </form-base-column>
                    {['CREATE'].includes(props.command) && (
                        <n-text depth="3" class="block mb-18 text-12">
                            别名自动生成：工号-方向MCC-类型-序号，例如 1024-460-MRKT-01
                        </n-text>
                    )}
                    <form-base-column label="负责人" path="ownerUserUid">
                        <form-base-select
                            filterable
                            clearable={['CREATE'].includes(props.command)}
                            label-value="uid"
                            label-field="showName"
                            placeholder={['CREATE'].includes(props.command) ? '不选默认当前登录人' : '请选择负责人'}
                            loading={userOptions.loading.value}
                            options={userOptions.dataSource.value}
                            v-model:value={formState.value.ownerUserUid}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="发送间隔" path="sendInterval">
                        <n-input-number class="w-full" min={0} max={600000} step={500} v-model:value={formState.value.sendInterval}>
                            {{ suffix: () => '毫秒' }}
                        </n-input-number>
                    </form-base-column>
                    <form-base-column label="最大重试" path="maxRetry">
                        <n-input-number class="w-full" min={0} max={20} v-model:value={formState.value.maxRetry}>
                            {{ suffix: () => '次' }}
                        </n-input-number>
                    </form-base-column>
                    <form-base-column label="备注" path="remark">
                        <form-base-input
                            type="textarea"
                            maxlength={512}
                            placeholder="请输入备注"
                            v-model:value={formState.value.remark}
                        ></form-base-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
