<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级">
          <template #default="{ row }">
            <el-tag v-if="row.level == 0">一级权限</el-tag>
            <el-tag v-if="row.level == 1" type="success">二级权限</el-tag>
            <el-tag v-if="row.level == 2" type="warning">三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //列表权限数组
      rightsList: [],
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      //如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.$message.success('获取权限列表成功')
      this.rightsList = res.data
    },
  },
}
</script>
<style lang="less" scoped></style>
