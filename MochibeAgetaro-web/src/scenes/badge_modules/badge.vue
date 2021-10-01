<template>
    <v-hover v-slot="{ hover }">
        <v-card
            :elevation="hover ? 12 : 2"
            :style="{
                background: `url(${imgUrl})`,
                backgroundSize: 'contain', 
                backgroundRepeat: 'no-repeat',
                height: '100px',
                width: '100px'
            }"
            >
        </v-card>
    </v-hover>
</template>

<script>
    export default{
        props: {
            imgUrl: { type: String, default: "../img/badges/key.png" },
            name: { type: String, default: null },
        }
    }
</script>

<style>
    .badge{
        width: 100%;
        height: 100%;
        display: block;
	}
</style>
