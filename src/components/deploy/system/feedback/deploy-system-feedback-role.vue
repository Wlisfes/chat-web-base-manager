<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { createDeployRoleDataScopePayload, createDeployRolePayload, mapDeployOrganizations, mapDeployRole } from '@/utils'
import { httpBaseSystemDepartmentTreeStructure } from '@/api/modules/deploy/modules/dept.service'
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
        /**通用字典枚举**/
        const chunkOptions = useChunkService({
            immediate: false,
            type: ['CHUNK_ROLE_MODEL', 'CHUNK_ROLE_CHUNK', 'CHUNK_ACCOUNT_STATUS']
        })
        /**部门树结构（仅部门角色需要）**/
        const deptOptions = useSelectService(() => httpBaseSystemDepartmentTreeStructure(), {
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
            return await Promise.all([deptOptions.fetchRequest(), chunkOptions.fetchRequest()]).then(async () => {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                try {
                    return await Service.httpBaseSystemRoleResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
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
                        const response = await Service.httpBaseSystemCreateRole(createDeployRolePayload(formState.value))
                        if (formState.value.model) {
                            await Service.httpBaseSystemUpdateRoleModel({
                                keyId: response.data.keyId,
                                ...createDeployRoleDataScopePayload(formState.value)
                            })
                        }
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseSystemUpdateRole({
                            keyId: props.node.keyId,
                            ...createDeployRolePayload(formState.value)
                        })
                        if (formState.value.model) {
                            await Service.httpBaseSystemUpdateRoleModel({
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
                <form-common-container
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <form-common-column label="角色编码" path="code">
                        <form-common-column-input
                            maxlength={64}
                            placeholder="例如 department_manager"
                            disabled={props.node.builtin === true}
                            v-model:value={formState.value.code}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="角色名称" path="name">
                        <form-common-column-input
                            maxlength={32}
                            placeholder="请输入角色名称"
                            v-model:value={formState.value.name}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="数据权限" path="model">
                        <form-common-column-select
                            placeholder="请选择数据权限"
                            options={chunkOptions.CHUNK_ROLE_MODEL.value}
                            v-model:value={formState.value.model}
                        ></form-common-column-select>
                    </form-common-column>
                    {formState.value.model === 'custom' && (
                        <form-common-column
                            label="指定组织"
                            path="organizationKeyIds"
                            rule={{ required: true, type: 'array', min: 1, message: '请选择至少一个组织', trigger: 'change' }}
                        >
                            <form-common-column-cascader
                                multiple
                                clearable
                                cascade={false}
                                placeholder="请选择可访问的组织"
                                options={deptOptions.dataSource.value}
                                v-model:value={formState.value.organizationKeyIds}
                            ></form-common-column-cascader>
                        </form-common-column>
                    )}
                    <form-common-column label="角色状态" path="status">
                        <form-common-column-select
                            placeholder="请选择角色状态"
                            options={chunkOptions.CHUNK_ACCOUNT_STATUS.value}
                            v-model:value={formState.value.status}
                        ></form-common-column-select>
                    </form-common-column>
                    <form-common-column label="排序号" path="sort">
                        <n-input-number class="w-full" placeholder="请输入排序号" v-model:value={formState.value.sort} />
                    </form-common-column>
                    <form-common-column label="角色描述" path="comment">
                        <form-common-column-input
                            type="textarea"
                            placeholder="请输入角色描述"
                            maxlength={128}
                            autosize={{ minRows: 2, maxRows: 5 }}
                            v-model:value={formState.value.comment}
                        ></form-common-column-input>
                    </form-common-column>
                </form-common-container>
            </common-dialog-provider>
        )
    }
})
</script>
