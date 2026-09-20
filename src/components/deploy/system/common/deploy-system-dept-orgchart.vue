<script lang="tsx">
import { fetchChartInitialization, fetchBaseTemplates, fetchCloneTemplates, fetchForeignTemplates, fetchCreateVNode } from '@/utils'
import { defineComponent, onMounted, watch, render } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { useConfiger, useStore } from '@/store'

export default defineComponent({
    name: 'DeploySystemDeptOrgchart',
    setup(props, { emit }) {
        const { theme } = useStore(useConfiger)
        const element = useCurrentElement<HTMLElement>()
        const nodes = [
            { id: 1, name: 'Office of the Executive Director', tags: ['dept'] },

            { id: 2, pid: 1, name: 'National Regional Offices', tags: ['dept'] },
            { id: 3, pid: 1, name: 'Office of Compliance Director', tags: ['dept'] },
            { id: 4, pid: 1, name: 'Division of Operational Services', tags: ['dept'] },
            { id: 5, pid: 1, name: 'Division of Policy & Strategy', tags: ['dept'] },
            { id: 6, pid: 1, name: 'Division of Administrative Services', tags: ['dept'] },

            { id: 7, pid: 2, name: 'North Region', tags: ['user'] },
            { id: 8, pid: 2, name: 'South Region', tags: ['user'] },
            { id: 9, pid: 2, name: 'East Region', tags: ['user'] },
            { id: 10, pid: 2, name: 'West Region', tags: ['user'] },
            { id: 11, pid: 2, name: 'Central Region', tags: ['user'] },
            { id: 12, pid: 2, name: 'International Region', tags: ['user'] },

            { id: 13, pid: 3, name: 'Inspection Services', tags: ['user'] },
            { id: 14, pid: 3, name: 'Audit & Review', tags: ['user'] },

            { id: 15, pid: 4, name: 'Scheduling & Coordination', tags: ['user'] },
            { id: 16, pid: 4, name: 'Performance Monitoring', tags: ['user'] },
            { id: 17, pid: 4, name: 'Quality Management', tags: ['user'] },
            { id: 18, pid: 4, name: 'National Initiatives', tags: ['user'] },
            { id: 19, pid: 4, name: 'Systems & Data Services', tags: ['user'] },

            { id: 20, pid: 5, name: 'Regulatory Affairs', tags: ['user'] },
            { id: 21, pid: 5, name: 'Policy Development', tags: ['user'] },
            { id: 22, pid: 5, name: 'Training & Education', tags: ['user'] },
            { id: 23, pid: 5, name: 'Public Outreach', tags: ['user'] },
            { id: 24, pid: 5, name: 'Support Services Branch', tags: ['user'] },

            { id: 25, pid: 6, name: 'Financial Management', tags: ['user'] },
            { id: 26, pid: 6, name: 'Human Capital Management', tags: ['user'] },
            { id: 27, pid: 6, name: 'Information Technology Services', tags: ['user'] }
        ]

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
                    nodes,
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
                })
            })
        }

        return () => <n-element class={`deploy-system-dept-orgchart w-full h-full boc-${theme.value}`}></n-element>
    }
})
</script>
