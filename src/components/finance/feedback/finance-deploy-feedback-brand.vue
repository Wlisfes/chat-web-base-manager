<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'FinanceDeployFeedbackBrand',
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
        /**表单实例**/
        const { formState, formRef, state, chunkState, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseFinanceBrandResolver,
            chunkNames: { CHUNK_BRAND_STATUS: true },
            formState: {
                name: props.node.name, //品牌名称
                document: props.node.document, //品牌描述
                status: props.node.status ?? 'enable' //状态
            },
            rules: {
                name: { required: true, message: '请输入品牌名称', trigger: 'blur' },
                document: { required: true, message: '请输入品牌描述', trigger: 'blur' },
                status: { required: true, message: '请选择状态', trigger: 'change' }
            }
        })

        /**品牌详情**/
        async function fetchBaseFinanceBrandResolver() {
            try {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                return await setForm(fetchReste(props.node)).then(async () => {
                    return await setState({ initialize: false })
                })
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
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
                width={540}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-common-container
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <form-common-column label="品牌名称" path="name">
                        <form-common-column-input
                            maxlength={64}
                            placeholder="请输入品牌名称"
                            v-model:value={formState.value.name}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="状态" path="status">
                        <form-common-column-select
                            placeholder="请选择状态"
                            options={chunkState.CHUNK_BRAND_STATUS}
                            v-model:value={formState.value.status}
                        ></form-common-column-select>
                    </form-common-column>
                    <form-common-column label="品牌描述" path="document">
                        <n-input
                            type="textarea"
                            maxlength={1024}
                            show-count
                            placeholder="请输入品牌描述"
                            v-model:value={formState.value.document}
                            autosize={{ minRows: 3, maxRows: 6 }}
                        />
                    </form-common-column>
                </form-common-container>
            </common-dialog-provider>
        )
    }
})
</script>
