/**递归移除树节点中的空子节点集合，避免树组件将叶子节点误判为可展开节点。*/
export function normalizeTreeChildren(nodes: Array<Omix>): Array<Omix> {
    return nodes.map(node => {
        const normalized = { ...node }
        if (Array.isArray(normalized.children)) {
            if (normalized.children.length === 0) {
                delete normalized.children
            } else {
                normalized.children = normalizeTreeChildren(normalized.children)
            }
        }
        return normalized
    })
}
