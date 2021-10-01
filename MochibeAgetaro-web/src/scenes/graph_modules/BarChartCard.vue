<template>
  <v-card
    width="100%"
    elevation="1"
    style="padding: 10px 30px;"
  >
    <v-container>
      <v-row>
        <v-col 
          v-for="item in total_min"
          :key="item.name"
          :cols="12 / total_min.length" 
        >
          <div style="display:flex; justify-content:space-between;">
            <p>{{item.name}}</p>
            <p>{{ addTheCorrectUnits(item.time_goal[0]) }}</p>
          </div>
          <vue-slider 
            v-model="item.time_goal" 
            :process="process"
            :dot-options="dotOptions"
            style="padding: 20% 0px 0px 0px;" 
          >
            <template v-slot:dot="{index}">
              <div v-if="index === 1" class="slider_dot" />
              <div v-else style="pointer-events: none;" /> 
            </template>
            <template v-slot:tooltip="{ value }">
              <div class="slider_tooltip">
                <p style="transform: rotate(-225deg); color: white; text-align: center;">{{ value }}</p>
              </div>
            </template>
          </vue-slider>
        </v-col>
      </v-row>
    </v-container>
    <bar-chart 
      :chart-data="chart_data" 
      :options="chart_options"
      ref="chart"
    ></bar-chart>
  </v-card>
</template>

<script>
  import BarChart from './BarChart.js';
  import axios from 'axios';
  import api_server from '../../../apiserverpath';
  import VueSlider from 'vue-slider-component';
  import 'vue-slider-component/theme/default.css';

  export default {
    components: {
      BarChart,
      VueSlider,
    },
    
    data () {
      return {
        total_min: [
          { name: "先週", time_goal: [0, 10] },
          { name: "今日", time_goal: [30, 50] },
          { name: "今週", time_goal: [0, 60] },
        ],
        process: dotsPos => [
          [0, dotsPos[0], { backgroundColor: 'red' }],
          [dotsPos[0], dotsPos[1], { backgroundColor: 'transparent' }],
        ],
        dotOptions: [{tooltip: 'none'}, {tooltip: 'always'}],
        chart_data: null,          // グラフのデータ
        // グラフの見た目とか
        chart_options: {
          responsive: true,
          // maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              display: true,
              id: 'y-axis-1',
              position: 'right',
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 6,
              },
            }]
          },
          annotation: {
            annotations: [{
              type: 'line',
              scaleID: 'y-axis-1',
              mode: 'horizontal',
              value: 0,
              borderColor: '#ffa200',
              borderWidth: 2,
              label: {
                enabled: true,
                content: 'ゴール',
                backgroundColor: "#ffa200"
              }
            }]
          }
        }
      }
    },

    mounted () {
      this.fillData();
      this.$refs.chart.options.annotation.annotations[0].value = this.total_min[1].time_goal[1];
    },

    computed: {
      customStyle(){
        return "border-radius: 0px; height: "
      }
    },

    methods: {
      async fillData () {
        const name = this.$store.getters.doneName;
        const totalTime = await axios.get(api_server.path + "/graph/totaltime", {headers: {name: name}});
        
        this.total_min[0].time_goal[0] = totalTime.data.last_week_data;
        this.total_min[1].time_goal[0] = totalTime.data.today_data;
        this.total_min[2].time_goal[0] = totalTime.data.this_week_data;

        console.log(this.total_min)

        const barChar = await axios.get(api_server.path + "/graph/bar_chart", {headers: {name: name}});

        const dataLength = barChar.data.data_list.length;
        const backgroundColor = Array(dataLength).fill('rgba(128, 128, 128, 0.2)');
        const borderColor = Array(dataLength).fill('rgba(128, 128, 128, 1.0)');

        this.chart_data = {
          labels: barChar.data.labels,
          datasets: [{
            label: '',
            data: barChar.data.data_list,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
          }]
        }
      },

      // 正しい単位を付けて文字列を返す
      addTheCorrectUnits(min) {
        if (min < 60) {
          return `${min}分`;
        } else {
          return `${Math.floor(min / 60)}時間`;
        }
      },
    }
  }
</script>

<style scoped>
  .right_bottom{
    position: absolute; 
    bottom: 10px; 
    right: 10px
  }
  .config-list-move{
    transition: transform 1s;
  }
  .slider_dot{
    width: 20%;
    height: 20px;
    background-color: rgb(255, 162, 0);
    border-radius: 0px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  .slider_tooltip{
    width: 25px;
    height: 25px;
    border-radius: 0% 100% 100% 100%/ 100% 100% 100% 100%;
    background-color: rgb(255, 162, 0);
    transform: rotate(225deg);
  }
</style>
