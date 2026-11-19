// url=https://www.figma.com/design/RQQ1jQ0fcs5YiZBIJlA2Id/Next-Gen-Bundle-Architecture?node-id=134-57056
// source=lightning/buttonIcon
// component=lightning-button-icon
import figma from 'figma'
const instance = figma.selectedInstance

const alternativeText = instance.getString('Alternative Text')

export default {
  example: figma.code`<lightning-button-icon
  icon-name="utility:add"
  variant="border"
  alternative-text="${alternativeText}"
  title="${alternativeText}">
</lightning-button-icon>`,
  imports: [],
  id: 'lwc-3o1g0ksgj78',
  metadata: { nestable: true }
}
