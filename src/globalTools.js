/**
 * Created by Yooke on 2017/2/13.
 */
// import Vue from 'vue'
import axios from 'axios'

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

tools.install = function(Vue) {
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
    if (this.$store.getters.is_supper === 'true') {
      return true
    }
    const permissions = this.$store.getters.permissions
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
