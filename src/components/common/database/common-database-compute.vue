<script lang="tsx">
import { defineComponent, PropType, VNode, Fragment } from 'vue'
import { DataTableColumn } from 'naive-ui'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'CommonDatabaseCompute',
    emits: ['refresh', 'checkboxs', 'update:full', 'update:loading', 'update:columns', 'update:checkboxs'],
    props: {
        /**页面标题**/
        title: { type: [String, Object] as PropType<VNode> },
        /**展示操作**/
        keys: { type: Array as PropType<Array<string>>, default: () => [] },
        /**开启全屏**/
        full: { type: Boolean, default: false },
        /**全屏方法**/
        toggle: { type: Function, default: () => false },
        /**左侧容器样式**/
        elementClass: { type: String, default: '' },
        /**加载中**/
        loading: { type: Boolean, default: false },
        /**表头配置**/
        columns: { type: Array as PropType<Array<Omix<DataTableColumn>>>, default: () => [] }
    },
    setup(props, { slots, emit }) {
        const { full, loading, columns } = useVModels(props)

        return () => (
            <n-element class="common-database-compute flex gap-10">
                {props.title && (
                    <n-element class="flex items-center">
                        <n-h3 class="m-0! line-height-22" prefix="bar" style={{ '--n-bar-width': '4px' }}>
                            {props.title}
                        </n-h3>
                    </n-element>
                )}
                <n-element class={`flex flex-1 gap-10 ${props.elementClass}`}>{slots.default && slots.default()}</n-element>
                {props.keys.length > 0 && (
                    <div class="flex items-center">
                        {props.keys.includes('refresh') && (
                            <Fragment>
                                <common-element-button
                                    text
                                    class="h-full p-inline-6"
                                    icon="nest-refresh"
                                    icon-size={22}
                                    disabled={loading.value}
                                    loading={loading.value}
                                    onClick={() => emit('refresh')}
                                ></common-element-button>
                                <n-divider class="m-0!" vertical />
                            </Fragment>
                        )}

                        {props.keys.includes('size') && (
                            <Fragment>
                                <common-database-element-size></common-database-element-size>
                                <n-divider class="m-0!" vertical />
                            </Fragment>
                        )}
                        {props.keys.includes('settings') && (
                            <Fragment>
                                <common-database-settings
                                    v-model:columns={columns.value}
                                    onCheckboxs={(s: Array<Omix<DataTableColumn>>) => emit('checkboxs', s)}
                                ></common-database-settings>
                                <n-divider class="m-0!" vertical />
                            </Fragment>
                        )}
                        {props.keys.includes('full') && (
                            <Fragment>
                                <common-element-button
                                    text
                                    class="h-full p-inline-6"
                                    icon={full.value ? 'nest-shrink' : 'nest-screen'}
                                    icon-size={22}
                                    onClick={props.toggle}
                                ></common-element-button>
                            </Fragment>
                        )}
                    </div>
                )}
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.common-database-compute {
    position: relative;
    :deep(.n-base-loading.n-icon-slot) {
        width: 20px;
        height: 20px;
        font-size: 20px;
    }
}
</style>
