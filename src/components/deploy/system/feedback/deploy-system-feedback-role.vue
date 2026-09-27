<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { fetchNormalizeTreeChildren } from '@/utils'
import * as Service from '@/api/instance.service'

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
        /**部门树结构**/
        const deptOptions = useSelectService(() => Service.httpBaseAccountOrganizationTreeStructure(), {
            immediate: false,
            transform: fetchNormalizeTreeChildren
        })
        /**角色静态枚举**/
        const { chunkOptions, fetchChunkService } = useChunkService(e => Service.httpBaseAccountRoleEnums(), {
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSystemRoleResolver,
            formState: {
                code: props.node.code, //角色编码
                name: props.node.name, //角色名称
                description: props.node.description, //角色描述
                sort: props.node.sort ?? 10, //排序号
                status: props.node.status ?? 'enabled', //角色状态
                dataScopes: [{ resourceCode: '*', scopeType: 'self', status: 'enabled', organizations: [] as Array<Omix> }] //数据权限
            },
            rules: {
                code: { required: true, message: '请输入角色编码', trigger: 'blur' },
                name: { required: true, message: '请输入角色名称', trigger: 'blur' },
                status: { required: true, message: '请选择角色状态', trigger: 'blur' },
                sort: { required: true, type: 'number', message: '请输入排序号', trigger: 'blur' }
            }
        })
        /**角色详情**/
        async function fetchBaseSystemRoleResolver() {
            return await Promise.all([fetchChunkService(), deptOptions.fetchRequest()]).then(async () => {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                try {
                    return await Service.httpBaseAccountRoleResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
                        const formOptions = fetchReste({ ...data, dataScopes: data.dataScopes?.length ? data.dataScopes : undefined })
                        return await setForm(formOptions).then(async () => {
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
        /**更新自定义数据权限组织**/
        function fetchUpdateOrganizations(keyIds: Array<number>) {
            const [dataScope] = formState.value.dataScopes
            dataScope.organizations = keyIds.map(organizationKeyId => {
                const current = dataScope.organizations.find((item: Omix) => item.organizationKeyId === organizationKeyId)
                return { organizationKeyId, includeChildren: current?.includeChildren ?? true }
            })
        }
        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    const { dataScopes, ...payload } = formState.value
                    const rules = dataScopes.map(({ resourceCode, scopeType, status, organizations }: Omix) => ({
                        resourceCode,
                        scopeType,
                        status,
                        organizations: scopeType === 'custom' ? organizations : []
                    }))
                    if (['CREATE'].includes(props.command)) {
                        const { data } = await Service.httpBaseAccountCreateRole(payload)
                        await Service.httpBaseAccountUpdateRoleDataScope({ keyId: data.keyId, rules })
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseAccountUpdateRole({ keyId: props.node.keyId, ...payload })
                        await Service.httpBaseAccountUpdateRoleDataScope({ keyId: props.node.keyId, rules })
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
                        <form-base-input maxlength={32} placeholder="请输入角色名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    <form-base-column
                        label="数据权限"
                        path="dataScopes[0].scopeType"
                        rule={{ required: true, message: '请选择数据权限', trigger: 'change' }}
                    >
                        <form-base-select
                            placeholder="请选择数据权限"
                            options={chunkOptions.value.scopeTypeOptions}
                            v-model:value={formState.value.dataScopes[0].scopeType}
                        ></form-base-select>
                    </form-base-column>
                    {formState.value.dataScopes[0].scopeType === 'custom' && (
                        <form-base-column
                            label="指定组织"
                            path="dataScopes[0].organizations"
                            rule={{ required: true, type: 'array', min: 1, message: '请选择至少一个组织', trigger: 'change' }}
                        >
                            <form-base-tree-select
                                multiple
                                checkable
                                clearable
                                cascade={false}
                                label-field="name"
                                label-value="keyId"
                                children-field="children"
                                placeholder="请选择可访问的组织"
                                value={formState.value.dataScopes[0].organizations.map((item: Omix) => item.organizationKeyId)}
                                onUpdate:value={fetchUpdateOrganizations}
                                loading={deptOptions.loading.value}
                                options={deptOptions.dataSource.value}
                            ></form-base-tree-select>
                        </form-base-column>
                    )}
                    <form-base-column label="角色状态" path="status">
                        <form-base-select
                            placeholder="请选择角色状态"
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="排序号" path="sort">
                        <n-input-number class="w-full" placeholder="请输入排序号" v-model:value={formState.value.sort} />
                    </form-base-column>
                    <form-base-column label="角色描述" path="description">
                        <form-base-input
                            type="textarea"
                            placeholder="请输入角色描述"
                            maxlength={128}
                            autosize={{ minRows: 2, maxRows: 5 }}
                            v-model:value={formState.value.description}
                        ></form-base-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
