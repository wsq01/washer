var app=getApp()
Page({
  data:{
    clock:'',
    orderId:'',
    sid:'',
    address:'',
    time_pay:'',
    total_pay:0,
    discount:0,
    avatar:'',
    duringMs:''
  },
  onLoad:function(option){
    console.log(option);
    this.setData({
      orderId:option.orderId,
      avatar: wx.getStorageSync('avatar'),
      sid: app.globalData.sid
    })
    this.getOrder();
  },
  getOrder:function(){
    var that=this;
    wx.request({
      url: 'https://washer.mychaochao.cn/db/order.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'get_orders',
        order: that.data.orderId
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success:function(res){
        console.log(res);
        that.setData({
          address:res.data.orders[0].addr,
          time_pay:res.data.orders[0].starttime,
          total_pay:res.data.orders[0].amount,
          duringMs:res.data.orders[0].duration,
          time_pay:res.data.orders[0].starttime
        })
        var start_time = new Date(res.data.orders[0].starttime).getTime();
        var duringMs = res.data.orders[0].duration * 60 * 1000;
        var nowTime = new Date().getTime();
        var endTime = start_time + duringMs;
        var countTime = endTime - nowTime;
        that.count_down(countTime);
      }
    })
  },
  /* 毫秒级倒计时 */
  count_down: function (countTime) {
    var that = this;
    // 渲染倒计时时钟  
    that.setData({
      clock: that.date_format(countTime)
    });
    if (countTime <= 0) {
      that.setData({
        clock: "洗衣结束"
      });
      return;
    }
    setTimeout(function () {
      countTime -= 1000;
      that.count_down(countTime);
    }, 1000)
  },
  /* 格式化倒计时 */
  date_format: function (micro_second) {
    var that = this
    // 秒数  
    var second = Math.floor(micro_second / 1000);
    // 小时位  
    var hr = Math.floor(second / 3600);
    // 分钟位  
    var min = that.fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
    // 秒位  
    var sec = that.fill_zero_prefix(second % 60);
    return hr + ":" + min + ":" + sec + " ";
  },
  /* 分秒位数补0 */
  fill_zero_prefix: function (num) {
    return num < 10 ? "0" + num : num
  }
})