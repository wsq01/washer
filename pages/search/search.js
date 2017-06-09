var app = getApp();
var param = {
  data: {
    busy: 0,
    free: 0,
    searchid: '',
    floors: []
  },
  onLoad: function (option) {
    var that = this;
    this.setData({
      searchid: wx.getStorageSync('washerId')
    }),
      that.search();
  },
  search: function () {
    var that = this;
    //获取当前洗衣机所在学校楼层
    wx.request({
      url: 'https://washer.mychaochao.cn/db/socket.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'get',
        id: that.data.searchid
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + app.globalData.sid
      },
      success: function (res) {
        console.log(res);
        if(res.data.errno=="1"){
          if (res.data.sockets.length == 0) {
          wx.showModal({
            content: '查询失败',
            title: '提示'
          })
        }
        var building = res.data.sockets[0].building;
        var floor = res.data.sockets[0].floor;
        var school = res.data.sockets[0].school;
        // 获取所有洗衣机信息 匹配
        var floorName=''
        wx.request({
          url: 'https://washer.mychaochao.cn/db/socket.php',
          data: {
            sid: app.globalData.sid,
            cmd: 'get'
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': "PHPSESSID=" + app.globalData.sid
          },
          success: function (res) {
            console.log(res);
            if(res.data.errno=="1"){
              var theWasher = res.data.sockets;
            var floors = [];
            for (var j = 1; j <= 1; j++) { //楼层
              var obj = {
                xfree: 0, xbusy: 0, hfree: 0, hbusy: 0
              };
              for (var i = 0; i < theWasher.length; i++) {
                if (theWasher[i].school == school && theWasher[i].building == building) {
                  if (theWasher[i].floor == floor && theWasher[i].status == '0' && theWasher[i].type == '1') {
                    obj.xfree++;
                  } else if (theWasher[i].floor == floor && theWasher[i].status == '1' && theWasher[i].type == '1') {
                    obj.xbusy++;
                  } else if (theWasher[i].floor == floor && theWasher[i].status == '0' && theWasher[i].type == '2') {
                    obj.hfree++;
                  } else if (theWasher[i].floor == floor && theWasher[i].status == '1' && theWasher[i].type == '2') {
                    obj.hbusy++;
                  }
                }
              }
              floors.push(obj);
            };
            that.setData({
              floors: floors
            })
            }
          }
        })
        }
        
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  onShow: function () {
    var that = this;
    that.search();
    this.setData({
      searchid: wx.getStorageSync('washerId')
    })
  }
}
Page(param)