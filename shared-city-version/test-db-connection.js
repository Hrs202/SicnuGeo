const { pool } = require('./src/utils/db');

// 测试数据库连接
async function testDbConnection() {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    console.log('数据库连接成功! 当前时间:', res.rows[0].current_time);
    console.log('请确保已在.env文件中正确配置数据库凭据');
  } catch (err) {
    console.error('数据库连接失败:', err.message);
    console.error('请检查.env文件中的数据库配置是否正确');
  } finally {
    // 关闭连接池
    await pool.end();
  }
}

testDbConnection();