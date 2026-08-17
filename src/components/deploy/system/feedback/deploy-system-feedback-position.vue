<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemFeedbackPosition',
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
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSystemPositionResolver,
            formState: {
                name: props.node.name, //职位名称
                sort: props.node.sort ?? 10 //排序号
            },
            rules: {
                name: { required: true, message: '请输入职位名称', trigger: 'blur' },
                sort: { required: true, type: 'number', message: '请输入排序号', trigger: 'blur' }
            }
        })

        /**职位详情**/
        async function fetchBaseSystemPositionResolver() {
            if (['CREATE'].includes(props.command)) {
                return await setState({ initialize: false })
            }
            try {
                return await Service.httpBaseSystemPositionResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
                    return await setForm(fetchReste(data)).then(async () => {
                        return await setState({ initialize: false })
                    })
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
                        await Service.httpBaseSystemCreatePosition(formState.value)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseSystemUpdatePosition({ ...formState.value, keyId: props.node.keyId })
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
                    <form-common-column label="职位名称" path="name">
                        <form-common-column-input
                            maxlength={32}
                            placeholder="请输入职位名称"
                            v-model:value={formState.value.name}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="排序号" path="sort">
                        <n-input-number
                            class="w-full"
                            min={1}
                            step={10}
                            precision={0}
                            placeholder="请输入排序号"
                            v-model:value={formState.value.sort}
                        />
                    </form-common-column>
                </form-common-container>
            </common-dialog-provider>
        )
    }
})
</script>
