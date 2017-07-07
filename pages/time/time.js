var app=getApp()
var param = {
    data: {
        clock: '',
        avatar:'',
        total_pay:0,
        discount:0,
        address:'',
        duringMs:0,
        time_pay:'',
        channelID:'',
        setTime:'',
        token:'',
        did:'',
        sid:''
    },
    onLoad: function (option) {
      wx.setStorageSync('duringMs', option.duringMs);
      var that = this;
        that.setData({
            avatar:wx.getStorageSync('avatar'),
            address:option.address,
            did:option.did,
            token:option.token,
            total_pay:option.price,
            time_pay:option.time_pay,
            channelID:option.channelID,
            setTime:option.duringMs,
            sid:app.globalData.sid,
            duringMs:option.duringMs*60*1000-1*1000
        });
        that.control();
    },
    // 数据点远程控制
    control: function () {
      var that = this;
        wx.request({
            url: 'https://washer.mychaochao.cn/db/gizwit.php',
            data: {
                cmd: 'control',
                sid: that.data.sid,
                token: that.data.token,
                did: that.data.did,
                attrs: JSON.stringify({
                    ["switch_" + that.data.channelID]: true,
                    ['countdown' + that.data.channelID]: parseInt(that.data.setTime)
                })
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': "PHPSESSID=" + that.data.sid
            },
            success: function (res3) {
                console.log(res3);
                that.count_down();
            }
        })
    },
    /* 毫秒级倒计时 */
    count_down: function () {
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
}
Page(param)