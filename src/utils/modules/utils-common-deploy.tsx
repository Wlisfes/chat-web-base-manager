/**将带成员的组织树展平为组织图节点。*/
export function mapDeployOrganizationChartNodes<T extends Omix>(nodes: Array<T> = []): Array<T> {
    const result: Array<Omix> = []
    function walk(list: Array<Omix>, parentId?: number | string) {
        for (const node of list) {
            const id = node.keyId ?? node.id
            result.push({ ...node, id, pid: parentId, name: node.name, tags: [node.type] })
            for (const item of node.members ?? []) {
                result.push({ ...item, pid: id, tags: ['user'], id: `user:${id}:${item.uid}`, name: `${item.name} ${item.number}` })
            }
            walk(node.children ?? [], id)
        }
    }
    walk(nodes)
    return result as Array<T>
}

