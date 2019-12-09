import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  is_supper: '',
  nickname: '',
  permissions: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_IS_SUPPER: (state, is_supper) => {
    state.is_supper = is_supper
  },
  SET_NICKNAME: (state, nickname) => {
    state.nickname = nickname
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  }

}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { result } = response
        commit('SET_TOKEN', result.token)
        setToken(result.token)

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { result } = response

        if (!result) {
          reject('Verification failed, please Login again.')
        }

        commit('SET_IS_SUPPER', result.is_supper)
        commit('SET_NICKNAME', result.nickname)
        commit('SET_AVATAR', result.avatar)
        commit('SET_PERMISSIONS', result.permissions)

        resolve(result)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_IS_SUPPER', '')
        commit('SET_NICKNAME', '')
        commit('SET_AVATAR', '')
        commit('SET_PERMISSIONS', [])
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_IS_SUPPER', '')
      commit('SET_NICKNAME', '')
      commit('SET_AVATAR', '')
      commit('SET_PERMISSIONS', [])
      removeToken()
      resolve()
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
