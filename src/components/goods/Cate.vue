<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col :span="1">
          <el-button type="primary" @click="showAddCateDialog">
            添加分类
          </el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="catelist" row-key="cat_id" border>
        <el-table-column type="index" label="#" />
        <el-table-column prop="cat_name" label="分类名称" />
        <el-table-column label="是否有效">
          <template #default="{ row }">
            <el-icon color="lightgreen" v-if="!row.cat_deleted" size="15px"
              ><CircleCheckFilled
            /></el-icon>
            <el-icon color="red" v-else size="15px"
              ><CircleCloseFilled
            /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template #default="{ row }">
            <el-tag v-if="row.cat_level == 0">一级</el-tag>
            <el-tag v-if="row.cat_level == 1" type="success">二级</el-tag>
            <el-tag v-if="row.cat_level == 2" type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template #default="{ row }">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="Edit"
              size="small"
              @click="showCateDialog(row.cat_id)"
              >编辑
            </el-button>

            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="Delete"
              size="small"
              @click="removeCateById(row.cat_id)"
              >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        :currentPage="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[3, 5, 10, 15]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      v-model="addCateDialogVisible"
      title="添加分类"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" />
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            ref="addcascaderHandle"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            style="width: 100%"
          ></el-cascader>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addCate">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog v-model="setCateDialogVisible" title="编辑分类" width="50%">
      <!-- 内容主体区 -->
      <el-form
        ref="setFormRef"
        :model="setCateForm"
        :rules="setCateFormRules"
        label-width="90px"
        status-icon
        @close="setCateDialogClosed"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="setCateForm.cat_name" />
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setCateDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="setCate">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      //添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        //将要添加的分类的名称
        cat_name: '',
        //父级分类的Id
        cat_pid: 0,
        //分类的等级，默认是1级
        cat_level: 0,
      },
      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'change' },
        ],
      },
      // 编辑分类的表单数据对象
      setCateForm: {
        //将要添加的分类的名称
        cat_name: '',
      },
      //添加分类表单的验证规则对象
      setCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'change' },
        ],
      },
      // 父级分类数据的数组
      parentCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      //选中的父级分类的Id数组
      selectedKeys: [],
      //编辑分类对话框的显示与隐藏
      setCateDialogVisible: false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      //把数据列表赋值给catelist
      this.catelist = res.data.result
      //为总数据列表赋值
      this.total = res.data.total
      this.$message.success('获取商品分类成功!')
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //展示添加分类对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList()
      //再展示对话框
      this.addCateDialogVisible = true
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      //如果selecteKeys数组中的length大于0，证明选中的父级分类，反之，就说明没有选中任何父级分类
      if (this.selectedKeys && this.selectedKeys.length > 0) {
        //父级分类的Id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        //父级分类的Id
        this.addCateForm.cat_pid = 0
        //为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
      //选中后隐藏级联选择框
      if (this.$refs.addcascaderHandle) {
        this.$refs.addcascaderHandle.popperVisible = false
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 点击按钮，编辑分类名称
    setCate() {
      this.$refs.setFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.setCateForm.cat_id,
          { cat_name: this.setCateForm.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败')
        }
        this.$message.success('更新分类成功')
        this.getCateList()
        this.setCateDialogVisible = false
      })
    },
    //监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      //父级分类的Id
      this.addCateForm.cat_pid = 0
      //为当前分类的等级赋值
      this.addCateForm.cat_level = 0
    },
    //监听对话框的关闭事件，重置表单数据
    setCateDialogClosed() {
      this.$refs.setFormRef.resetFields()
      this.setCateForm.cat_name = ''
      this.setCateForm.cat_id = ''
    },
    //根据Id删除对应的分类信息
    async removeCateById(id) {
      //弹框询问角色是否删除数据
      const confirmResult = await this.$confirm
        .confirm('此行为将永久删除分类，继续?', '警告', {
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
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除分类成功 ')
      this.getCateList()
    },
    //展示编辑分类的对话框
    async showCateDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询信息失败')
      }
      this.setCateForm = res.data
      this.setCateDialogVisible = true
    },
  },
}
</script>

<style lang="less" scoped></style>
