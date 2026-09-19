<script lang="tsx">
import OrgChart from 'balkan-orgchart-js'
import { createVNode, defineComponent, getCurrentInstance, nextTick, onMounted, onUnmounted, render } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import CommonChartDeptManagerNode from './common-chart-dept-manager-node.vue'

OrgChart.SEARCH_PLACEHOLDER = 'Chercher22222222'

export default defineComponent({
    name: 'CommonChartDeptManager',
    emits: ['node-click'],
    setup(_, { emit }) {
        const instance = getCurrentInstance()
        const element = useCurrentElement<HTMLElement>()
        const mountedHosts = new Set<Element>()
        let chart: OrgChart | undefined

        const nodes = [
            { id: 1, name: 'Office of the Executive Director' },

            { id: 2, pid: 1, name: 'National Regional Offices', tags: ['head'] },
            { id: 3, pid: 1, name: 'Office of Compliance Director', tags: ['head'] },
            { id: 4, pid: 1, name: 'Division of Operational Services', tags: ['head'] },
            { id: 5, pid: 1, name: 'Division of Policy & Strategy', tags: ['head'] },
            { id: 6, pid: 1, name: 'Division of Administrative Services', tags: ['head'] },

            { id: 7, pid: 2, name: 'North Region', tags: ['item'] },
            { id: 8, pid: 2, name: 'South Region', tags: ['item'] },
            { id: 9, pid: 2, name: 'East Region', tags: ['item'] },
            { id: 10, pid: 2, name: 'West Region', tags: ['item'] },
            { id: 11, pid: 2, name: 'Central Region', tags: ['item'] },
            { id: 12, pid: 2, name: 'International Region', tags: ['item'] },

            { id: 13, pid: 3, name: 'Inspection Services', tags: ['item'] },
            { id: 14, pid: 3, name: 'Audit & Review', tags: ['item'] },

            { id: 15, pid: 4, name: 'Scheduling & Coordination', tags: ['item'] },
            { id: 16, pid: 4, name: 'Performance Monitoring', tags: ['item'] },
            { id: 17, pid: 4, name: 'Quality Management', tags: ['item'] },
            { id: 18, pid: 4, name: 'National Initiatives', tags: ['item'] },
            { id: 19, pid: 4, name: 'Systems & Data Services', tags: ['item'] },

            { id: 20, pid: 5, name: 'Regulatory Affairs', tags: ['item'] },
            { id: 21, pid: 5, name: 'Policy Development', tags: ['item'] },
            { id: 22, pid: 5, name: 'Training & Education', tags: ['item'] },
            { id: 23, pid: 5, name: 'Public Outreach', tags: ['item'] },
            { id: 24, pid: 5, name: 'Support Services Branch', tags: ['item'] },

            { id: 25, pid: 6, name: 'Financial Management', tags: ['item'] },
            { id: 26, pid: 6, name: 'Human Capital Management', tags: ['item'] },
            { id: 27, pid: 6, name: 'Information Technology Services', tags: ['item'] }
        ]

        const vueField = (node: any) =>
            `<foreignObject x="0" y="0" width="${node.w}" height="${node.h}">
                <div xmlns="http://www.w3.org/1999/xhtml" data-vue-node="${node.id}" style="width:${node.w}px;height:${node.h}px;"></div>
            </foreignObject>`

        const ensureDemoTemplates = () => {
            OrgChart.templates.ana.node = (node: any) =>
                `<rect x="0" y="0" width="${node.w}" height="${node.h}" fill="transparent" stroke="none"></rect>`
            OrgChart.templates.ana.field_0 = vueField

            OrgChart.templates.item = Object.assign({}, OrgChart.templates.ana)
            OrgChart.templates.item.size = [250, 40]
            OrgChart.templates.item.node = `<rect x="0" y="0" height="40" width="250" fill="none"></rect>`
            OrgChart.templates.item.field_0 = vueField
        }

        function unmountVueNodes() {
            mountedHosts.forEach(host => render(null, host))
            mountedHosts.clear()
        }

        function mountVueNodes(current: OrgChart) {
            unmountVueNodes()
            element.value?.querySelectorAll<HTMLElement>('[data-vue-node]').forEach(host => {
                console.log(host)
                const id = host.dataset.vueNode
                if (!id) return
                const vnode = createVNode(CommonChartDeptManagerNode, {
                    data: current.get(id),
                    onClick: (data: Record<string, any>) => emit('node-click', data)
                })
                if (instance?.appContext) {
                    vnode.appContext = instance.appContext
                }
                render(vnode, host)
                mountedHosts.add(host)
            })
        }

        onMounted(fetchChartCreate)
        onUnmounted(() => {
            unmountVueNodes()
            chart?.destroy()
            chart = undefined
        })

        async function fetchChartCreate() {
            ensureDemoTemplates()
            await nextTick()
            chart = new OrgChart(element.value, {
                layout: OrgChart.layout.treeRightOffset,
                mouseScroll: OrgChart.action.ctrlZoom,
                nodeMouseClick: OrgChart.action.none,
                searchFields: ['name', 'title'],
                nodes,
                tags: {
                    item: { template: 'item' }
                },
                controls: {
                    zoom_in: { title: '放大' },
                    zoom_out: { title: '缩小' },
                    full_screen: { title: '切换全屏模式' },
                    layout_mixed: { title: '树状布局', anchor: OrgChart.anchor.right },
                    layout_grid: { title: '网格布局', anchor: OrgChart.anchor.right },
                    layout_left_offset: { title: '左偏移布局', anchor: OrgChart.anchor.right },
                    layout_right_offset: {
                        title: '右偏移布局',
                        anchor: OrgChart.anchor.right
                    }
                },
                nodeBinding: {
                    field_0: 'name'
                }
            })

            chart.onRedraw(() => mountVueNodes(chart as OrgChart))
            chart.onNodeClick((args: Omix<{ node: Omix; event: MouseEvent }>) => {
                return emit('node-click', chart?.get(args.node.id), args)
            })

            return chart
        }

        return () => <div class="common-chart-dept-manager w-full h-full"></div>
    }
})
</script>

<style lang="scss" scoped>
.common-chart-dept-manager {
    :deep(.boc-edit-form) {
        display: none !important;
    }
}
</style>
