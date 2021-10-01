<template>
    <div
        class="anim-box"
        :style="{
            backgroundImage: img ? `url(${img})` : 'none',
            width: `${w}px`,
            height: `${h}px`,
            transform: `
                translate(${transform.x}px, ${transform.y}px)
                rotate(${transform.r}deg)
                scale(${transform.sx}, ${transform.sy})`,
            transformOrigin: `${ox}%, ${oy}%`,
            transition: `transform ${duration}ms ${delay}ms ${easing}`    
        }"
    >
        <slot />
    </div>
</template>

<script>
export default{
    props: {
        img:    {type: String, default: null},  // 画像のURL
        x:      {type: Number, default: 0},     // 画像のx座標
        y:      {type: Number, default: 0},     // 画像のy座標
        w:      {type: Number, default: 100},   // 画像の横幅 [px]
        h:      {type: Number, default: 100},   // 画像の縦幅 [px]
        r:      {type: Number, default: 0},     // 画像の回転率 [deg]
        sx:     {type: Number, default: 1},     // 画像の縦方向の拡大率?
        sy:     {type: Number, default: 1},     // 画像の縦方向の拡大率?
        ox:     {type: Number, default: 50},
        oy:     {type: Number, default: 50},
        delay:  {type: Number, default: 0},
        duration: {type: Number, default: 1000}
    },
    data(){
        return{
            relatives: {}, 
            easing: `ease`,
        }
    },
    computed: {
        transform: function(){
            return {
                x: this.x + (this.relatives.x || 0),
                y: this.y + (this.relatives.y || 0),
                r: this.r + (this.relatives.r || 0),
                sx: this.sx + (this.relatives.sx || 1),
                sy: this.sy + (this.relatives.sy || 1),
            }
        }
    },
}
</script>

<style scoped>
    .anim-box{
        position: absolute;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
    }
</style>
