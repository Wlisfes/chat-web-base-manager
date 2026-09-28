<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceBaseFeedbackBrand',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作指令**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**品牌静态枚举**/
        const { chunkOptions, chunkState, fetchChunkService } = useChunkService(e => Service.httpBaseFinanceBrandEnums(), {
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseFinanceBrandResolver,
            formState: {
                /**品牌名称**/
                name: props.node.name,
                /**品牌描述**/
                document: props.node.document,
                /**状态**/
                status: props.node.status ?? 'enable'
            },
            rules: {
                name: { required: true, message: '请输入品牌名称', trigger: 'blur' },
                document: { required: true, message: '请输入品牌描述', trigger: 'blur' },
                status: { required: true, message: '请选择状态', trigger: 'blur' }
            }
        })

        /**品牌详情**/
        async function fetchBaseFinanceBrandResolver() {
            const taskNames = [fetchChunkService()]
            if (['CREATE'].includes(props.command)) {
                return await Promise.all(taskNames).then(async () => {
                    return await setState({ initialize: false })
                })
            } else {
                taskNames.unshift(Service.httpBaseFinanceBrandResolver({ keyId: props.node.keyId }))
            }
            return await Promise.all(taskNames).then(async ([{ data }]) => {
                try {
                    return await setForm(fetchReste(data)).then(async () => {
                        return await setState({ initialize: false })
                    })
                } catch (err) {
                    return await setState({ initialize: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseFinanceCreateBrand(formState.value)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseFinanceUpdateBrand({ ...formState.value, keyId: props.node.keyId })
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
                width={640}
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
                    <form-base-column label="品牌名称" path="name">
                        <form-base-input maxlength={64} placeholder="请输入品牌名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    <form-base-column label="状态" path="status">
                        <form-base-select
                            placeholder="请选择状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="品牌描述" path="document">
                        <form-base-input
                            show-count
                            type="textarea"
                            maxlength={1024}
                            placeholder="请输入品牌描述"
                            autosize={{ minRows: 3, maxRows: 6 }}
                            v-model:value={formState.value.document}
                        ></form-base-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
