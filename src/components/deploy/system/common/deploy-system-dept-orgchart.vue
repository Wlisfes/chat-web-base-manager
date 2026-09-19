<script lang="tsx">
import { defineComponent, onMounted, watch } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { useConfiger, useStore } from '@/store'
import { fetchChartInitialization, fetchAnaTemplates, fetchChunkTemplates } from '@/utils'

export default defineComponent({
    name: 'DeploySystemDeptOrgchart',
    emits: ['node-click'],
    setup(props, { emit }) {
        const { theme } = useStore(useConfiger)
        const element = useCurrentElement<HTMLElement>()
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

        onMounted(fetchChartCreate)
        async function fetchChartCreate() {
            return await fetchChunkTemplates(fetchAnaTemplates({ w: 200, h: 80 }), { w: 200, h: 40 }).then(async () => {
                const chart = await fetchChartInitialization(element.value, {
                    mode: theme.value,
                    nodes,
                    searchFields: ['name'],
                    nodeBinding: {
                        field_0: 'name'
                    }
                })
                chart.onNodeClick((args: Omix<{ node: Omix; event: MouseEvent }>) => {
                    console.log(args)
                    return emit('node-click', args)
                })
                return watch(theme, value => {
                    chart.config.mode = value
                    chart.mainElement.classList.remove('boc-dark', 'boc-light')
                    chart.mainElement.classList.add(`boc-${value}`)
                })
            })
        }

        return () => <n-element class="deplo-system-dept-orgchart w-full h-full"></n-element>
    }
})
</script>

<style lang="scss" scoped>
.deplo-system-dept-orgchart {
    position: relative;

    :deep(circle.boc-hoverable) {
        fill: #ffffff;
        transition: fill 0.3s var(--cubic-bezier-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
    }

    :deep(.boc-dark circle.boc-hoverable) {
        fill: #1e1e1e;
    }
}
</style>
