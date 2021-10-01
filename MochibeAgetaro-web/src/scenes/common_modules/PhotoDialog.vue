<template>
  <v-dialog :value="dialog" width="300px" @click:outside="closeDialog">
    <v-card color="#d3edec" style="padding: 1px;">
      <croppa 
        class="croppa-container"
        v-model="croppa"
        :width="250"
        :height="250"
        :quality="1"
        placeholder="画像をアップロード"
        placeholder-color="#555555"
        :show-remove-button="false"
        prevent-white-space
        @new-image-drawn="isUploaded=croppa.hasImage()"
        @init="onInit"
      ></croppa>

      <v-card-actions>
        <v-btn fab icon @click="croppa.rotate(-1)" color="#0087cb" :disabled="!isUploaded"><v-icon>mdi-rotate-left</v-icon></v-btn>
        <v-btn fab icon @click="croppa.rotate()"   color="#0087cb" :disabled="!isUploaded"><v-icon>mdi-rotate-right</v-icon></v-btn>
        <v-btn fab icon @click="removeImage()"     color="error"   :disabled="!isUploaded"><v-icon>mdi-trash-can</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-btn dark @click="saveImage()" color="#0087cb" :disabled="!isUploaded">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue';
import Croppa from 'vue-croppa';
import axios from "axios";
import api_server from '../../../apiserverpath.js';

Vue.use(Croppa);
//参考：https://qiita.com/ume-kun1015/items/ebd447f769cd9ad1352c
export default {
  name: "ShootingDialog",
  model: {
    prop: 'dialog',
    event: 'change-dialog',
  },
  props: {
    dialog: {type: Boolean, default: false, required: true }
  },
  data() {
    return{
      croppa: {},
      isUploaded: false,
    }
  },
  methods: {
    onInit:function() {
      this.croppa.addClipPlugin(function (ctx, x, y, w, h) {
        /*
         * ctx: canvas context
         * x: start point (top-left corner) x coordination
         * y: start point (top-left corner) y coordination
         * w: croppa width
         * h: croppa height
        */
        ctx.beginPath()
        ctx.arc(x + w / 2, y + h / 2, w / 2, 0, 2 * Math.PI, true)
        ctx.closePath()
      })
    },
    closeDialog:function(){
      this.$emit('change-dialog', false);
      this.croppa.refresh();
      this.isUploaded = false;
    },
    saveImage:function() {
      const avator_image = this.croppa.generateDataUrl();

      const name = this.$store.getters.doneName;
      axios.post(
        api_server.path + "/avator_image/set", 
        {img: avator_image}, 
        {headers:{name: name}}
      );

      this.$store.commit('setAvatorImage' ,avator_image);
      this.$emit('change-dialog', false);
      this.croppa.refresh();
      this.isUploaded = false;
    },
    removeImage:function(){
      this.croppa.remove();
      this.isUploaded = false;
    },
  },
}
</script>

<style scoped>
.croppa-container{
  background-color: rgba(36, 168, 172, 0.2);
  width: 250px;
  height: 250px;
  margin: 20px auto;
  display: block;
}
</style>