<script lang="tsx">
import OrgChart from 'balkan-orgchart-js'
import { defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'

/**
 * 官方 TreeRightOffset 案例：https://balkan.app/OrgChartJS/Demos/treerightoffset
 * 源码：https://code.balkan.app/orgchart-js/treerightoffset
 */

const CHART_NODES = [
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

const ensureDemoTemplates = () => {
    OrgChart.templates.item = Object.assign({}, OrgChart.templates.ana)
    OrgChart.templates.item.size = [250, 40]
    OrgChart.templates.item.node = `<rect x="0" y="0" height="40" width="250" fill="none"></rect>`
    OrgChart.templates.item.field_0 = `<text data-width="230" data-text-overflow="ellipsis" style="font-size: 24px;" fill="#424242" x="20" y="25" text-anchor="start">{val}</text>`

    OrgChart.templates.ana.node = function (node: any, data: any) {
        let color = '#039BE5'
        let height = node.h
        if (data.tags && data.tags[0] === 'head') {
            color = '#FFCA28'
        } else if (node.parent != null) {
            color = '#FFF'
            height = 40
        }
        return `<rect x="0" y="0" height="${height}" width="${node.w}" fill="${color}"></rect>`
    }

    OrgChart.templates.ana.field_0 = function (node: any, _data: any, _template: any, _config: any, value: string) {
        const color = node.parent == null ? '#fff' : '#424242'
        return OrgChart.wrapText(
            value,
            `<text style="font-size: 24px;" fill="${color}" x="${node.w / 2}" y="55" text-anchor="middle"></text>`,
            node.w - 30,
            2
        )
    }
}

export default defineComponent({
    name: 'MainManagerOrgchart',
    setup() {
        const treeRef = ref<HTMLElement>()
        let chart: OrgChart | null = null

        const createChart = async () => {
            await nextTick()
            if (!treeRef.value) {
                return
            }

            chart?.destroy()
            chart = null
            ensureDemoTemplates()

            chart = new OrgChart(treeRef.value, {
                layout: OrgChart.layout.treeRightOffset,
                mouseScroll: OrgChart.action.scroll,
                enableSearch: false,
                nodeBinding: {
                    field_0: 'name'
                },
                tags: {
                    item: {
                        template: 'item'
                    }
                }
            })

            chart.load(CHART_NODES)
        }

        onMounted(createChart)
        onUnmounted(() => {
            chart?.destroy()
            chart = null
        })

        return () => (
            <div class="main-manager-orgchart">
                <div ref={treeRef} class="main-manager-orgchart__tree"></div>
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.main-manager-orgchart,
.main-manager-orgchart__tree {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
