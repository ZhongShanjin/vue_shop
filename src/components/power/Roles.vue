<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col :span="1">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-row
              v-for="(item1, i1) in row.children"
              :class="[
                i1 == row.children.length - 1 ? '' : 'bdbottom',
                'vcenter',
              ]"
              :key="item1.id"
              closable
              @close="removeRightByid(row, item1.id)"
            >
              <!-- 一级权限 -->
              <el-col :span="1"></el-col>
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <el-icon><CaretRight /></el-icon>
              </el-col>
              <!-- 二级、三级权限s -->
              <el-col :span="18">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :class="[i2 == 0 ? '' : 'bdtop', 'vcenter']"
                  :key="item2.id"
                  closable
                  @close="removeRightByid(row, item2.id)"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <el-icon><CaretRight /></el-icon>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightByid(row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template #default="{ row }">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="Edit"
              size="small"
              @click="showEditDialog(row.id)"
              >编辑
            </el-button>

            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="Delete"
              size="small"
              @click="removeRoleById(row.id)"
              >删除
            </el-button>

            <!-- 分配角色按钮 -->
            <el-button
              type="warning"
              icon="Setting"
              size="small"
              @click="showSetRightDialog(row)"
              >分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改用户的对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改角色" width="50%">
      <!-- 内容主体区 -->
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="90px"
        status-icon
        @close="editDialogClosed"
      >
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName" disabled="true" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc" />
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

    <!-- 添加角色的对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加角色"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        status-icon
        label-width="90px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc" />
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addRole">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      v-model="setRightDialogVisible"
      title="分配权限"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      />
      <!-- 底部区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="allotRights">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      //默认选中的节点Id值
      defKeys: [],
      //当前即将分配权限的角色id
      roleId: '',
      //所有权限的数据
      rightslist: [],
      //控制分配权限对话框的显示和隐藏
      setRightDialogVisible: false,
      //所有角色列表数据
      roleList: [],
      //控制修改角色对话框的显示与隐藏
      editDialogVisible: false,
      //查询到的角色信息对象
      editForm: {},
      //修改角色表单数据的验证规则
      editFormRules: {
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'change' },
          {
            min: 3,
            max: 10,
            message: '角色描述的长度在3~10个字符之间',
            trigger: 'change',
          },
        ],
      },
      // 控制角色对话框的显示与否
      addDialogVisible: false,
      //添加角色表单数据
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      //添加角色表单数据的验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'change' },
          {
            min: 3,
            max: 10,
            message: '角色名称的长度在3~10个字符之间',
            trigger: 'change',
          },
        ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'change' },
          {
            min: 3,
            max: 10,
            message: '角色描述的长度在3~10个字符之间',
            trigger: 'change',
          },
        ],
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      //如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    //点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      //获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.$message.success('获取权限数据成功')
      //把获取到的权限数据保存到rightslist
      this.rightslist = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      //如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.$message.success('获取角色列表成功')
      this.roleList = res.data
    },
    //展示编辑角色的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //监听修改角色对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //修改角色信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        console.log(this.editForm.roleId)
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败')
        } else {
          this.$message.success('更新角色信息成功')
          this.editDialogVisible = false
          this.getRolesList()
        }
      })
    },
    //根据Id删除对应的角色信息
    async removeRoleById(id) {
      //弹框询问角色是否删除数据
      const confirmResult = await this.$confirm
        .confirm('此行为将永久删除角色，继续?', '警告', {
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
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除用户成功 ')
      this.getRolesList()
    },
    //对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //添加新角色
    addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败')
        } else {
          this.$message.success('添加角色成功')
          this.addDialogVisible = false
          this.getRolesList()
        }
      })
    },
    async removeRightByid(role, rightsId) {
      //弹框询问角色是否删除数据
      const confirmResult = await this.$confirm
        .confirm('此行为将永久删除该权限，继续?', '警告', {
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
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightsId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      role.children = res.data
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
