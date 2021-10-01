<template>
  <v-card
    width="100%"
    elevation="2"
    style="padding: 10px 30px;"
  >
    <PieChart :chart-data="chart_data" :options="chart_options" />
  </v-card>
</template>

<script>
  import PieChart from './PieChart.js';
  import axios from 'axios';
  import api_server from '../../../apiserverpath';

  export default {
    components: {
      PieChart,
    },
    
    data () {
      return {
        chart_data: null,
        // グラフの見た目とか
        chart_options: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              boxWidth: 10
            }
          }
        }
      }
    },

    mounted () {
      this.fillData()
    },

    methods: {
      async fillData () {
        const name = this.$store.getters.doneName;
        const res = await axios.get(api_server.path + "/graph/pie_chart", {headers: {name: name}});
        // TODO
        // res -> {教科: 勉強時間, 教科2, 勉強時間, ...}

        this.chart_data = {
          labels: res.data.labels,
          datasets: [{
            label: '',
            data: res.data.data_list,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
              borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        }
      },
    }
  }
</script>
