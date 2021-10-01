import Vue from "vue";
import Router from "vue-router";

// About scene components
import login from '../scenes/login_screen';
import home from '../scenes/home_screen';
import graph from '../scenes/graph_screen';
import badge from '../scenes/badge_screen';
import config from '../scenes/config_screen';

import store from './store';

Vue.use(Router);

const router = new Router({
  mode:   "history",
  routes: [
    //ルーティングの設定
    {
      path: '/login',
      component: login,
      name: 'login'
    },
    {
      path: '/',
      component: home,
      name: 'home',
      meta: { requestAuth: true }
    },
    {
      path: '/badge',
      component: badge,
      name: 'badge',
      meta: { requestAuth: true }
    },
    {
      path: '/graph',
      component: graph,
      name: 'graph',
      meta: { requestAuth: true }
    },
    {
      path: '/config',
      component: config,
      name: 'config',
      meta: { requestAuth: true }
    },
  ]
});

// 認証をしていない場合ログイン画面にしか入れないようにする
router.beforeEach((to, from, next) => {
  // 次にナビゲーションされる画面が認証されてからでないと遷移できない画面だったら
  if(to.matched.some(record => record.meta.requestAuth)){
    if(!store.state.isLogin){
      next({
        path: "/login",
        query: { redirect: to.fullPath }, // 元々アクセスしようとしていたurlをqueryパラメータに付与
      })
    }else{ next(); }
  }else{ next(); }
});

export default router;

