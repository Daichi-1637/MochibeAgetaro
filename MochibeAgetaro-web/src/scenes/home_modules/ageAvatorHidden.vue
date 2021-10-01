<template>
  <AnimBox ref="age" :sx="0.1" :sy="0.1" :r="-20" :style="{ top: `${pos_y}vh`, left: `calc(50% - 60px)`}">
    <AnimBox ref="armL" img="../../../../img/larm.png" :sx="1" :sy="1" :ox="0" :oy="0" :r="armAngle.left"/>
    <AnimBox ref="lleg" img="../../../../img/lleg.png" :sx="1" :sy="1" :ox="0" :oy="0" :r="legAngle.left"/>
    <img :src="this.$store.state.avatorImage" width="65vw" style="margin-left: -20%; margin-top: -28%;">
  </AnimBox>
</template>

<script>
  import AnimBox from './animation/animBox';
  
  export default{
    components: { AnimBox, },
    data(){
      return {
        // アゲ太郎の登った高さ
        pos_y: 100,
        // アゲ太郎の傾き
        bodyTilt: 0,
        armAngle: {left: 0, right: 0},
        legAngle: {left: 0, right: 0},
      }
    },
    mounted: async function(){
      const duration = 5000;
      const timing = function(timeFraction){ return 50*Math.sin(timeFraction*5*Math.PI); }
      const draw = function(angle, self){
        self.pos_y -= 0.2;
        self.bodyTilt = angle/4;
        self.armAngle = { left:  angle, right: -angle };
        self.legAngle = { left: -angle, right:  angle };
      }

      const rising = function(duration, timing, draw, self){
        return new Promise( resolve => {
          let requestID;
          const start = performance.now();
          requestAnimationFrame(function rising(time){
            let timeFraction = (time - start) / duration;
            if(timeFraction > 1) timeFraction = 1;
            let progress = timing(timeFraction);
            draw(progress, self);
            if(timeFraction < 1) requestID = requestAnimationFrame(rising);
            else{
              cancelAnimationFrame(requestID);
              resolve(requestID)
            }
          });
        });
      }

      await rising(duration, timing, draw, this); 
    }
  }
</script>

<style scoped>

</style>
