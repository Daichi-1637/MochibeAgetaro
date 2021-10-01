<template>
    <AnimBox class="elevationSignboard" 
        :w="100" :h="50" :sx="scale" :sy="scale" :duration="5000"
        :style="{ top: `40vh`, left: `52vw`}"
    >
        {{name}}
    </AnimBox>
</template>

<script>
    import AnimBox from './animation/animBox';

    export default{
        components: { AnimBox },
        props: { name: { type: String, default: null }},
        data(){
            return {
                scale: 0,
            }
        },
        mounted: function(){
            this.scale = 1;
        }
    }
</script>

<style scoped>
    .elevationSignboard{
        background-color: green;
        color: white;
        border-radius: 90px 3px;
        text-align: center;
        padding: 13px 0;
        font-family: "Impact";
        transform-origin: bottom left;
    }
</style>