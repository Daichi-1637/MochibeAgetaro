<template>
  <v-app class="home">
    <NavigationBar />

    <background>
      <PhotoDialog v-model="dialog" />
      <div class="stage" @click.self="moveAge">
        <div v-if="nowGoalIndex < 7" style="display: flex; position: absolute; bottom: -20px;"  >
          <img 
            :id="'back_img'+n"
            v-for="n in 3" :key="n"
            src="http://localhost:8080/img/buildings/office_street.png"
          >
        </div>
        <img class="goal" id="goal" :src="goals[nowGoalIndex].imagePath" height="55%">

        <AgeAvatorHidden ref="age_taro_hidden" />
        <Ivy />
        <ElevationSignboard :name="nowHeight.toString() + ' [m]'" />
        <AgeAvator ref="age_taro"/>
      </div>
    </background>
  </v-app>
</template>

<script>
  // About agetaro animation
  import AgeAvator from "./home_modules/ageAvator";
  import AgeAvatorHidden from "./home_modules/ageAvatorHidden";
  import ElevationSignboard from "./home_modules/elevationSignboard";
  import Ivy from "./home_modules/Ivy";
  // Navigation bar and hedder
  import NavigationBar from "./common_modules/NavigationBar";
  // To access api server
  import axios from "axios";
  import api_server from '../../apiserverpath';
  
  import Background from './common_modules/background.vue';
  
  import PhotoDialog from './common_modules/PhotoDialog.vue';

  export default {
    components: {
      AgeAvator,
      AgeAvatorHidden,
      ElevationSignboard,
      Ivy,
      NavigationBar,
      Background,
      PhotoDialog,
    },
    data(){
      return{
        dialog: false,
        y: 100,
        nowHeight: 0,
        goals: [
          {name: null, imagePath: "", height: 1},
          {name: "夢みなとタワー", imagePath: "http://localhost:8080/img/buildings/yumeminato_tower.png", height: 43},
          {name: "ピサの斜塔", imagePath: "http://localhost:8080/img/buildings/leaning_tower_of_pisa_resize.png", height: 56},
          {name: "自由の女神像", imagePath: "http://localhost:8080/img/buildings/statue_of_liberty.png", height: 93},
          {name: "エッフェル塔", imagePath: "http://localhost:8080/img/buildings/eiffel_tower.png", height: 300},
          {name: "東京タワー", imagePath: "http://localhost:8080/img/buildings/tokyo_tower.png", height: 333},
          {name: "東京スカイツリー", imagePath: "http://localhost:8080/img/buildings/tokyo_skytree_resize.png", height: 634},
          {name: "比叡山", imagePath: "http://localhost:8080/img/buildings/mount_fuji.png", height: 848},
          {name: "桜島", imagePath: "http://localhost:8080/img/buildings/sakurajima_resize.png", height: 1117},
          {name: "大山", imagePath: "http://localhost:8080/img/buildings/daisen.png", height: 1729},
          {name: "富士山", imagePath: "http://localhost:8080/img/buildings/mount_fuji.png", height: 3776},
        ],
        nowGoalIndex: 0,
        backImgHeight: 0,
      }
    },
    methods: {
      moveAge: function(event){
        const x = (event.offsetX / event.target.offsetWidth - 0.5)
        this.$refs.age_taro.tilt(x);
        this.$refs.age_taro_hidden.tilt(x);
      },
      renewGoal: function() {
        for(let i = this.goals.length - 1; i > 0; i--) {
          if(this.nowHeight >= this.goals[i].height) {
            this.nowGoalIndex = i
            break;
          }
        }
      },
      getAvatorImage: async function(){
        const name = this.$store.getters.doneName;
        const avator_response =  await axios.get(api_server.path + "/avator_image", {headers: {name: name}});
        const avator_image = avator_response.data;
        if(avator_image === ""){
          this.dialog = true;
          console.log(this.dialog)
        }else{
          this.$store.commit('setAvatorImage', avator_image);
        }
      },
    },
    created: async function(){
      const name = this.$store.getters.doneName;
      const ivy_response = await axios.get(api_server.path + "/ivy_height", {headers: {name: name}});
      this.nowHeight = `${ivy_response.data.ivy}`;
    },
    mounted(){
      this.getAvatorImage();
    },
    watch: {
      nowHeight: function() {
        this.renewGoal();
        if(this.nowGoalIndex < 7){
          for(let i=1;i<=3;i++){
            var backImg = document.getElementById("back_img" + i)
            backImg.height = 200 * window.innerHeight*0.60 / this.goals[this.nowGoalIndex].height
          }
        }
      },
    },
  }
</script>

<style scoped>
  .goal{
    position: absolute;
    left: calc(50% - 300px);
    bottom: -10px;
  }
  .right_bottom{
    position: absolute; 
    bottom: 10px; 
    right: 10px;
  }
  .stage {
    position: relative;
    width: 100vw;
    height: 100vh;
    border: 1px solid rgb(170, 170, 170);
    background: linear-gradient(#50C1E9, #FFFFFF);
    overflow: hidden;
  }
</style>