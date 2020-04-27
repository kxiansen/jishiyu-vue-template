<template>
  <el-dialog
    :title="role.name + '- 权限管理'"
    :visible.sync="visible"
    width="80%"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <table
      v-if="codes !== undefined"
      class="role_table"
    >
      <tr class="el-table__row">
        <td rowspan="1">Dashboard</td>
        <td rowspan="1">Dashboard</td>
        <tag-td :item="codes['home_view']" />
        <td />
        <td />
      </tr>
      <tr class="el-table__row">
        <td rowspan="4">用户管理</td>
        <td rowspan="2">用户列表</td>
        <tag-td :item="codes['account_user_view']" />
        <tag-td :item="codes['account_user_add']" />
        <tag-td :item="codes['account_user_edit']" />
      </tr>
      <tr>
        <tag-td :item="codes['account_user_del']" />
        <tag-td :item="codes['account_user_disable']" />
        <td />
      </tr>
      <tr>
        <td rowspan="2">角色权限</td>
        <tag-td :item="codes['account_role_view']" />
        <tag-td :item="codes['account_role_add']" />
        <tag-td :item="codes['account_role_edit']" />
      </tr>
      <tr>
        <tag-td :item="codes['account_role_del']" />
        <tag-td :item="codes['account_role_permission_view']" />
        <tag-td :item="codes['account_role_permission_edit']" />
      </tr>

    </table>
    <el-table
      v-else
      v-loading="loading"
    />
    <div slot="footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button
        v-if="has_permission('account_role_permission_edit')"
        type="primary"
        :loading="btnSaveLoading"
        @click="saveCommit"
      >保存</el-button>
    </div>
  </el-dialog>
</template>

<style>
.role_table {
  width: 100%;
  background-color: #fff;
  border-collapse: collapse;
  border: 1px solid #dfe6ec;
  text-align: center;
  font-size: 14px;
  color: #1f2d3d;
}

.role_table td {
  height: 40px;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  border-bottom: 1px solid #dfe6ec;
  border-right: 1px solid #dfe6ec;
}
</style>

<script>
import TagTd from './TagTd.vue'

export default {
  components: {
    'tag-td': TagTd
  },
  props: ['role'],
  data() {
    return {
      visible: true,
      loading: false,
      btnSaveLoading: false,
      codes: undefined
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    fetch() {
      this.loading = true
      this.$http.get(`/api/account/roles/${this.role.id}/permissions`).then(res => {
        this.codes = res.result
      }, res => this.$layer_message(res.result)).finally(() => this.loading = false)
    },
    saveCommit() {
      this.btnSaveLoading = true
      const codes = []
      for (const item of Object.values(this.codes)) {
        if (item.is_has) {
          codes.push(item.id)
        }
      }
      this.$http.post(`/api/account/roles/${this.role.id}/permissions`, { codes: codes }).then(() => {
        this.visible = false
      }, res => this.$layer_message(res.result)).finally(() => this.btnSaveLoading = false)
    }
  }
}
</script>
