<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索、添加 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="Please input"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <template #append>
              <el-button icon="Search" @click="getUserList" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="2"
          ><el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          ></el-col
        >
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽，获取element提供的row对象数组 -->
          <template #default="{ row }">
            <el-switch
              v-model="row.mg_state"
              @change="userStateChanged(row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template #default="{ row }">
            <!-- 修改按钮 -->
            <el-tooltip
              effect="dark"
              content="修改"
              placement="top-start"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="Edit"
                size="small"
                @click="showEditDialog(row.id)"
              />
            </el-tooltip>

            <!-- 删除按钮 -->
            <el-tooltip
              effect="dark"
              content="删除"
              placement="top-start"
              :enterable="false"
            >
              <el-button
                type="danger"
                icon="Delete"
                size="small"
                @click="removeUserById(row.id)"
              />
            </el-tooltip>

            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top-start"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="Setting"
                size="small"
                @click="setRole(row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        v-model:currentPage="queryInfo.pagenum"
        v-model:page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加用户"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        status-icon
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" />
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addUser">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改用户" width="50%">
      <!-- 内容主体区 -->
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="70px"
        status-icon
        @close="editDialogClosed"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled="true" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="editUserInfo">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      v-model="setRoleDialogVisible"
      title="分配角色"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户:{{ userInfo.username }}</p>
        <p>当前的角色:{{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <el-select
            v-model="selectedRoleId"
            class="m-2"
            placeholder="请选择"
            size="large"
          >
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            />
          </el-select>
        </p>
      </div>
      <!-- 底部区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="saveRoleInfo">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        //合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱 '))
    }
    //验证电话的规则
    var checkMobile = (rule, value, cb) => {
      //验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        //合法的手机号
        return cb()
      }
      cb(new Error('请输入合法的手机号 '))
    }

    return {
      //需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      roleList: [],
      //已选中的角色Id值
      selectedRoleId: '',
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      // 控制用户对话框的显示与否
      addDialogVisible: false,
      //添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //添加用户表单数据的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'change' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'change',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          {
            min: 6,
            max: 15,
            message: '密码的长度在6~15个字符之间',
            trigger: 'change',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'change' },
          { validator: checkEmail, trigger: 'change' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'change' },
          { validator: checkMobile, trigger: 'change' },
        ],
      },
      //控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      //查询到的用户信息对象
      editForm: {},
      //添加用户表单数据的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'change' },
          { validator: checkEmail, trigger: 'change' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'change' },
          { validator: checkMobile, trigger: 'change' },
        ],
      },
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //点击按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    //展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      //在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取用户列表失败')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch开关状态的改变
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state != userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    //对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
          this.addDialogVisible = false
          this.getUserList()
        }
      })
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        } else {
          this.$message.success('更新用户信息成功')
          this.editDialogVisible = false
          this.getUserList()
        }
      })
    },
    //根据Id删除对应的用户信息
    async removeUserById(id) {
      //弹框询问用户是否删除数据
      const confirmResult = await this.$confirm
        .confirm('此行为将永久删除用户，继续?', '警告', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .catch((err) => err)
      // 如果用户确认删除，返回值为字符串confirm
      // 如果用户取消删除，返回值为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除用户成功 ')
      this.getUserList()
    },
  },
}
</script>

<style lang="less" scoped></style>
