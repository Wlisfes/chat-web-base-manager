<script lang="tsx">
import { defineComponent, PropType, Fragment } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemFeedbackSheet',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作指令**/
        command: { type: String as PropType<'CREATE' | 'CLONE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**菜单资源树结构表**/
        const sheetOptions = useSelectService(() => Service.httpBaseSystemSheetTreeStructure(), {
            immediate: false
        })
        /**通用字典枚举**/
        const chunkOptions = useChunkService({
            type: ['CHUNK_SHEET_CHECK', 'CHUNK_SHEET_STATUS', 'CHUNK_SHEET_CHUNK'],
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSystemSheetResolver,
            formState: {
                type: props.node.type ?? 'menu', //后端菜单类型
                permissionCode: props.node.permissionCode, //权限标识
                name: props.node.name, //名称
                path: props.node.path, //菜单地址
                routeName: props.node.routeName, //前端路由名称
                component: props.node.component, //前端组件标识
                externalUrl: props.node.externalUrl, //外部链接地址
                sort: props.node.sort ?? 10, //排序号
                status: props.node.status ?? 'enabled', //状态
                visible: props.node.visible ?? true, //菜单显示状态
                keepAlive: props.node.keepAlive ?? false, //页面缓存
                icon: props.node.icon, //菜单图标
                parentKeyId: props.node.parentKeyId //父级菜单
            },
            rules: {
                type: { required: true, trigger: 'blur', message: '请选择类型' },
                name: { required: true, trigger: 'blur', message: '请输入菜单/按钮名称' },
                status: { required: true, trigger: 'blur', message: '请选择菜单/按钮状态' },
                visible: { required: true, trigger: 'blur', message: '请选择菜单显示状态' },
                sort: { required: true, type: 'number', trigger: 'blur', message: '请输入排序号' }
            }
        })

        /**菜单资源详情**/
        async function fetchBaseSystemSheetResolver() {
            return await Promise.all([sheetOptions.fetchRequest(), chunkOptions.fetchRequest()]).then(async () => {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                try {
                    return await Service.httpBaseSystemSheetResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
                        return await setForm({ ...fetchReste(data), parentKeyId: data.parentKeyId }).then(async () => {
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
                    if (['menu', 'directory'].includes(formState.value.type)) {
                        if (['CREATE', 'CLONE'].includes(props.command)) {
                            await Service.httpBaseSystemCreateSheetResource(formState.value)
                        } else if (['UPDATE'].includes(props.command)) {
                            await Service.httpBaseSystemUpdateSheetResource({ ...formState.value, keyId: props.node.keyId })
                        }
                    } else {
                        if (['CREATE', 'CLONE'].includes(props.command)) {
                            await Service.httpBaseSystemCreateSheetAuthorize(formState.value)
                        } else if (['UPDATE'].includes(props.command)) {
                            await Service.httpBaseSystemUpdateSheetAuthorize({ ...formState.value, keyId: props.node.keyId })
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
                width={860}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-common-container
                    class="grid-auto-350 gap-col-20"
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <form-common-column label="类型" path="type">
                        <form-common-column-select
                            placeholder="请选择类型"
                            options={chunkOptions.CHUNK_SHEET_CHUNK.value}
                            v-model:value={formState.value.type}
                        ></form-common-column-select>
                    </form-common-column>
                    <form-common-column
                        label="权限标识"
                        path="permissionCode"
                        rule={{ required: formState.value.type !== 'directory', trigger: 'blur', message: '请输入权限标识' }}
                    >
                        <form-common-column-input
                            maxlength={255}
                            placeholder="请输入权限标识"
                            v-model:value={formState.value.permissionCode}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column
                        label="父级菜单/按钮"
                        path="parentKeyId"
                        key={formState.value.type}
                        rule={{
                            required: ['button'].includes(formState.value.type),
                            type: 'number',
                            trigger: 'blur',
                            message: '请选择父级菜单/按钮'
                        }}
                    >
                        <form-common-column-cascader
                            clearable
                            expand-trigger="click"
                            placeholder="请选择父级菜单/按钮"
                            v-model:value={formState.value.parentKeyId}
                            options={sheetOptions.dataSource.value}
                        ></form-common-column-cascader>
                    </form-common-column>
                    <form-common-column label="菜单/按钮名称" path="name">
                        <form-common-column-input
                            maxlength={32}
                            placeholder="请输入菜单/按钮名称"
                            v-model:value={formState.value.name}
                        ></form-common-column-input>
                    </form-common-column>
                    {['menu'].includes(formState.value.type) && (
                        <Fragment>
                            <form-common-column
                                label="菜单地址"
                                path="path"
                                rule={{ required: true, trigger: 'blur', message: '请输入菜单地址' }}
                            >
                                <form-common-column-input
                                    maxlength={255}
                                    placeholder="请输入菜单地址"
                                    v-model:value={formState.value.path}
                                ></form-common-column-input>
                            </form-common-column>
                            <form-common-column label="菜单图标" path="icon">
                                <form-common-column-input
                                    maxlength={255}
                                    placeholder="请输入菜单图标"
                                    v-model:value={formState.value.icon}
                                ></form-common-column-input>
                            </form-common-column>
                            <form-common-column label="菜单显示状态" path="visible">
                                <form-common-column-select
                                    placeholder="请选择菜单显示状态"
                                    options={chunkOptions.CHUNK_SHEET_CHECK.value}
                                    v-model:value={formState.value.visible}
                                ></form-common-column-select>
                            </form-common-column>
                        </Fragment>
                    )}
                    <form-common-column label="菜单/按钮状态" path="status">
                        <form-common-column-select
                            placeholder="请选择菜单/按钮状态"
                            options={chunkOptions.CHUNK_SHEET_STATUS.value}
                            v-model:value={formState.value.status}
                        ></form-common-column-select>
                    </form-common-column>
                    <form-common-column label="排序号" path="sort" v-model:value={formState.value.sort}>
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
