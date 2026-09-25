import About from "@/views/About.vue";
import Home from "@/views/Home.vue";
import Signin from "@/views/Signin.vue";
import Signup from "@/views/Signup.vue";
import AccountEditor from "@/views/AccountEditor.vue";
import Contact from "@/views/Contact.vue";
import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from '@/composables/auth';

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
        },
        {
          path: '/account',
          name: 'account',
          component: AccountEditor,
          meta: { requiresAuth: true }
        },
        {
          path: '/contact',
          name: 'contact',
          component: Contact
        }
    ],
});

router.beforeEach(async (to) => {
    const { user, fetchMe } = useAuth();
    // Ensure auth state is up to date
    if (user.value === null) {
        await fetchMe();
    }
    if (to.meta.requiresAuth && !user.value) {
        return { name: 'signin' };
    }
});

export default router;
