<template>
    <v-app>
        <NavigationBar />

        <background>
            <v-container fluid> 
                <v-list
                    rounded
                    subheader
                    two-line
                    color="transparent"
                >
                    <v-list-item-group 
                        v-model="selectedItem"
                        mandatory
                    >
                        <v-list-item
                            v-for="(item, i) in items"
                            :key="i"
                            @click="selectlist(i)"
                            active-class="rgb(36, 168, 172)"
                        >
                            <v-list-item-content>
                                <v-list-item-title v-text="item.name" />
                                <v-list-item-subtitle v-text="'勉強時間 ' + item.studyTime.toString() + '分  休憩時間 ' + item.restTime.toString() + '分'"/>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-btn
                                    icon
                                    @click="editdata(i)"
                                >
                                  <v-icon> mdi-dots-horizontal </v-icon>
                                </v-btn>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
                
                <div class="right_bottom">
                    <v-btn 
                        color="primary"
                        dark
                        fab
                        @click="dialog = {
                            flag:   !dialog.flag, 
                            isedit: false,
                            index:  dialog.index
                        }; initTmpdata()"
                    >
                        <v-icon>
                            mdi-plus
                        </v-icon>
                    </v-btn>
                </div>

                <v-dialog
                    v-model="dialog.flag"
                    max-width="500px"
                >
                    <v-card outlined>
                        <v-card-title>
                            Time Setting
                            <v-spacer></v-spacer>
                            <v-btn 
                                v-if="dialog.isedit"
                                icon
                                
                                @click="deletedata"
                            ><v-icon color="error">mdi-trash-can</v-icon></v-btn>
                        </v-card-title>
                        <v-card-text>
                            <v-text-field
                                label="セット名"
                                @change="fetchSetName"
                                :value="tmpSetName"
                            />
                            <v-select
                                label="勉強時間[分]"
                                :items="new Array(13).fill(1).map((v,i)=>(v*i*5))"
                                @change="fetchStudyTime"
                                :value="tmpStudyTime"
                                dense
                                outlined
                            />
                            <v-select
                                label="休憩時間[分]"
                                :items="new Array(13).fill(1).map((v,i)=>(v*i*5))"
                                @change="fetchRestTime"
                                :value="tmpRestTime"
                                dense
                                outlined
                            />
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                color="primary"
                                @click="savedata"
                            >保存</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-container>
        </background>
    </v-app>
</template>

<script>
  import axios from 'axios';
  import api_server from '../../apiserverpath';
  import NavigationBar from "./common_modules/NavigationBar";
  import Background from './common_modules/background.vue';

  export default {
    components: {
      NavigationBar,
      Background
    },
    data () {
      return {
        dialog: {flag:false, isedit:false, index:0},
        items:[],
        selectedItem: null,
        deleteItem: null,
        tmpSetName: null,
        tmpStudyTime: null,
        tmpRestTime: null,
      }
    },
    methods:{
      initTmpdata:function(){
        this.tmpSetName = null
        this.tmpStudyTime = null
        this.tmpRestTime = null
      },
      editdata:function(_index){
        this.dialog = {flag: !this.dialog.flag, isedit: true, index: _index}
        this.deleteItem = _index
        this.tmpSetName = this.items[_index].name
        this.tmpStudyTime = this.items[_index].studyTime
        this.tmpRestTime = this.items[_index].restTime
      },
      fetchSetName:function(event){
        this.tmpSetName = event
      },
      fetchStudyTime:function(event){
        this.tmpStudyTime = event
      },
      fetchRestTime:function(event){
        this.tmpRestTime = event
      },
      savedata: async function(){
        this.dialog = {
          flag: false, 
          isedit: this.dialog.isedit, 
          index: this.dialog.index
        }
        const datas = {
          isSelected: true,
          name:       this.tmpSetName,
          studyTime:  this.tmpStudyTime,
          restTime:   this.tmpRestTime
        };  
        if(!this.dialog.isedit){
          this.items.push(datas);
          this.updateSelectedItem(this.items.length - 1);
          const name = this.$store.getters.doneName;
          await axios.post(api_server.path + "/setting/create", datas, {headers: {name: name}});
        }else{
          this.items[this.dialog.index] = datas;
          this.updateSelectedItem(this.dialog.index);
          const name = this.$store.getters.doneName;
          await axios.post(api_server.path + "/setting/update", datas, {headers: {name: name}});
        }
      },
      deletedata: async function(){
        this.dialog = {
          flag: false, 
          isedit: this.dialog.isedit, 
          index: this.dialog.index
        };
         
        const datas = this.items[this.deleteItem];
        if(datas.isSelected){ this.updateSelectedItem(0); }
        this.items.splice(this.deleteItem , 1);
        const name = this.$store.getters.doneName;
        await axios.post(api_server.path + "/setting/delete", datas, {headers: {name: name}});
      },
      updateSelectedItem: function(index) {
        // isSelectdがtrueの要素番号を取得
        const beforeTrueItem = this.items.findIndex(item => item.isSelected);
        // falseに変更
        this.items[beforeTrueItem].isSelected = false;
        // 引数で与えられた要素の箇所をtrueに変更
        this.items[index].isSelected = true;
        this.selectedItem = index;
        return beforeTrueItem;
      },
      selectlist: async function(index){
        const beforeTrueItem = this.updateSelectedItem(index);

        const name = this.$store.getters.doneName;
        const asioses = [
          axios.post(api_server.path + "/setting/update", this.items[index], {headers: {name: name}}),
          axios.post(api_server.path + "/setting/update", this.items[beforeTrueItem], {headers: {name: name}})
        ];
        await Promise.all(asioses);
      }
    },
    created: async function(){
      const name = this.$store.getters.doneName;
      const response = await axios.get(api_server.path + "/setting/get", {headers: {name: name}});
      this.items = response.data;
      this.selectedItem = this.items.findIndex((data) => data.isSelected);
    },
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
</style>