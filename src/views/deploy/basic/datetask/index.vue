<script lang="tsx">
import { defineComponent } from 'vue'
import { useChunkService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeployBasicDatetask',
    setup(props, ctx) {
        /**系统任务静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSkylineDatetaskEnums(), {
            immediate: true,
            tabName: 'TASK_SYSTEM'
        })

        return () => (
            <layout-common-container class-name="p-14 overflow-hidden">
                <n-tabs
                    animated
                    type="line"
                    tabs-padding={14}
                    default-value="TASK_SYSTEM"
                    style={{ '--n-tab-gap': '20px' }}
                    class="common-base-tabser inset-absolute inset-border flex-1 overflow-hidden"
                    v-model:value={chunkState.tabName}
                >
                    {(
                        chunkOptions.value.moduleOptions ?? [
                            { value: 'TASK_SYSTEM', label: '系统' },
                            { value: 'TASK_FINANCE', label: '财务' },
                            { value: 'TASK_CRM', label: 'CRM' }
                        ]
                    ).map((item: Omix) => (
                        <n-tab-pane
                            name={item.value}
                            display-directive="show:lazy"
                            tab={<common-base-tab-title initialize={chunkState.initialize} title={item.label} />}
                        >
                            <deploy-datetask-list-container
                                node={item}
                                chunk-state={chunkState}
                                chunk-options={chunkOptions.value}
                            ></deploy-datetask-list-container>
                        </n-tab-pane>
                    ))}
                </n-tabs>
            </layout-common-container>
        )
    }
})
</script>
