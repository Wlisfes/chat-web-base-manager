<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { createDeployRoleDataScopePayload, createDeployRolePayload, mapDeployOrganizations, mapDeployRole } from '@/utils'
import { httpBaseAccountOrganizationTreeStructure } from '@/api/modules/deploy/modules/organization.service'
import * as Service from '@/api/modules/deploy/modules/role.service'

export default defineComponent({
    name: 'DeploySystemFeedbackRole',
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
        /**部门树结构（仅部门角色需要）**/
        const deptOptions = useSelectService(() => httpBaseAccountOrganizationTreeStructure(), {
            immediate: false,
            transform: mapDeployOrganizations
        })

        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSystemRoleResolver,
            formState: {
                code: props.node.code, //角色编码
                name: props.node.name, //角色名称
                comment: props.node.comment, //角色描述
                sort: props.node.sort ?? 10, //排序号
                status: props.node.status ?? 'enabled', //角色状态
                model: props.node.model ?? 'self', //数据权限
                organizationKeyIds: props.node.organizationKeyIds ?? [] //指定组织
            },
            rules: {
                code: { required: true, message: '请输入角色编码', trigger: 'blur' },
                name: { required: true, message: '请输入角色名称', trigger: 'blur' },
                status: { required: true, message: '请选择角色状态', trigger: 'blur' },
                model: { required: true, message: '请选择数据权限', trigger: 'blur' },
                sort: { required: true, type: 'number', message: '请输入排序号', trigger: 'blur' }
            }
        })
        /**角色详情**/
        async function fetchBaseSystemRoleResolver() {
            return await Promise.all([deptOptions.fetchRequest()]).then(async () => {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                try {
                    return await Service.httpBaseAccountRoleResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
                        return await setForm(fetchReste(mapDeployRole(data))).then(async () => {
                            return await setState({ initialize: false })
                        })
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
                        const response = await Service.httpBaseAccountCreateRole(createDeployRolePayload(formState.value))
                        if (formState.value.model) {
                            await Service.httpBaseAccountUpdateRoleDataScope({
                                keyId: response.data.keyId,
                                ...createDeployRoleDataScopePayload(formState.value)
                            })
                        }
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseAccountUpdateRole({
                            keyId: props.node.keyId,
                            ...createDeployRolePayload(formState.value)
                        })
                        if (formState.value.model) {
                            await Service.httpBaseAccountUpdateRoleDataScope({
                                keyId: props.node.keyId,
                                ...createDeployRoleDataScopePayload(formState.value)
                            })
                        }
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
                    <form-base-column label="角色编码" path="code">
                        <form-base-input
                            maxlength={64}
                            placeholder="例如 department_manager"
                            disabled={props.node.builtin === true}
                            v-model:value={formState.value.code}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="角色名称" path="name">
                        <form-base-input
                            maxlength={32}
                            placeholder="请输入角色名称"
                            v-model:value={formState.value.name}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="数据权限" path="model">
                        <form-base-select
                            placeholder="请选择数据权限"
                            //options={chunkOptions.CHUNK_ROLE_MODEL.value}
                            v-model:value={formState.value.model}
                        ></form-base-select>
                    </form-base-column>
                    {formState.value.model === 'custom' && (
                        <form-base-column
                            label="指定组织"
                            path="organizationKeyIds"
                            rule={{ required: true, type: 'array', min: 1, message: '请选择至少一个组织', trigger: 'change' }}
                        >
                            <form-base-cascader
                                multiple
                                clearable
                                cascade={false}
                                placeholder="请选择可访问的组织"
                                options={deptOptions.dataSource.value}
                                v-model:value={formState.value.organizationKeyIds}
                            ></form-base-cascader>
                        </form-base-column>
                    )}
                    <form-base-column label="角色状态" path="status">
                        <form-base-select
                            placeholder="请选择角色状态"
                            //options={chunkOptions.CHUNK_ACCOUNT_STATUS.value}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="排序号" path="sort">
                        <n-input-number class="w-full" placeholder="请输入排序号" v-model:value={formState.value.sort} />
                    </form-base-column>
                    <form-base-column label="角色描述" path="comment">
                        <form-base-input
                            type="textarea"
                            placeholder="请输入角色描述"
                            maxlength={128}
                            autosize={{ minRows: 2, maxRows: 5 }}
                            v-model:value={formState.value.comment}
                        ></form-base-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
