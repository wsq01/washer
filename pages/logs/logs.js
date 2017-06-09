var param={
    toLogin:function(){
        wx.redirectTo({
          url: '../login/login',
          success: function(res){
            // success
            console.log(res);
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        })
    }
}
Page(param)