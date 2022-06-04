<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域视图 -->
    <el-card>
      <!-- 警告 -->
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
      />

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col align="left">
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            ref="cascaderHandle"
            :options="catelist"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange"
            clearable
            style="width: 250px"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-change="handleTabClick" align="left">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe default-expand-all>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template #default="{ row }">
                <div>
                  <!-- 循环渲染Tag标签 -->
                  <el-tag
                    v-for="(item, index) in row.attr_vals"
                    :key="index"
                    closable
                    @close="handleClose(index, row)"
                  >
                    {{ item }}</el-tag
                  >
                  <!-- 输入的文本框 -->
                  <el-input
                    v-if="row.inputVisible"
                    v-model="row.inputValue"
                    size="small"
                    class="input-new-tag"
                    @change="handleInputConfirm(row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    size="small"
                    @click="showInput(row)"
                    class="button-new-tag"
                    >+ New Tag</el-button
                  >
                </div>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#" />
            <el-table-column label="参数名称" prop="attr_name" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  icon="Edit"
                  size="small"
                  @click="showEditDialog(row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="Delete"
                  size="small"
                  @click="removeParams(row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe default-expand-all>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template #default="{ row }">
                <div>
                  <!-- 循环渲染Tag标签 -->
                  <el-tag
                    v-for="(item, index) in row.attr_vals"
                    :key="index"
                    closable
                    @close="handleClose(index, row)"
                  >
                    {{ item }}</el-tag
                  >
                  <!-- 输入的文本框 -->
                  <el-input
                    v-if="row.inputVisible"
                    v-model="row.inputValue"
                    size="small"
                    class="input-new-tag"
                    @change="handleInputConfirm(row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    size="small"
                    @click="showInput(row)"
                    class="button-new-tag"
                    >+ New Tag</el-button
                  >
                </div>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#" />
            <el-table-column label="属性名称" prop="attr_name" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  icon="Edit"
                  size="small"
                  @click="showEditDialog(row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="Delete"
                  size="small"
                  @click="removeParams(row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      v-model="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      v-model="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类的数据列表，默认为空
      catelist: [],
      //指定级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
      },
      //级联选择框双向绑定到的的Id数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 添加参数的对话框
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {},
      //添加参数表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'change' },
        ],
      },
      // 修改参数的对话框
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {},
      //修改参数表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'change' },
        ],
      },
      //控制按钮与文本框的切换显示
      inputVisible: false,
      //文本框中输入的内容
      inputValue: '',
    }
  },
  created() {
    //获取商品分类数据
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      //把数据列表赋值给catelist
      this.catelist = res.data
      this.$message.success('获取商品分类成功!')
    },
    // 级联选择项发生变化触发这个函数
    handleChange() {
      //选中后隐藏级联选择框
      if (this.$refs.cascaderHandle) {
        this.$refs.cascaderHandle.popperVisible = false
      }
      this.getParamsData()
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData()
    },
    //获取参数的列表数据
    async getParamsData() {
      //如果selectedCateKeys数组中的length !== 3，证明选中的不是三级分类
      if (this.selectedCateKeys && this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //证明选中的是三级分类
      //根据所选分类的Id，和当前所处的面板，获取对应的参数

      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      this.$message.success('获取参数列表成功')
      // 获取Tag的数据分割为数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示和隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      // 保存参数列表
      if (this.activeName == 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        }
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    // 监听对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //添加参数
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败!')
        }
        this.$message.success('修改参数成功!')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 点击按钮展示修改的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName },
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败!')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    async removeParams(id) {
      const confirmResult = await this.$confirm
        .confirm('此操作将永久删除该分类, 是否继续?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作!')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 文本框失去焦点，或摁下了Enter都会触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //用户输入的内容有效
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    //点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true
    },
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    //将对attr_vals的操作，保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
  },
  computed: {
    //如果三级分类没被选中，返回false，否则返回true
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    //当前选中的三级分类的Id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}
.el-tag {
  margin-left: 10px;
}
.input-new-tag {
  margin-left: 10px;
  width: 90px;
}
.button-new-tag {
  margin-left: 10px;
}
</style>
