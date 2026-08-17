<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemFeedbackRoleAccount',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**角色ID**/
        roleId: { type: Number as PropType<number>, required: true }
    },
    setup(props, { emit }) {
        /**账号下拉列表**/
        const accountOptions = useSelectService(() => Service.httpBaseSystemSelectAccount(), {
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            callback: fetchInitialize,
            formState: { uids: [] },
            rules: {
                uids: { required: true, type: 'array', message: '请选择关联账号', trigger: 'change' }
            }
        })

        /**初始化**/
        async function fetchInitialize() {
            return await accountOptions.fetchRequest().then(async () => {
                return await setState({ initialize: false })
            })
        }

        /**确认提交**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseSystemCreateAccountRole({
                        keyId: props.roleId,
                        uids: formState.value.uids
                    })
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
                    <form-common-column label="关联账号" path="uids">
                        <form-common-column-select
                            multiple
                            filterable
                            clearable
                            placeholder="请选择关联账号"
                            loading={accountOptions.loading.value}
                            options={accountOptions.dataSource.value}
                            v-model:value={formState.value.uids}
                        ></form-common-column-select>
                    </form-common-column>
                </form-common-container>
            </common-dialog-provider>
        )
    }
})
</script>
