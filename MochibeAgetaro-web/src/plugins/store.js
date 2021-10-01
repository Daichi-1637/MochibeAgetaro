import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// コンポーネント間で共有する変数
const state = {
    isLogin: false,
    name: '',
    avatorImage: null,
};

const getters = {
    doneIsLogin: () => {
        return state.isLogin;
    },
    doneName: () => {
        return state.name;
    }
}

// イベントに近いもの(同期処理でなければならない)
const mutations = {
    auth: (state, name) => {
        state.isLogin = true;
        state.name = name;
    },
    setAvatorImage: (state, avatorImage) => {
      state.avatorImage = avatorImage;
    }
}

// mutationsをコミットする(非同期処理を含むことができる)
const actinos = {
    fetch: (context, name) => {
        context.commit('auth', name);
    }
}

export default new Vuex.Store({
    state: state,
    getters: getters,
    mutations: mutations, 
    actions: actinos
});