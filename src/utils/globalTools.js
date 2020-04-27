import axios from 'axios'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'

const tools = {
  install: null
}
// Promise 添加finally方法
Promise.prototype.finally = function(callback) {
  return this.then(
    () => Promise.resolve(callback()),
    () => Promise.reject(callback())
  )
}

// Date 添加format方法
Date.prototype.format = function() {
  return `${this.getFullYear()}-${this.getMonth() + 1}-${this.getDate()} ${this.getHours()}:${this.getMinutes()}:${this.getSeconds()}`
}

// 数组包含判断
function isSubArray(parent, child) {
  for (const item of child) {
    if (!parent.includes(item.trim())) {
      return false
    }
  }
  return true
}

// js对象和数组深拷贝
function deepCopy(obj) {
  if (Array.isArray(obj)) {
    const result = []
    for (const item of obj) {
      result.push(deepCopy(item))
    }
    return result
  } else if (typeof obj === 'object' && obj !== null) {
    const result = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = deepCopy(obj[key])
      }
    }
    return result
  } else {
    return obj
  }
}

// response处理
function handleResponse(response) {
  if (response.status === 401) {
    this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    response['result'] = '请登录'
    Message({
      message: response.result,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(response)
  } else if (response.data.hasOwnProperty('data') && response.data.hasOwnProperty('message')) {
    if (response.data.message) {
      response['result'] = response.data.message
      Message({
        message: response.result,
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      response['result'] = response.data.data
      return Promise.resolve(response)
    }
  } else {
    response['result'] = '无效的数据格式'
    Message({
      message: response.result,
      type: 'error',
      duration: 5 * 1000
    })
  }
  return Promise.reject(response)
}

tools.install = function(Vue) {
  // 创建axios实例
  // const service = axios.create({
  //   baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  //   withCredentials: true, // 跨域请求时发送 cookies
  //   timeout: 5000 // request timeout
  // })

  // request拦截器
  axios.interceptors.request.use(
    request => {
      if (request.url.startsWith('/api/')) {
        request.headers['X-TOKEN'] = getToken()
        request.url = process.env.VUE_APP_BASE_API + request.url.replace('/api', '')
        // request.url = config.apiServer + request.url
      }
      // Do something before request is sent
      // if (store.getters.token) {
      //   // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      //   request.headers['X-Token'] = getToken()
      // }
      return request
    },
    error => {
      // Do something with request error
      console.log(error) // for debug
      Promise.reject(error)
    }
  )

  // respone拦截器
  axios.interceptors.response.use(
    /**
     * If you want to get information such as headers or status
     * Please return  response => response
    */
    /**
     * 下面的注释为通过在response里，自定义code来标示请求状态
     * 当code返回如下情况则说明权限有问题，登出并返回到登录页
     * 如想通过 XMLHttpRequest 来状态码标识 逻辑可写在下面error中
     * 以下代码均为样例，请结合自生需求加以修改，若不需要，则可删除
     */
    response => {
      return handleResponse(response)
    }, error => {
      if (error.response) {
        return handleResponse(error.response)
      }
      console.log('请求异常:  ' + error) // for debug
      Message({
        message: { result: '请求异常： ' + error.message },
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    })

  Vue.prototype.$http = axios
  Vue.prototype.$layer_message = function(message, type) {
    this.$message({
      showClose: true,
      duration: 5000,
      message: message,
      type: type || 'error'
    })
  }
  // js对象和数组深拷贝
  Vue.prototype.$deepCopy = deepCopy
  // 权限判断
  Vue.prototype.has_permission = function(str_code) {
    if (store.getters.is_supper === true) {
      return true
    }
    const permissions = store.getters.permissions
    if (!str_code || !permissions) return false
    for (const or_item of str_code.split('|')) {
      if (isSubArray(permissions, or_item.split('&'))) {
        return true
      }
    }
    return false
  }
}

export default tools
