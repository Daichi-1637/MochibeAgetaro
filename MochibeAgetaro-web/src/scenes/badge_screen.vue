<template>
    <v-app>
        <NavigationBar />
        <background>
            <v-container>
                <v-row >
                    <v-col 
                        cols="3"
                        md="1"
                        sm="3"
                        xs="3"
                        v-for="arrayIndex in badgeNum"
                        :key="arrayIndex" class="outer"
                    >
                        <div 
                            v-if="hasBadge(arrayIndex)" 
                            class="inner"
                        >
                            <badge :imgUrl="badges[getIndex(arrayIndex)].path" />
                        </div>
                        <div v-else class="inner">
                            <badge />
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </background>
    </v-app>
</template>

<script>
  import badge from './badge_modules/badge';
  import axios from 'axios';
  import api_server from '../../apiserverpath';
  import NavigationBar from './common_modules/NavigationBar';
  import Background from './common_modules/background.vue';

  export default{
    components: {
        badge,
        NavigationBar,
        Background
    },
    data(){
        return {
            imgPath: " ",
            badges: [],
            badgeNum: 108,
        }
    },
    methods: {
        hasBadge: function(arrayIndex){
            return ( arrayIndex - 1 ) < this.badges.length;
        },
        getIndex: function(arrayIndex){
            return  arrayIndex - 1 ;
        },
    },
    created: async function(){
       const name = this.$store.getters.doneName;
       const response = await axios.get(api_server.path + "/badges", {headers: {name: name}});
       this.badges = response.data;
    }
  }
</script>

<style lang="scss" scoped>
  .outer{
      display: flex;
      justify-content: center;
      align-items: center;
  }
  .inner{
      text-align: center;
  }
</style>