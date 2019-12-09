import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/** note: sub-menu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    permission: 'account_user_view' or 'account_user_view|account_role_view'   will control the page roles (you can set multiple roles)
    title: 'title'               the name show in sub-menu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if true, the page will no be cached(default is false)
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
    affix: true                  if true, the tag will affix in the tags-view
  }
**/

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 * */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', noCache: true, affix: true, permissions: 'account_user_view' }
      }
    ]
  },
  {
    path: '/documentation',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/documentation/index'),
        name: 'Documentation',
        meta: { title: 'documentation', icon: 'documentation', affix: true }
      }
    ]
  },
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/index'),
        name: 'Guide',
        meta: { title: 'guide', icon: 'guide', noCache: true }
      }
    ]
  }
  // #####################################################

]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
*/
export const asyncRoutes = [
  /** when your routing map is too long, you can split it into small modules **/
  // componentsRouter,
  // chartsRouter,
  // nestedRouter,
  // tableRouter,

  // { path: '*', redirect: '/404', hidden: true }
  {
    path: '/account',
    component: Layout,
    name: 'account_manage',
    alwaysShow: true,
    meta: {
      title: 'accountManage',
      icon: 'user',
      permissions: 'account_user_view|account_role_view'
    },
    children: [
      {
        path: 'user',
        name: 'user',
        meta: { title: 'accountList', icon: 'peoples', permissions: 'account_user_view' },
        component: () => import('@/views/account/user.vue')
      },
      {
        path: 'role',
        name: 'role',
        meta: { title: 'accountRole', icon: 'people', permissions: 'account_role_view' },
        component: () => import('@/views/account/role.vue')
      }
    ]
  },
  {
    path: '/assets',
    component: Layout,
    name: 'assetsManage',
    meta: {
      title: 'assetsManage',
      icon: 'host'
    },
    children: [
      {
        path: 'host',
        name: 'assetsHost',
        meta: { title: 'assetsHost', icon: 'hostList' }
      },
      {
        path: 'host_exec',
        name: 'assetsHostExec',
        meta: { title: 'assetsHostExec', icon: 'hostExec' }
      }
    ]
  },
  {
    path: '/publish',
    component: Layout,
    name: 'publishApp',
    meta: {
      title: 'publishApp',
      icon: 'publishApp'
    },
    children: [
      {
        path: 'app',
        name: 'appList',
        meta: { title: 'appList', icon: 'appList' }
      },
      {
        path: 'field',
        name: 'fieldManage',
        meta: { title: 'fieldManage', icon: 'fieldManage' }
      },
      {
        path: 'menu',
        name: 'menuManage',
        meta: { title: 'menuManage', icon: 'menuManage' }
      },
      {
        path: 'image',
        name: 'imageManage',
        meta: { title: 'imageManage', icon: 'imageManage' }
      }
    ]
  },
  {
    path: '/configuration',
    component: Layout,
    name: 'configurationManage',
    meta: {
      title: 'configurationManage',
      icon: 'configurationManage'
    },
    children: [
      {
        path: 'environment',
        name: 'environmentManage',
        meta: { title: 'environmentManage', icon: 'environmentManage' }
      },
      {
        path: 'service',
        name: 'serviceConfiguration',
        meta: { title: 'serviceConfiguration', icon: 'serviceConfiguration' }
      },
      {
        path: 'app',
        name: 'appConfiguration',
        meta: { title: 'appConfiguration', icon: 'appConfiguration' }
      },
      {
        path: 'relationship',
        name: 'relationship',
        meta: { title: 'relationship', icon: 'relationship' }
      }
    ]
  },
  {
    path: '/schedule',
    component: Layout,
    name: 'schedule',
    alwaysShow: true,
    meta: {
      title: 'schedule',
      icon: 'schedule'
    },
    children: [
      {
        path: 'job',
        name: 'jobList',
        meta: { title: 'jobList', icon: 'jobList' }
      }
    ]
  },
  {
    path: '/monitor',
    component: Layout,
    name: 'monitor',
    alwaysShow: true,
    meta: {
      title: 'monitorManage',
      icon: 'monitorManage'
    },
    children: [
      {
        path: 'host',
        name: 'hostMonitor',
        meta: { title: 'hostMonitor', icon: 'hostMonitor' }
      },
      {
        path: 'service',
        name: 'serviceMonitor',
        meta: { title: 'serviceMonitor', icon: 'serviceMonitor' }
      },
      {
        path: 'site',
        name: 'siteMonitor',
        meta: { title: 'siteMonitor', icon: 'siteMonitor' }
      }
    ]
  },
  {
    path: '/alerm',
    component: Layout,
    name: 'alerm',
    alwaysShow: true,
    meta: {
      title: 'alermManage',
      icon: 'alermManage'
    },
    children: [
      {
        path: 'role',
        name: 'alarmRole',
        meta: { title: 'alarmRole', icon: 'alarmRole' }
      },
      {
        path: 'alarmContact',
        name: 'alarmContact',
        meta: { title: 'alarmContact', icon: 'alarmContact' }
      }
    ]
  },
  {
    path: '/external-jenkins',
    alwaysShow: true,
    component: Layout,
    name: 'external_jenkins',
    meta: {
      title: 'external_jenkins',
      icon: 'link',
      permissions: 'account_role_view'
    },
    children: [
      {
        path: 'dev',
        name: 'dev',
        meta: { title: 'devJenkins', icon: 'link', permissions: 'account_role_view' }
      },
      {
        path: 'qa',
        name: 'qa',
        meta: { title: 'qaJenkins', icon: 'link', permissions: 'qa' }
      }
    ]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  mode: 'history',
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
