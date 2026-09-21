<script lang="tsx">
import { defineComponent, onMounted } from 'vue'
import { mapDeployOrganizationChartNodes } from '@/utils'
import { useSelectService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemDepartment',
    setup(props) {
        const organOptions = useSelectService(() => Service.httpBaseAccountOrganizationTreeUser(), {
            immediate: false,
            transform: mapDeployOrganizationChartNodes
        })
        onMounted(() => organOptions.fetchRequest())

        return () => (
            <layout-common-container class="absolute inset-0" class-name="flex-col overflow-hidden">
                <common-base-wrapper loading={organOptions.loading.value} initialize={organOptions.initialize.value}>
                    <deploy-system-dept-orgchart items={organOptions.dataSource.value}></deploy-system-dept-orgchart>
                </common-base-wrapper>
            </layout-common-container>
        )
    }
})
</script>
