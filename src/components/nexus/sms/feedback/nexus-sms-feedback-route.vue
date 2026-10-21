<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRoute',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作类型：CREATE 新增、UPDATE 编辑**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑的路由方案**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            initialize: false,
            formState: {
                /**方案名称**/
                name: props.node.name,
                /**方案别名：可为空，非空时全表唯一**/
                alias: props.node.alias,
                /**是否默认方案：仅新增时可设置，编辑时通过列表“设为默认”操作**/
                isDefault: props.node.isDefault ?? false,
                /**方案状态**/
                status: props.node.status ?? 'enable',
                /**备注**/
                remark: props.node.remark
            },
            rules: {
                name: { required: true, message: '请输入方案名称', trigger: 'blur' },
                status: { required: true, message: '请选择方案状态', trigger: 'blur' }
            }
        })

        /**提交：默认标记只在新增时提交**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) return await setState({ loading: false, disabled: false })
                try {
                    const body = {
                        name: formState.value.name?.trim(),
                        alias: formState.value.alias?.trim() || undefined,
                        status: formState.value.status,
                        remark: formState.value.remark
                    }
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseSrmCreateRoute({ ...body, isDefault: formState.value.isDefault })
                    } else {
                        await Service.httpBaseSrmUpdateRoute({ ...body, keyId: props.node.keyId })
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
                    <form-base-column label="方案名称" path="name">
                        <form-base-input maxlength={64} placeholder="请输入方案名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    <form-base-column label="方案别名" path="alias">
                        <form-base-input
                            maxlength={64}
                            placeholder="请输入方案别名，可为空"
                            v-model:value={formState.value.alias}
                        ></form-base-input>
                    </form-base-column>
                    {['CREATE'].includes(props.command) && (
                        <form-base-column label="默认方案" path="isDefault">
                            <div class="flex items-center gap-12">
                                <n-switch v-model:value={formState.value.isDefault}></n-switch>
                                <n-text depth="3">未绑定方案或绑定方案没有匹配规则的短信应用走默认方案，设为默认会取消原默认方案</n-text>
                            </div>
                        </form-base-column>
                    )}
                    <form-base-column label="方案状态" path="status">
                        <form-base-select
                            disabled={props.node.isDefault}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
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
