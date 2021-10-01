<template>
  <v-app>
    <NavigationBar />
    <background>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <p style="margin: 10px 0px">勉強した時間</p>
            <BarChartCard />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <p style="margin: 10px 0px">時間配分</p>
            <PieChartCard />
          </v-col>
        </v-row>
      </v-container>
    </background>
  </v-app>
</template>

<script>
import BarChartCard from './graph_modules/BarChartCard';
import PieChartCard from './graph_modules/PieChartCard';
import NavigationBar from "./common_modules/NavigationBar";
import Background from './common_modules/background.vue';

export default {
  name: 'GraphView',

  components: {
    BarChartCard,
    PieChartCard,
    NavigationBar,
    Background
  }
};
</script>

<style scoped>
    
</style>
