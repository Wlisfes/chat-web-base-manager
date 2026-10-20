<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { isMACAddress, isEmpty } from 'class-validator'
import { useFormService, useChunkService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSimbankFeedbackManager',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作类型：CREATE 新增、UPDATE 编辑**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑的设备信息**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**设备静态枚举、设备型号字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSrmSimbankEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_SRM_SIMBANK_MODEL'],
            immediate: true
        })
        /**归属供应商下拉**/
        const userOptions = useSelectService(e => Service.httpBaseSrmSelectUser(), {
            immediate: ['CREATE'].includes(props.command)
        })
        /**表单实例**/
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            formState: {
                /**归属供应商主键：仅新增可选**/
                userKeyId: props.node.userKeyId,
                /**设备名称**/
                name: props.node.name,
                /**设备型号：枚举项主键，仅新增可选**/
                model: props.node.model,
                /**MAC地址：仅新增可填**/
                mac: props.node.mac,
                /**设备状态**/
                status: props.node.status ?? 'enable'
            },
            rules: {
                userKeyId: { required: true, type: 'number', message: '请选择归属供应商', trigger: 'blur' },
                model: { required: true, type: 'number', message: '请选择设备型号', trigger: 'blur' },
                name: { required: true, message: '请输入设备名称', trigger: 'blur' },
                status: { required: true, message: '请选择设备状态', trigger: 'blur' },
                mac: {
                    required: true,
                    trigger: 'blur',
                    validator: (_rule: unknown, value: string) => {
                        if (isEmpty(value) || isEmpty(value.trim())) {
                            return new Error('请输入MAC地址')
                        }
                        return isMACAddress(value.trim(), { eui: '48' }) || new Error('MAC地址格式错误，例如 AA:BB:CC:DD:EE:FF')
                    }
                }
            }
        })

        /**确定提交表单：编辑只提交设备名称、设备状态**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseSrmCreateSimbank(formState.value)
                    } else {
                        await Service.httpBaseSrmUpdateSimbank({
                            keyId: props.node.keyId,
                            name: formState.value.name,
                            status: formState.value.status
                        })
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
            })
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={560}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={chunkState.initialize}
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
                    {['CREATE'].includes(props.command) && (
                        <form-base-column label="归属供应商" path="userKeyId">
                            <form-base-select
                                filterable
                                label-field="name"
                                label-value="keyId"
                                placeholder="请选择归属供应商"
                                loading={userOptions.loading.value}
                                options={userOptions.dataSource.value}
                                v-model:value={formState.value.userKeyId}
                            ></form-base-select>
                        </form-base-column>
                    )}
                    <form-base-column label="设备名称" path="name">
                        <form-base-input maxlength={64} placeholder="请输入设备名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    {['CREATE'].includes(props.command) && (
                        <form-base-column label="设备型号" path="model">
                            <form-base-select
                                placeholder="请选择设备型号"
                                label-field="label"
                                label-value="value"
                                options={chunkState.CHUNK_SRM_SIMBANK_MODEL.options}
                                v-model:value={formState.value.model}
                            ></form-base-select>
                        </form-base-column>
                    )}
                    {['CREATE'].includes(props.command) && (
                        <form-base-column label="MAC地址" path="mac">
                            <form-base-input
                                maxlength={17}
                                placeholder="例如 AA:BB:CC:DD:EE:FF"
                                v-model:value={formState.value.mac}
                            ></form-base-input>
                        </form-base-column>
                    )}
                    <form-base-column label="设备状态" path="status">
                        <form-base-select
                            placeholder="请选择设备状态"
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
