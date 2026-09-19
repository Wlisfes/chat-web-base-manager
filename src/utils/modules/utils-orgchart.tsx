import OrgChart from 'balkan-orgchart-js'
import { createVNode, render } from 'vue'
import { cloneDeep } from 'lodash-es'
OrgChart.SEARCH_PLACEHOLDER = '请输入...'

export interface ArgsOptions extends Omix {
    w: number
    h: number
}

export function fetchRootTemplates(node: Omix) {
    return `<rect x="0" y="0" width="${node.w}" height="${node.h}" fill="none"></rect>`
}

export function fetchForeignTemplates(node: OrgChart.node, data: OrgChart.nodeData, template: OrgChart.template, config: OrgChart.options) {
    const element = createVNode(<div data-vue-node={node.id} class="bg-red" style={`width:${node.w}px;height:${node.h}px;`}></div>)
    const div = document.createElement('div')
    render(element, div)
    console.log(data)
    return `<foreignObject x="0" y="0" width="${node.w}" height="${node.h}">${div.innerHTML}</foreignObject>`
}

export function fetchAnaTemplates(options: ArgsOptions) {
    return Object.assign(OrgChart.templates.ana, {
        size: [options.w, options.h],
        node: fetchRootTemplates,
        field_0: fetchForeignTemplates
    })
}

export async function fetchChunkTemplates(ana: OrgChart.template, options: ArgsOptions) {
    return (OrgChart.templates.item = Object.assign(cloneDeep(ana), {
        size: [options.w, options.h],
        node: fetchRootTemplates,
        field_0: fetchForeignTemplates
    }))
}

export async function fetchChartInitialization(element: HTMLElement, options: OrgChart.options) {
    return new OrgChart(
        element,
        Object.assign(
            {
                layout: OrgChart.layout.treeRightOffset,
                mouseScroll: OrgChart.action.ctrlZoom,
                nodeMouseClick: OrgChart.action.none,
                levelSeparation: 50,
                mixedHierarchyNodesSeparation: 15,
                subtreeSeparation: 20,
                siblingSeparation: 20,
                tags: { item: { template: 'item' } },
                controls: {
                    zoom_in: { title: '放大' },
                    zoom_out: { title: '缩小' },
                    full_screen: { title: '切换全屏模式' },
                    layout_mixed: { title: '混合布局', anchor: OrgChart.anchor.right },
                    layout_normal: { title: '正常布局', anchor: OrgChart.anchor.right },
                    layout_tree: { title: '树形布局', anchor: OrgChart.anchor.right },
                    layout_grid: { title: '网格布局', anchor: OrgChart.anchor.right },
                    layout_left_offset: { title: '左偏移布局', anchor: OrgChart.anchor.right },
                    layout_right_offset: { title: '右偏移布局', anchor: OrgChart.anchor.right }
                }
            },
            cloneDeep(options)
        )
    )
}
