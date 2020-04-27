<template>
  <div class="app-container">
    <el-row>
      <el-col :span="16">
        <el-form :inline="true"
                 :model="filters">
          <el-form-item>
            <el-input v-model="filters.name"
                      placeholder="姓名" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
                       icon="search"
                       @click="name_Search()">{{ $t('accountManage.search') }} </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="8"
              style="text-align: right">
        <el-button @click="refresh()">{{$t('accountManage.flush')}}</el-button>
        <el-button v-if="has_permission('account_user_add')"
                   style="float: right"
                   type="primary"
                   @click="handleAdd()">{{$t('accountManage.addUser')}}
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="listLoading"
              :data="tableData.data"
              stripe
              border
              style="width: 100%"
              :default-sort="{prop: 'username', order: 'descending'}">
      <el-table-column type="index"
                       width="60" />
      <el-table-column prop="username"
                       label="Login Name"
                       sortable />
      <el-table-column prop="nickname"
                       label="Full Name"
                       sortable />
      <el-table-column prop="role_name"
                       label="Role" />
      <el-table-column prop="last_login"
                       label="Recently the login" />
      <el-table-column label="State"
                       sortable
                       width="90">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.is_active"
                  type="success">{{$t('accountManage.normal')}}</el-tag>
          <el-tag v-else
                  type="danger">{{$t('accountManage.disable')}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="has_permission('account_user_edit|account_user_disable')"
                       label="Operation"
                       width="250">
        <template slot-scope="scope">
          <el-button v-if="has_permission('account_user_edit')"
                     size="small"
                     @click="handleEdit(scope.$index, scope.row)">{{$t('accountManage.edit')}}</el-button>
          <el-button v-if="has_permission('account_user_disable') && scope.row.is_active"
                     size="small"
                     type="danger"
                     :loading="btnDelLoading[scope.row.id]"
                     @click="handleDisable(scope.$index, scope.row)">{{$t('accountManage.disable')}}
          </el-button>
          <el-button v-if="has_permission('account_user_disable') && scope.row.is_active != 1"
                     size="small"
                     type="success"
                     :loading="btnDelLoading[scope.row.id]"
                     @click="handleDisable(scope.$index, scope.row)">{{$t('accountManage.enable')}}
          </el-button>
          <el-button v-if="has_permission('account_user_disable')"
                     size="small"
                     type="warning"
                     @click="RestPwd(scope.$index, scope.row)">{{$t('accountManage.resetPassword')}}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <div v-if="tableData.total > 10"
         class="pagination-bar">
      <el-pagination :current-page="currentPage"
                     layout="total, prev, pager, next"
                     :total="tableData.total"
                     @current-change="handleCurrentChange" />
    </div>

    <!--编辑新增界面-->
    <el-dialog :title="editFormTitle"
               :visible.sync="dialogShow"
               :close-on-click-modal="false">
      <el-form ref="editForm"
               :model="editForm"
               :rules="rules"
               label-width="80px">
        <el-form-item prop="username"
                      label="登录名">
          <el-input v-model="editForm.username"
                    auto-complete="off"
                    :disabled="is_disabled" />
        </el-form-item>
        <el-form-item prop="nickname"
                      label="姓名">
          <el-input v-model="editForm.nickname"
                    auto-complete="off" />
        </el-form-item>
        <el-form-item prop="password"
                      label="密码"
                      :style="display">
          <el-input v-model="editForm.password"
                    type="password"
                    auto-complete="off" />
        </el-form-item>
        <el-form-item prop="checkPass"
                      label="确认密码"
                      :style="display"
                      width="180">
          <el-input v-model="editForm.checkPass"
                    type="password"
                    auto-complete="off" />
        </el-form-item>
        <el-form-item label="角色"
                      required>
          <el-select v-model="editForm.role_id"
                     placeholder="请选择用户角色">
            <el-option v-for="role in roles"
                       :key="role.id"
                       :label="role.name"
                       :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="email"
                      label="邮箱">
          <el-input v-model="editForm.email"
                    auto-complete="off" />
        </el-form-item>
        <el-form-item prop="mobile"
                      label="电话"
                      required>
          <el-input v-model="editForm.mobile"
                    auto-complete="off" />
        </el-form-item>
        <el-alert v-if="error"
                  :title="error"
                  type="error"
                  style="margin-top: -10px; margin-bottom: 10px"
                  show-icon />
      </el-form>
      <div slot="footer">
        <el-button type="text"
                   @click.native="dialogShow = false">取消</el-button>
        <el-button type="primary"
                   :loading="editLoading"
                   @click.native="editSubmit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.editForm.checkPass !== '') {
          this.$refs.editForm.validateField('checkPass')
        }
        callback()
      }
    }

    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.editForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    const checkMobile = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('手机号不能为空'))
      }
      setTimeout(() => {
        const mobile = /^1[34578]\d{9}$/
        if (!mobile.test(value)) {
          callback(new Error('手机号不正确'))
        } else {
          callback()
        }
      }, 1000)
    }

    return {
      filters: {
        name: ''
      },
      error: '',
      dialogShow: false,
      tableData: {},
      roles: undefined,
      roles_map: {},
      display: '',
      listLoading: false,
      btnDelLoading: {},
      editFormTitle: '',
      editLoading: false,
      is_disabled: '',
      currentPage: 1,
      addForm: {
        id: 0,
        username: '',
        nickname: '',
        password: '',
        checkPass: '',
        role_id: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      rules: {
        username: [
          { required: true, message: '请输入登录名', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        mobile: [
          { validator: checkMobile, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.getUsers(1, function (that) {
      that.$http.get('/api/account/roles/').then(res => {
        that.roles = res.result
        that.roles.forEach(item => that.roles_map[item.id] = item)
        that.updateRoleName(that)
      }, res => that.$layer_message(res.result))
    })
  },
  methods: {
    handleCurrentChange (val) {
      this.currentPage = val
      this.getUsers(this.currentPage)
    },

    // 名字查询
    name_Search () {
      this.currentPage = 1
      this.getUsers()
    },

    // 刷新操作
    refresh () {
      this.getUsers(this.currentPage)
    },

    // 获取用户列表
    getUsers (page, callback) {
      if (!page) page = 1
      if (!callback) callback = this.updateRoleName
      this.listLoading = true
      this.$http.get('/api/account/users/', {
        params: {
          page: page,
          name: this.filters.name
        }
      }).then((response) => {
        this.tableData = response.result
        if (callback) callback(this)
      }, (response) => this.$layer_message(response.result)).finally(() => this.listLoading = false)
    },

    // 更新角色名称
    updateRoleName (that) {
      for (const user of that.tableData.data) {
        if (that.roles_map.hasOwnProperty(user.role_id)) {
          that.$set(user, 'role_name', that.roles_map[user.role_id]['name'])
        }
      }
    },

    // 显示添加界面
    handleAdd: function () {
      this.is_disabled = false
      this.dialogShow = true
      this.editFormTitle = '添加用户'
      this.display = 'display:block'
      this.editForm = this.addForm
    },

    // 显示编辑界面
    handleEdit: function (index, row) {
      this.is_disabled = true
      this.dialogShow = true
      this.editFormTitle = '编辑用户'
      this.display = 'display:none'
      // this.editForm = Object.assign({}, row);
      this.editForm = this.$deepCopy(row)
    },

    // 禁/启 用用户
    handleDisable: function (index, row) {
      if (row.is_active) {
        var res = '禁用'
      } else {
        var res = '启用'
      }
      this.$confirm('确认' + res + '吗?', '警告', {
        type: 'warning'
      }).then(() => {
        this.btnDelLoading = { [row.id]: true }
        this.editForm = row
        this.editForm.is_active = !row.is_active
        this.EditData(row, res + '成功', '')
      }).catch(() => {
      })
    },

    // 重置密码
    RestPwd: function (index, row) {
      this.$confirm('确认重置该账户密码吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        this.editForm = row
        this.editForm.password = 'Password'
        this.EditData(row, '默认密码: ', 'Password')
      }).catch(() => {
      })
    },

    EditData: function (row, msg, pwd) {
      this.$http.put(`/api/account/users/${row.id}`, this.editForm).then(response => {
        this.listLoading = false
        this.$layer_message(msg + pwd, 'success')
        this.getUsers(this.currentPage)
      }, response => this.$layer_message(response.result)).finally(() => this.btnDelLoading = {})
    },

    editSubmit: function () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.editLoading = true
          this.error = ''
          if (this.editForm.id) {
            this.$http.put(`/api/account/users/${this.editForm.id}`, this.editForm).then(this.resp,
              response => this.$layer_message(response.result)).finally(() => this.editLoading = false)
          } else {
            this.$http.post('/api/account/users/', this.editForm).then(this.resp,
              response => this.$layer_message(response.result)).finally(() => this.editLoading = false)
          }
        }
      })
    },
    resp: function (response) {
      this.editLoading = false
      this.$layer_message('提交成功', 'success')
      this.editForm = {}
      this.addForm = { role_id: '' }
      this.dialogShow = false
      this.getUsers(this.currentPage)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
