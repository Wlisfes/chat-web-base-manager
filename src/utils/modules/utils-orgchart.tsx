import { Add, Subtract, FitToScreen, ZoomIn, ZoomOut } from '@vicons/carbon'
import { fetchCreateSvgIcon, OrgChart } from '@/utils'
OrgChart.SEARCH_PLACEHOLDER = '请输入...'

export interface ArgsOptions extends Omix {
    w: number
    h: number
}

export interface ChartOptions extends Omix, OrgChart.options {
    nodes: Array<Omix<OrgChart.nodeData>>
}

/**默认根节点**/
export function fetchRootTemplates(node: Omix) {
    return `<rect x="0" y="0" width="${node.w}" height="${node.h}" fill="none"></rect>`
}

/**自定义根节点**/
export function fetchForeignTemplates(node: OrgChart.node, html: string) {
    return `<foreignObject x="0" y="0" width="${node.w}" height="${node.h}">
        <div xmlns="http://www.w3.org/1999/xhtml" data-vue-node="${node.id}" class="w-full h-full">${html ?? ''}</div>
    </foreignObject>`
}

/**基于根节点容器克隆一份新的配置**/
export function fetchBaseTemplates(
    key: string,
    options: ArgsOptions,
    render: (node: OrgChart.node, data: OrgChart.nodeData, template: OrgChart.template, config: OrgChart.options) => string
) {
    OrgChart.templates[key] = Object.assign({}, OrgChart.templates.ana, {
        size: [options.w, options.h],
        node: fetchRootTemplates,
        field_0: render
    })
}

export async function fetchChartInitialization(element: HTMLElement, options: ChartOptions) {
    const chart = new OrgChart(
        element,
        Object.assign({}, options, {
            orientation: OrgChart.orientation.left,
            layout: OrgChart.layout.mixed,
            align: OrgChart.align.center,
            scaleInitial: 1,
            mouseScroll: OrgChart.action.ctrlZoom,
            nodeMouseClick: OrgChart.action.none,
            levelSeparation: 50,
            mixedHierarchyNodesSeparation: 15,
            subtreeSeparation: 20,
            siblingSeparation: 20,
            controls: Object.assign({}, options.controls ?? {}, {
                zoom_in: { title: '放大', icon: fetchCreateSvgIcon(ZoomIn, 26) },
                zoom_out: { title: '缩小', icon: fetchCreateSvgIcon(ZoomOut, 26) },
                full_screen: { title: '切换全屏模式', icon: fetchCreateSvgIcon(FitToScreen, 24) },
                layout_mixed: { title: '混合布局', anchor: OrgChart.anchor.right },
                layout_normal: { title: '正常布局', anchor: OrgChart.anchor.right },
                layout_tree: { title: '树形布局', anchor: OrgChart.anchor.right },
                layout_grid: { title: '网格布局', anchor: OrgChart.anchor.right },
                layout_left_offset: { title: '左偏移布局', anchor: OrgChart.anchor.right },
                layout_right_offset: { title: '右偏移布局', anchor: OrgChart.anchor.right }
            })
        })
    )
    return chart
}
