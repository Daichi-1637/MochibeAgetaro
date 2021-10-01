import { Bar, mixins } from 'vue-chartjs'
import chartjsPluginAnnotation from 'chartjs-plugin-annotation'
const { reactiveProp } = mixins

export default {
  extends: Bar,
  mixins: [reactiveProp],
  props: {
    'chartData': Object,
    'options': Object,
  },
  mounted () {
    this.addPlugin([chartjsPluginAnnotation])
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
  }
}
