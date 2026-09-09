<script lang="tsx">
import { computed, defineComponent, PropType, ref } from 'vue'

interface OrganizationNode {
    key: string
    name: string
    role: string
    description: string
    children?: OrganizationNode[]
}

const organizationData: OrganizationNode = {
    key: 'general-manager',
    name: '李明',
    role: '总经理',
    description: '统筹公司经营与战略规划',
    children: [
        {
            key: 'technology-center',
            name: '张伟',
            role: '技术中心',
            description: '负责产品研发与技术建设',
            children: [
                {
                    key: 'frontend-group',
                    name: '王芳',
                    role: '前端研发组',
                    description: '负责管理端与客户端研发'
                },
                {
                    key: 'backend-group',
                    name: '陈杰',
                    role: '后端研发组',
                    description: '负责服务端与基础设施研发'
                }
            ]
        },
        {
            key: 'business-center',
            name: '刘静',
            role: '业务中心',
            description: '负责客户增长与业务运营',
            children: [
                {
                    key: 'sales-group',
                    name: '赵磊',
                    role: '销售组',
                    description: '负责客户开发与商务合作'
                },
                {
                    key: 'operation-group',
                    name: '周敏',
                    role: '运营组',
                    description: '负责用户运营与数据分析'
                }
            ]
        },
        {
            key: 'support-center',
            name: '孙强',
            role: '职能中心',
            description: '负责企业内部职能保障',
            children: [
                {
                    key: 'finance-group',
                    name: '吴倩',
                    role: '财务组',
                    description: '负责财务核算与经营分析'
                },
                {
                    key: 'human-resource-group',
                    name: '郑欣',
                    role: '人力资源组',
                    description: '负责人才发展与组织建设'
                }
            ]
        }
    ]
}

const collectBranchKeys = (node: OrganizationNode): string[] => {
    if (!node.children?.length) {
        return []
    }

    return [node.key, ...node.children.flatMap(collectBranchKeys)]
}

const OrganizationChartNode = defineComponent({
    name: 'OrganizationChartNode',
    props: {
        node: {
            type: Object as PropType<OrganizationNode>,
            required: true
        },
        collapsedKeys: {
            type: Object as PropType<Record<string, boolean>>,
            required: true
        },
        selectedKey: {
            type: String,
            required: true
        },
        toggleNode: {
            type: Function as PropType<(key: string) => void>,
            required: true
        },
        selectNode: {
            type: Function as PropType<(key: string) => void>,
            required: true
        }
    },
    setup(props) {
        const children = computed(() => props.node.children ?? [])
        const hasChildren = computed(() => children.value.length > 0)
        const isCollapsed = computed(() => props.collapsedKeys[props.node.key] === true)

        const handleNodeKeydown = (event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return
            }

            event.preventDefault()
            props.selectNode(props.node.key)
        }

        return () => (
            <table class="organization-chart-table">
                <tbody>
                    <tr>
                        <td colspan={Math.max(children.value.length * 2, 1)}>
                            <div
                                class={['organization-chart-node', { 'organization-chart-node--selected': props.selectedKey === props.node.key }]}
                                role="treeitem"
                                tabindex="0"
                                aria-selected={props.selectedKey === props.node.key}
                                aria-expanded={hasChildren.value ? !isCollapsed.value : undefined}
                                onClick={() => props.selectNode(props.node.key)}
                                onKeydown={handleNodeKeydown}
                            >
                                <div class="organization-chart-node__role">{props.node.role}</div>
                                <div class="organization-chart-node__name">{props.node.name}</div>
                                <div class="organization-chart-node__description">{props.node.description}</div>
                                {hasChildren.value ? (
                                    <button
                                        class="organization-chart-node__toggle"
                                        type="button"
                                        aria-label={`${isCollapsed.value ? '展开' : '收起'}${props.node.role}`}
                                        onClick={(event: MouseEvent) => {
                                            event.stopPropagation()
                                            props.toggleNode(props.node.key)
                                        }}
                                    >
                                        <span class={['organization-chart-node__arrow', { 'organization-chart-node__arrow--collapsed': isCollapsed.value }]}>
                                            ↓
                                        </span>
                                    </button>
                                ) : null}
                            </div>
                        </td>
                    </tr>
                    {hasChildren.value && !isCollapsed.value ? (
                        <>
                            <tr class="organization-chart-connector-down">
                                <td colspan={children.value.length * 2}>
                                    <div></div>
                                </td>
                            </tr>
                            <tr class="organization-chart-connectors" aria-hidden="true">
                                {children.value.flatMap((child, index) => [
                                    <td
                                        key={`${child.key}-left`}
                                        class={['organization-chart-connector-left', { 'organization-chart-connector-top': index !== 0 }]}
                                    ></td>,
                                    <td
                                        key={`${child.key}-right`}
                                        class={['organization-chart-connector-right', {
                                            'organization-chart-connector-top': index !== children.value.length - 1
                                        }]}
                                    ></td>
                                ])}
                            </tr>
                            <tr class="organization-chart-children" role="group">
                                {children.value.map(child => (
                                    <td key={child.key} colspan="2">
                                        <OrganizationChartNode
                                            node={child}
                                            collapsedKeys={props.collapsedKeys}
                                            selectedKey={props.selectedKey}
                                            toggleNode={props.toggleNode}
                                            selectNode={props.selectNode}
                                        ></OrganizationChartNode>
                                    </td>
                                ))}
                            </tr>
                        </>
                    ) : null}
                </tbody>
            </table>
        )
    }
})

export default defineComponent({
    name: 'Home',
    setup() {
        const collapsedKeys = ref<Record<string, boolean>>({})
        const selectedKey = ref(organizationData.key)
        const branchKeys = collectBranchKeys(organizationData)

        const toggleNode = (key: string) => {
            collapsedKeys.value = {
                ...collapsedKeys.value,
                [key]: !collapsedKeys.value[key]
            }
        }

        const expandAll = () => {
            collapsedKeys.value = {}
        }

        const collapseAll = () => {
            collapsedKeys.value = Object.fromEntries(branchKeys.map(key => [key, true]))
        }

        return () => (
            <div class="home-page">
                <n-card class="organization-card" content-class="organization-card__content">
                    <div class="organization-header">
                        <div>
                            <h1>组织架构</h1>
                            <p>查看公司部门层级及负责人信息</p>
                        </div>
                        <n-space>
                            <n-button secondary focusable={false} onClick={collapseAll}>
                                全部收起
                            </n-button>
                            <n-button type="primary" focusable={false} onClick={expandAll}>
                                全部展开
                            </n-button>
                        </n-space>
                    </div>
                    <div class="organization-chart-scroll">
                        <div class="organization-chart" role="tree" aria-label="公司组织架构">
                            <OrganizationChartNode
                                node={organizationData}
                                collapsedKeys={collapsedKeys.value}
                                selectedKey={selectedKey.value}
                                toggleNode={toggleNode}
                                selectNode={key => (selectedKey.value = key)}
                            ></OrganizationChartNode>
                        </div>
                    </div>
                </n-card>
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.home-page {
    height: 100%;
    padding: 16px;
    overflow: hidden;
}

.organization-card {
    height: 100%;

    :deep(.organization-card__content) {
        display: flex;
        height: 100%;
        padding: 0;
        flex-direction: column;
        overflow: hidden;
    }
}

.organization-header {
    display: flex;
    padding: 20px 24px;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    border-bottom: 1px solid var(--n-border-color);

    h1 {
        margin: 0;
        color: var(--n-title-text-color);
        font-size: 20px;
        line-height: 28px;
    }

    p {
        margin: 4px 0 0;
        color: var(--n-text-color-3);
        font-size: 13px;
    }
}

.organization-chart-scroll {
    flex: 1;
    padding: 32px;
    overflow: auto;
}

.organization-chart {
    width: max-content;
    min-width: 100%;
}

.organization-chart-table {
    margin: 0 auto;
    border-spacing: 0;
    border-collapse: separate;

    > tbody > tr > td {
        padding: 0 12px;
        text-align: center;
        vertical-align: top;
    }
}

.organization-chart-node {
    position: relative;
    display: inline-flex;
    width: 208px;
    min-height: 116px;
    padding: 16px 18px;
    flex-direction: column;
    align-items: flex-start;
    border: 1px solid var(--n-border-color);
    border-radius: 8px;
    background: var(--n-color);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
    cursor: pointer;
    outline: none;
    transition:
        border-color 0.2s,
        box-shadow 0.2s,
        transform 0.2s;

    &:hover,
    &:focus-visible,
    &--selected {
        border-color: var(--n-color-target, #18a058);
        box-shadow: 0 6px 18px rgb(24 160 88 / 14%);
        transform: translateY(-2px);
    }

    &__role {
        width: 100%;
        color: var(--n-color-target, #18a058);
        font-size: 14px;
        font-weight: 600;
        line-height: 22px;
        text-align: left;
    }

    &__name {
        margin-top: 6px;
        color: var(--n-title-text-color);
        font-size: 16px;
        font-weight: 600;
        line-height: 24px;
    }

    &__description {
        margin-top: 4px;
        color: var(--n-text-color-3);
        font-size: 12px;
        line-height: 18px;
        text-align: left;
    }

    &__toggle {
        position: absolute;
        bottom: -12px;
        left: 50%;
        display: flex;
        width: 24px;
        height: 24px;
        padding: 0;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--n-color-target, #18a058);
        border-radius: 50%;
        background: var(--n-color);
        color: var(--n-color-target, #18a058);
        cursor: pointer;
        transform: translateX(-50%);

        &:focus-visible {
            outline: 2px solid var(--n-color-target, #18a058);
            outline-offset: 2px;
        }
    }

    &__arrow {
        display: block;
        font-size: 14px;
        line-height: 1;
        transition: transform 0.2s;

        &--collapsed {
            transform: rotate(-90deg);
        }
    }
}

.organization-chart-connector-down {
    height: 28px;

    td > div {
        width: 1px;
        height: 100%;
        margin: 0 auto;
        border-left: 1px solid var(--n-border-color);
    }
}

.organization-chart-connectors {
    height: 20px;

    td {
        padding: 0;
    }
}

.organization-chart-connector-left {
    border-right: 1px solid var(--n-border-color);
}

.organization-chart-connector-right {
    border-left: 1px solid var(--n-border-color);
}

.organization-chart-connector-top {
    border-top: 1px solid var(--n-border-color);
}

.organization-chart-children > td {
    padding-top: 0;
}

@media (max-width: 768px) {
    .home-page {
        padding: 12px;
    }

    .organization-header {
        padding: 16px;
        align-items: flex-start;
        flex-direction: column;
        gap: 12px;
    }

    .organization-chart-scroll {
        padding: 24px 16px;
    }
}
</style>
