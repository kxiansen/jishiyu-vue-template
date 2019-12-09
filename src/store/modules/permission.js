import { asyncRoutes, constantRoutes } from '@/router'
import store from '@/store'

/**
 * 通过meta.permission判断是否与当前用户权限匹配
 * @param permissions
 * @param route
 */

// 数组包含判断
function isSubArray(parent, child) {
  for (const item of child) {
    if (!parent.includes(item.trim())) {
      return false
    }
  }
  return true
}

function hasPermission(permissions, route) {
  if (route.meta && route.meta.permissions) {
    for (const or_item of route.meta.permissions.split('|')) {
      if (isSubArray(permissions, or_item.split('&'))) {
        return true
      }
    }
    // return permission.some(permission => route.meta.permission.includes(permission))
  } else {
    return false
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRoutes
 * @param permissions
 */
export function filterAsyncRoutes(routes, permissions) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(permissions, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, permissions) {
    return new Promise(resolve => {
      let accessedRoutes
      if (store.getters.is_supper === true) {
        accessedRoutes = asyncRoutes
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, permissions)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
