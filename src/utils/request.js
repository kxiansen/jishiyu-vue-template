import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

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

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  withCredentials: true, // 跨域请求时发送 cookies
  timeout: 5000 // request timeout
})

// request拦截器
service.interceptors.request.use(
  request => {
    // Do something before request is sent
    if (store.getters.token) {
      // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      request.headers['X-Token'] = getToken()
    }
    return request
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
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

export default service
