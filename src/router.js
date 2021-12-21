import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

function importComponent(path){
    return () => import(`./components/${path}.vue`);
}

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            redirect: '/login'
        },

        {
            path: '/dashboardAdmin',
            name: 'DashboardAdmin',
            component: importComponent('DashboardLayoutAdmin'),
            children: [

                {
                    path: '/product',
                    name: 'Product',
                    meta: { title: 'Products' },
                    component: importComponent('Admin/Products'),
                },

            ],
        },

        {
            path: '/dashboardUser',
            name: 'DashboardUser',
            component: importComponent('DashboardLayoutUser'),
            children: [
                {
                    path: '/store',
                    name: 'Store',
                    meta: { title: 'Stores' },
                    component: importComponent('User/Store'),
                },

                {
                    path: '/profile',
                    name: 'Profile',
                    meta: { title: 'Profile' },
                    component: importComponent('User/Profile'),
                },

                {
                    path: '/shopping-cart',
                    name: 'Shopping-Cart',
                    meta: { title: 'Shopping-Cart' },
                    component: importComponent('User/Shopping-Cart'),
                },
            ],
        },
        
        {
            path: '/login',
            name: 'Login',
            meta: { title: 'Login' },
            component: importComponent('Login'),
        },

        {
            path: '/register',
            name: 'Register',
            meta: { title: 'Register' },
            component: importComponent('Register'),
        },
        {
            path: '*',
            redirect: '/'
        },
    ],
});

router.beforeEach((to,form, next) => {
    document.title = to.meta.title;
    next();
});

export default router;