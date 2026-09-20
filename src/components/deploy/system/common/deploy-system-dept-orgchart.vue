<script lang="tsx">
import { defineComponent, onMounted, watch, render, PropType } from 'vue'
import { fetchBaseTemplates, fetchCloneTemplates, fetchForeignTemplates } from '@/utils'
import { ChartOptions, fetchChartInitialization, fetchCreateVNode } from '@/utils'
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

        function fetchCreateBalkan(data: Omix) {
            return fetchCreateVNode(<deploy-system-dept-balkan node={data}></deploy-system-dept-balkan>)
        }

        async function fetchInitTemplates() {
            return fetchCloneTemplates('user', fetchBaseTemplates('ana', { w: 200, h: 80 }), { w: 200, h: 40 }, (node, data) => {
                const root = document.createElement('div')
                render(fetchCreateBalkan(data), root)
                return fetchForeignTemplates(node, root.innerHTML)
            })
        }

        onMounted(fetchInitialization)
        async function fetchInitialization() {
            return await fetchInitTemplates().then(async () => {
                const chart = await fetchChartInitialization(element.value, {
                    mode: theme.value,
                    paddingLeft: 150,
                    nodes: props.items,
                    searchFields: ['name'],
                    nodeBinding: { field_0: 'name' },
                    tags: {
                        dept: { template: 'ana' },
                        user: { template: 'user' }
                    }
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

        return () => <common-element is-white class="deploy-system-dept-orgchart w-full h-full"></common-element>
    }
})
</script>
