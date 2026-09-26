<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
import { fetchNormalizeTreeChildren, isEmpty } from '@/utils'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemFeedbackDeptUser',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**预选部门**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**部门树结构**/
        const deptOptions = useSelectService(() => Service.httpBaseAccountOrganizationTreeStructure({ keyId: 1124100 }), {
            transform: fetchNormalizeTreeChildren,
            immediate: false
        })
        /**账号下拉列表**/
        const accountOptions = useSelectService(Service.httpBaseAccountSelectUser, {
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                organizationKeyId: props.node.keyId,
                leaderUserUid: props.node.leaderUserUid,
                uids: []
            },
            rules: {
                organizationKeyId: { required: true, type: 'number', trigger: 'blur', message: '请选择所属部门' },
                uids: { required: true, type: 'array', message: '请选择关联账号', trigger: 'blur' }
            }
        })

        /**读取指定部门的现有成员UID**/
        async function fetchBaseAccountOrganizationColumnUser(keyId?: number) {
            if (isEmpty(keyId)) {
                return await setForm({ uids: [] })
            }
            return await Service.httpBaseAccountOrganizationColumnUser({
                keyId: keyId
            }).then(async ({ data }) => {
                return await setForm({ uids: (data ?? []).map((item: Omix) => item.uid) })
            })
        }

        /**切换部门事件**/
        async function fetchChnageBaseOrganization(keyId: number, e: Omix) {
            return await setState({ loading: true }).then(async () => {
                await fetchBaseAccountOrganizationColumnUser(keyId)
                return await setForm({ leaderUserUid: e.leaderUserUid }).then(async () => {
                    return await setState({ loading: false })
                })
            })
        }

        /**初始化**/
        async function fetchInitialization() {
            return await Promise.all([
                deptOptions.fetchRequest(),
                accountOptions.fetchRequest(),
                fetchBaseAccountOrganizationColumnUser(formState.value.organizationKeyId)
            ]).then(async () => {
                return await setState({ initialize: false })
            })
        }

        /**确认提交。uids 是该部门的成员全集，服务端按差异新增或移除**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    return await Service.httpBaseAccountUpdateOrganizationUser({
                        organizationKeyId: formState.value.organizationKeyId,
                        uids: formState.value.uids
                    }).then(async () => {
                        return await setState({ visible: false }).then(async () => {
                            await emit('submit', { done: setState })
                            return await fetchNotifyService({ title: '操作成功' })
                        })
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
                    <form-base-column label="所属部门" path="organizationKeyId">
                        <form-base-cascader
                            v-model:value={formState.value.organizationKeyId}
                            label-field="name"
                            label-value="keyId"
                            children-field="children"
                            placeholder="请选择所属部门"
                            expand-trigger="click"
                            options={deptOptions.dataSource.value}
                            on-change:value={fetchChnageBaseOrganization}
                        ></form-base-cascader>
                    </form-base-column>
                    <form-base-column label="关联账号" path="uids">
                        <form-base-select
                            multiple
                            filterable
                            max-tag-count={999}
                            label-value="uid"
                            label-field="showName"
                            placeholder="请选择关联账号"
                            loading={accountOptions.loading.value}
                            options={accountOptions.dataSource.value}
                            v-model:value={formState.value.uids}
                        ></form-base-select>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
