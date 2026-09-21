<script lang="tsx">
import { defineComponent, onMounted, watch, render, PropType } from 'vue'
import { ChartOptions, fetchChartInitialization, fetchCreateVNode, fetchBaseTemplates, fetchForeignTemplates } from '@/utils'
import { useCurrentElement } from '@vueuse/core'
import { useConfiger, useStore } from '@/store'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemDeptOrgchart',
    props: {
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

        onMounted(fetchInitialization)
        async function fetchInitialization() {
            console.log(props.items)
            return await fetchInitTemplates().then(async () => {
                const chart = await fetchChartInitialization(element.value, {
                    mode: theme.value,
                    paddingLeft: 150,
                    nodes: props.items,
                    searchFields: ['name'],
                    nodeBinding: { field_0: 'name' },
                    tags: {
                        company: { template: 'company' },
                        department: { template: 'department' },
                        user: { template: 'user' }
                    }
                })
                chart.onInit(() => {
                    const [left, top, right, bottom] = chart.getViewBox()
                    chart.setViewBox([-150, top, right, bottom])
                })
                chart.onNodeClick((args: Omix<{ node: Omix; event: MouseEvent }>) => {
                    console.log(args, chart.get(args.node.id))
                })
                return watch(theme, value => {
                    chart.config.mode = value
                    chart.mainElement.classList.remove('boc-dark', 'boc-light')
                    chart.mainElement.classList.add(`boc-${value}`)
                    chart.draw()
                })
            })
        }

        return () => <common-base-element is-white class="deploy-system-dept-orgchart w-full h-full"></common-base-element>
    }
})
</script>
