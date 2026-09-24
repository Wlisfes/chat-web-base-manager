<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { faker, fetchNormalizeTreeChildren } from '@/utils'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemFeedbackUser',
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
        const deptOptions = useSelectService(() => Service.httpBaseAccountOrganizationTreeStructure({ keyId: 1124100 }), {
            transform: fetchNormalizeTreeChildren,
            immediate: false
        })
        /**职位选项**/
        const positionOptions = useSelectService(() => Service.httpBaseAccountSelectPosition(), {
            immediate: false
        })
        /**账号静态枚举**/
        const { chunkOptions, fetchChunkService } = useChunkService(e => Service.httpBaseAccountUserEnums(), {
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSystemAccountResolver,
            formState: {
                organizationKeyIds: props.node.organizationKeyIds ?? [], //归属部门
                positionKeyIds: props.node.positionKeyIds ?? [], //职位
                name: props.node.name, //姓名
                number: props.node.number, //工号
                phone: props.node.phone, //手机号
                email: props.node.email, //邮箱
                password: props.node.password, //密码
                avatar: props.node.avatar, //头像
                status: props.node.status, //状态
                employmentStatus: props.node.employmentStatus ?? 'employed', //员工状态
                employmentTime: props.node.employmentTime ?? new Date() //入职时间
            },
            rules: {
                organizationKeyIds: { required: true, type: 'array', message: '请选择归属部门', trigger: 'blur' },
                name: { required: true, message: '请输入姓名', trigger: 'blur' },
                number: { required: true, message: '请输入工号', trigger: 'blur' },
                phone: { required: true, message: '请输入手机号', trigger: 'blur' },
                password: { required: true, message: '请输入密码', trigger: 'blur' },
                status: { required: true, message: '请选择状态', trigger: 'blur' }
            }
        })
        /**填充默认数据**/
        async function fetchInstState() {
            const charst = `王李张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎`
            return fetchReste({
                name: faker.person.fullName({
                    lastName: faker.helpers.arrayElement(charst.split(''))
                }),
                number: faker.string.numeric(4),
                phone: `1${faker.helpers.arrayElement([3, 5, 7, 8, 9])}${faker.string.numeric(9)}`,
                email: faker.internet.email({ provider: 'nqmo.com' }),
                password: '123456',
                status: 'enabled',
                avatar: await fetch(`https://picsum.photos/500`).then(e => e.url)
            })
        }
        /**部门详情**/
        async function fetchBaseSystemAccountResolver() {
            const taskNames = [fetchChunkService(), deptOptions.fetchRequest(), positionOptions.fetchRequest()]
            return await Promise.all(taskNames).then(async () => {
                if (['CREATE'].includes(props.command)) {
                    return await fetchInstState().then(async formData => {
                        return await setForm(formData).then(async () => {
                            return await setState({ initialize: false })
                        })
                    })
                }
                try {
                    return await Service.httpBaseAccountUserResolver({ uid: props.node.uid }).then(async ({ data }) => {
                        return await setForm(fetchReste(data)).then(async () => {
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
                        await Service.httpBaseAccountCreateUser(formState.value)
                    } else if (['UPDATE'].includes(props.command)) {
                        const uid = props.node.uid
                        await Service.httpBaseAccountUpdateUser({ ...formState.value, uid })
                        await Service.httpBaseAccountUpdateUserOrganization({ ...formState.value, uid })
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
                width={750}
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
                    <common-base-columns-template class="gap-x-20" type="auto-fit" number={320}>
                        <form-base-column label="归属部门" path="organizationKeyIds">
                            <form-base-tree-select
                                multiple
                                checkable
                                cascade={false}
                                label-field="name"
                                label-value="keyId"
                                children-field="children"
                                placeholder="请选择归属部门"
                                v-model:value={formState.value.organizationKeyIds}
                                options={deptOptions.dataSource.value}
                            ></form-base-tree-select>
                        </form-base-column>
                        <form-base-column label="职位" path="positionKeyIds">
                            <form-base-select
                                multiple
                                filterable
                                label-field="name"
                                label-value="keyId"
                                placeholder="请选择职位"
                                loading={positionOptions.loading.value}
                                options={positionOptions.dataSource.value}
                                v-model:value={formState.value.positionKeyIds}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column label="姓名" path="name">
                            <form-base-input maxlength={32} placeholder="请输入姓名" v-model:value={formState.value.name}></form-base-input>
                        </form-base-column>
                        <form-base-column label="工号" path="number">
                            <form-base-input
                                maxlength={4}
                                placeholder="请输入工号（4位）"
                                disabled={['UPDATE'].includes(props.command)}
                                v-model:value={formState.value.number}
                            ></form-base-input>
                        </form-base-column>
                        <form-base-column label="手机号" path="phone">
                            <form-base-input
                                maxlength={11}
                                placeholder="请输入手机号"
                                v-model:value={formState.value.phone}
                            ></form-base-input>
                        </form-base-column>
                        <form-base-column label="邮箱" path="email">
                            <form-base-input
                                maxlength={128}
                                placeholder="请输入邮箱"
                                v-model:value={formState.value.email}
                            ></form-base-input>
                        </form-base-column>
                        {['CREATE'].includes(props.command) && (
                            <form-base-column label="密码" path="password">
                                <form-base-input
                                    maxlength={32}
                                    placeholder="请输入密码（6~32位）"
                                    v-model:value={formState.value.password}
                                ></form-base-input>
                            </form-base-column>
                        )}
                        <form-base-column label="状态" path="status">
                            <form-base-select
                                placeholder="请选择状态"
                                options={chunkOptions.value.statusOptions}
                                v-model:value={formState.value.status}
                            ></form-base-select>
                        </form-base-column>
                    </common-base-columns-template>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
