import About from "@/views/About.vue";
import Home from "@/views/Home.vue";
import Signin from "@/views/Signin.vue";
import Signup from "@/views/Signup.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
          path: '/',
          name: 'home',
          component: Home
        },
        {
          path: '/about',
          name: 'about',
          component: About
        },
        {
          path: '/signup',
          name: 'signup',
          component: Signup
        },
        {
          path: '/signin',
          name: 'signin',
          component: Signin
        }
    ],
});

export default router;
