<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { isMACAddress, isEmpty } from 'class-validator'
import { useFormService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSupplierSimbankFeedback',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**供应商详情信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**设备型号字典枚举**/
        const { chunkState } = useChunkService(e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }), {
            types: ['CHUNK_SRM_SIMBANK_MODEL'],
            immediate: true
        })
        /**表单实例**/
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            formState: {
                /**归属供应商主键**/
                userKeyId: props.faseNode.keyId,
                /**设备名称**/
                name: undefined,
                /**设备型号：枚举项主键**/
                model: undefined,
                /**MAC地址**/
                mac: undefined
            },
            rules: {
                name: { required: true, message: '请输入设备名称', trigger: 'blur' },
                model: { required: true, message: '请选择设备型号', trigger: 'blur' },
                mac: {
                    required: true,
                    trigger: 'blur',
                    validator: (_rule: unknown, value: string) => {
                        if (isEmpty(value) || isEmpty(value.trimStart().trimEnd())) {
                            return new Error('请输入MAC地址')
                        }
                        return isMACAddress(value.trim(), { eui: '48' }) || new Error('MAC地址格式错误，例如 AA:BB:CC:DD:EE:FF')
                    }
                }
            }
        })

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseSrmCreateSimbank(formState.value)
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
                    <form-base-column label="设备名称" path="name">
                        <form-base-input maxlength={64} placeholder="请输入设备名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    <form-base-column label="设备型号" path="model">
                        <form-base-select
                            placeholder="请选择设备型号"
                            label-field="label"
                            label-value="value"
                            options={chunkState.CHUNK_SRM_SIMBANK_MODEL.options}
                            v-model:value={formState.value.model}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="MAC地址" path="mac">
                        <form-base-input
                            maxlength={17}
                            placeholder="例如 AA:BB:CC:DD:EE:FF"
                            v-model:value={formState.value.mac}
                        ></form-base-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
