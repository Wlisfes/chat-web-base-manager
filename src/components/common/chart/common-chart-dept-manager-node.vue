<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
    name: 'CommonChartDeptManagerNode',
    emits: ['click'],
    props: {
        data: { type: Object as PropType<Record<string, any>>, required: true }
    },
    setup(props, { emit }) {
        const kind = computed(() => {
            if (props.data.tags?.includes('item')) return 'item'
            if (props.data.tags?.includes('head')) return 'head'
            return 'root'
        })

        return () => (
            <div
                class={['common-chart-dept-manager-node', `is-${kind.value}`]}
                onClick={(event: MouseEvent) => {
                    event.stopPropagation()
                    emit('click', props.data)
                }}
            >
                <span class="common-chart-dept-manager-node__name">{props.data.name}</span>
            </div>
        )
    }
})
</script>

<style lang="scss">
.common-chart-dept-manager-node {
    box-sizing: border-box;
    display: flex;
    width: 100%;
    height: 100%;
    padding: 8px 12px;
    font-size: 16px;
    line-height: 1.3;
    cursor: pointer;
    user-select: none;
}

.common-chart-dept-manager-node.is-root,
.common-chart-dept-manager-node.is-head {
    align-items: center;
    justify-content: center;
    text-align: center;
}

.common-chart-dept-manager-node.is-root {
    background: #039be5;
    color: #fff;
}

.common-chart-dept-manager-node.is-head {
    background: #ffca28;
    color: #424242;
}

.common-chart-dept-manager-node.is-item {
    align-items: center;
    justify-content: flex-start;
    padding-left: 20px;
    color: #424242;
    background: transparent;
}

.common-chart-dept-manager-node__name {
    display: -webkit-box;
    overflow: hidden;
    word-break: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}
</style>
