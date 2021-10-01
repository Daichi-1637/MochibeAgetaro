<template>
  <div class="navigation-bar">
    <v-app-bar 
      color="#24a8ac" 
      dark
      absolute
      app
    >
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold">{{ headerTitle }}</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      dark
      color="#24a8ac"
    >
      <v-list nav dense subheader flat>
        <v-subheader>画面</v-subheader>
        <v-list-item
          v-for="content in scene_contents"
          :key="content.title"
          @click="changePage(content.link)"
        >
          <v-list-item-icon>
            <v-icon>{{ content.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="font-weight-bold">{{ content.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list nav dense subheader flat>
        <v-subheader>その他</v-subheader>
        <v-list-item
          v-for="content in other_contents"
          :key="content.title"
          @click="content.action"
        >
          <v-list-item-icon>
            <v-icon>{{ content.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="font-weight-bold">{{ content.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <PhotoDialog v-model="dialog" />
        </div>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script>
import PhotoDialog from "./PhotoDialog.vue";

export default {
  name: "NavigationBar",

  components: {
    PhotoDialog,
  },

  computed: {
    headerTitle: function() {
      return this.scene_contents.find((content) => content.link == this.$route.path)
        .title;
    },
  },

  created() {
    this.snsURL();
  },

  methods: {
    changePage: function(path) {
      if (path == this.$route.path) {
        this.drawer = false;
      }else {
        this.$router.push(path);
      }
    },
    takeAgePicture: function(){ this.dialog = true; this.drawer = false; },
    shareTwitter: function(){
      const options = 'status=1,width=818,height=400,top=100,left=100';
      window.open(this.sns.twitter, 'twitter', options);
    },
    snsURL: function(){
      setTimeout(function(){
        this.sns.url = encodeURIComponent(location.href);
        this.sns.title = encodeURIComponent(document.title);
        this.sns.twitter = 'https://twitter.com/intent/tweet?url=' + this.sns.url + '&text=' + this.sns.title + '&hashtags=' + this.sns.hashtags;
      }.bind(this), 300);
    }
  },

  data() {
    return {
      drawer: false,
      dialog: false,
      scene_contents: [
        { title: "ホーム", icon: "mdi-home", link: "/" },
        { title: "グラフ", icon: "mdi-chart-bar", link: "/graph" },
        { title: "バッジ", icon: "mdi-medal", link: "/badge" },
        { title: "設定", icon: "mdi-account", link: "/config" },
      ],
      other_contents: [
        {title: "アゲアバターを撮る", icon: "mdi-camera-account", action: this.takeAgePicture},
        {title: "ツイッターで共有", icon: "mdi-twitter", action: this.shareTwitter},
      ],
      sns: {
        twitter: '',
        url: '',
        title: '',
        hashtags: '',
      }
    };
  },
};
</script>

<style scoped>
  .text-text{
    font-size: 1.5rem !important;
  }
</style>
