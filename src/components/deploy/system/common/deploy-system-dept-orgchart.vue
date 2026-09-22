<script lang="tsx">
import { defineComponent, onMounted, watch, render, PropType } from 'vue'
import { fetchChartInitialization, fetchBaseTemplates, fetchForeignTemplates } from '@/utils'
import { OrgChart, ChartOptions, fetchCreateVNode, fetchCreateSvgIcon } from '@/utils'
import { useCurrentElement } from '@vueuse/core'
import { useConfiger, useStore } from '@/store'
import { Add } from '@vicons/carbon'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemDeptOrgchart',
    props: {
        /**刷新数据方法**/
        fetchUpdate: { type: Function, required: true },
        /**部门数据**/
        items: { type: Array as PropType<ChartOptions['nodes']>, default: () => [] }
    },
    setup(props, { emit }) {
        const { theme } = useStore(useConfiger)
        const element = useCurrentElement<HTMLElement>()

        function fetchCreateBalkan(node: Omix, data: Omix) {
            const root = document.createElement('div')
            render(
                fetchCreateVNode(
                    <layout-common-provider>
                        <deploy-system-dept-balkan node={data}></deploy-system-dept-balkan>
                    </layout-common-provider>
                ),
                root
            )
            return fetchForeignTemplates(node, root.innerHTML)
        }

        async function fetchInitTemplates() {
            return Promise.all([
                fetchBaseTemplates('company', { w: 260, h: 80 }, fetchCreateBalkan),
                fetchBaseTemplates('department', { w: 200, h: 52 }, fetchCreateBalkan),
                fetchBaseTemplates('user', { w: 130, h: 42 }, fetchCreateBalkan)
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
                    nodeBinding: { field_0: 'name', field_1: 'img' },
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
}
</style>
