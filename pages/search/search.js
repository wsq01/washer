var app = getApp();
var param = {
  data: {
    searchid: '',
    items: [],
    sid: '',
    socketsLength: false,
    clock:0
  },
  onPullDownRefresh: function () {
    this.onLoad();
    wx.stopPullDownRefresh()
  },
  onLoad: function (option) {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000
    })
    var that = this;
    this.setData({
      sid: app.globalData.sid,
      searchid: wx.getStorageSync('washerId')
    }),
    that.search();
  },
  // onReady:function(){
  //   console.log(this.data.items);
  //   var that=this;
  //   var x=that.data.items
  //   // that.count_down(that.data.items[0].diff)
  //   x=new Date(x).getTime()
  //   console.log(x)
  // },
  demo:function(floor){
    var that=this;
    wx.request({
      url: 'https://washer.mychaochao.cn/db/socket.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'get_socket_status',
        floor:floor
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + app.globalData.sid
      },
      success:function(res){
        console.log(res);
        for(var i=0;i<res.data.lists.length;i++){
          if(res.data.lists[i].diff){
            var startTime=res.data.lists[i].starttime;
            var duringMs=Number(res.data.lists[i].duration*60);
            var nowTime=res.data.lists[i].now;
            var countDown = startTime + duringMs-nowTime;
            if(countDown<=0){
              countDown=0
            }
            res.data.lists[i].diff=that.date_format(countDown*1000);
          }
          if(res.data.lists[i].socket_status=="0"){
            res.data.lists[i].socket_status="空闲";
            res.data.lists[i].statusClass="green";
          }else{
            res.data.lists[i].socket_status = "忙碌";
            res.data.lists[i].statusClass = "red";
          }
        }
        that.setData({
          items: res.data.lists
        })
        wx.hideToast();
      }
    })
    // that.count_down(that.data.items);
    // console.log(that.data.items);
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
    return  min + ":" + sec;
  },
  /* 分秒位数补0 */
  fill_zero_prefix: function (num) {
    return num < 10 ? "0" + num : num
  },
  /* 毫秒级倒计时 */
  count_down: function (x) {
    var that = this;
    // 渲染倒计时时钟  
    that.setData({
      clock: that.date_format(that.data.duringMs)
    });
    if (that.data.duringMs <= 0) {
      that.setData({
        clock: "洗衣结束"
      });
      // timeout则跳出递归  
      return;
    }
    setTimeout(function () {
      // 放在最后--  
      that.data.duringMs -= 1000;
      that.count_down();
    }, 990)
  },
  search: function () {
    var that = this;
    //获取当前洗衣机所在楼层
    wx.request({
      url: 'https://washer.mychaochao.cn/db/socket.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'get',
        num: that.data.searchid
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + app.globalData.sid
      },
      success: function (res) {
        console.log(res);
        if (res.data.errno == "1") {
          if (res.data.sockets.length == 0) {
            wx.hideToast();
            that.setData({
              socketsLength: true
            })
          } else {
            that.setData({
              socketsLength: false
            })
            var building = res.data.sockets[0].building;
            var floor = res.data.sockets[0].floor;
            var school = res.data.sockets[0].school;
            var city=res.data.sockets[0].city;
            that.demo(floor);
          }
        }
      }
    })
  }
}
Page(param)