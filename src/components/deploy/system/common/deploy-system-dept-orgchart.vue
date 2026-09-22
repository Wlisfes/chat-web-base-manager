<script lang="tsx">
import { defineComponent, onMounted, watch, PropType } from 'vue'
import { fetchChartInitialization, fetchBaseTemplates, fetchForeignTemplates } from '@/utils'
import { ChartOptions, fetchVNodeRender, fetchCreateSvgIcon } from '@/utils'
import { useCurrentElement } from '@vueuse/core'
import { useConfiger, useStore } from '@/store'
import { Add } from '@vicons/carbon'
import * as feedback from '@/components/deploy/hooks'

export default defineComponent({
    name: 'DeploySystemDeptOrgchart',
    props: {
        /**刷新数据方法**/
        fetchUpdate: { type: Function, required: true },
        /**部门数据**/
        items: { type: Array as PropType<ChartOptions['nodes']>, default: () => [] }
    },
    setup(props) {
        const { theme } = useStore(useConfiger)
        const element = useCurrentElement<HTMLElement>()

        function fetchCreateBalkan(node: Omix, data: Omix) {
            const root = fetchVNodeRender(
                <layout-common-provider element={false}>
                    {['company', 'department'].includes(data.type) ? (
                        <deploy-system-dept-company node={data}></deploy-system-dept-company>
                    ) : (
                        <deploy-system-dept-user node={data}></deploy-system-dept-user>
                    )}
                </layout-common-provider>
            )
            return fetchForeignTemplates(node, root.innerHTML)
        }

        async function fetchInitTemplates() {
            return Promise.all([
                fetchBaseTemplates('company', { w: 260, h: 80 }, fetchCreateBalkan),
                fetchBaseTemplates('department', { w: 200, h: 52 }, fetchCreateBalkan),
                fetchBaseTemplates('user', { w: 140, h: 42 }, fetchCreateBalkan)
            ])
        }

        async function fetchDrawUpdate(chart: Awaited<ReturnType<typeof fetchChartInitialization>>) {
            return await props.fetchUpdate().then(() => {
                chart.config.nodes = props.items
                return chart.draw()
            })
        }

        async function fetchCreateDeploySystemDepartment(chart: Awaited<ReturnType<typeof fetchChartInitialization>>) {
            return await feedback.fetchDeploySystemDepartment({
                title: '新增部门',
                command: 'CREATE',
                onSubmit: event => fetchDrawUpdate(chart)
            })
        }

        async function fetchUpdateDeploySystemDepartment(chart: Awaited<ReturnType<typeof fetchChartInitialization>>, node: Omix) {
            return await feedback.fetchDeploySystemDepartment({
                title: '编辑部门',
                command: 'UPDATE',
                node: node,
                onSubmit: event => fetchDrawUpdate(chart)
            })
        }

        onMounted(fetchInitialization)
        async function fetchInitialization() {
            return await fetchInitTemplates().then(async () => {
                const chart = await fetchChartInitialization(element.value, {
                    mode: theme.value,
                    nodes: props.items,
                    searchFields: ['name'],
                    nodeBinding: { field_0: 'name', img_0: 'avatar' },
                    tags: {
                        company: { template: 'company' },
                        department: { template: 'department' },
                        user: { template: 'user' }
                    },
                    controls: {
                        myControl: {
                            title: '新增',
                            icon: fetchCreateSvgIcon(Add, 22),
                            onClick: () => fetchCreateDeploySystemDepartment(chart)
                        }
                    }
                })
                chart.onInit(() => {
                    const [left, top, right, bottom] = chart.getViewBox()
                    chart.setViewBox([-150, top, right, bottom])
                })
                chart.onNodeClick(async (args: Omix<{ node: Omix; event: MouseEvent }>) => {
                    return fetchUpdateDeploySystemDepartment(chart, chart.get(args.node.id))
                })
                return watch(theme, value => {
                    chart.config.mode = value
                    chart.mainElement.classList.remove('boc-dark', 'boc-light')
                    chart.mainElement.classList.add(`boc-${value}`)
                    chart.draw()
                })
            })
        }

        return () => <common-base-element class="deploy-system-dept-orgchart relative"></common-base-element>
    }
})
</script>

<style lang="scss" scoped>
.deploy-system-dept-orgchart {
    width: 100%;
    height: 100%;
    background-color: transparent;
    :deep(.boc-controls [data-control-id]) {
        width: 42px;
        height: 42px;
        border-radius: 4px;
        justify-content: center;
    }
    :deep(.deploy-system-dept-orgchart-template) {
        width: 100%;
        height: 100%;
        cursor: pointer;
        user-select: none;
        box-sizing: border-box;
        border: 1px solid #aeaeae;
        border-radius: var(--border-radius);
        background-color: var(--card-color);
        transition:
            border-color 0.3s var(--cubic-bezier-ease-in-out),
            background-color 0.3s var(--cubic-bezier-ease-in-out);
        &:hover {
            border-color: var(--primary-color-hover);
        }
    }
}
</style>
