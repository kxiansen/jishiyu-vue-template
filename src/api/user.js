import request from '@/utils/request'

export function getInfo(token) {
  return request({
    url: '/account/users/info',
    method: 'get',
    params: { token }
  })
}
