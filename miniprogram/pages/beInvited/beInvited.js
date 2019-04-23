const db = wx.cloud.database()
const teamCollection = db.collection('team')
const userCollection = db.collection('user')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hide:true,
    teamId:'',
    userList:[],
    teamName:'',
    userId:'',
    userOtherName:'',
    listLength:-1,
    hasLogined:false,
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('【传入新建团队id参数】【传入团队id参数成功】',options)
    this.data.teamId=options.teamId
    this.data.userId =getApp().globalData.openId
    teamCollection.doc(options.teamId)
      .get({
        success: res => {
          console.log('【获取指定team信息】【获取成功】', res.data),
            this.setData({
              leaderId: res.data.name,
              userList:res.data.userList,
              listLength:res.data.userList.length
            })
            //先获得指定team的成员列表，下面检查加入的成员是不是已经有了
          var uList = res.data.userList
          var llength = res.data.userList.length
          wx.getSetting({
            success: res => {
              //先判断是否授权，未授权要跳到第一个授权界面
              if (res.authSetting['scope.userInfo']) {
                console.log("【用户授权】【已授权】")
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    console.log('【获取用户信息】【获取信息成功】', res.userInfo)//调试：输出获取到的用户信息判断是否成功获取
                    this.setData({
                      userInfo: res.userInfo//把成功获取的内容存到这个page的data里面
                    })
                    // this.globalData.userInfo=res.userInfo
                    // wx.cloud.callFunction({
                    //   name: 'getOpenid', 
                    //   complete: res => {
                    //     this.globalData.openid = res.result.openid;
                    //   }
                    // }),
                    wx.cloud.callFunction({
                      name: 'login',
                      data: {},
                      success:res=> {
                        db.collection('user').where({
                          openid:res.result.openid})
                          .get({
                            success: res => {
                              console.log('【获取指定用户user集合中的记录id】【获取成功】', res.data[0]._id,uList[0].id)
                              //通过上面通过openid在集合获得的id去对照成员列表
                              //并且通过遍历找到是否存由该成员
                              //有则去index界面
                              //无则去填入备注并加入团队
                              for (var i = 0; i <=uList.length; i++) {
                                if(i==uList.length&&this.data.hide==false){
                                  this.setData({
                                    // hide:true
                                  })
                                  console.log('【用户是否已存在团队之中】，【不存在同时显示加入团队按钮】')
                                  break;
                                }
                                if (uList[i].id ==res.data[0]._id) {
                                  wx.switchTab({
                                    url: '/pages/index/index'
                                  })
                                  console.log('【用户是否已存在团队之中】，【已存在并跳转首页】')
                                  break;
                                }
                              }
                            }
                          })
                      }
                       
                     
                    })
                    // console.log("【用户信息存入】【信息成功存入globalData中】", getApp().globalData)//若完成上一步走到这一步的话输出“成功”
                  }
                })
              }
            }
          })
          
        }
      })
    
    
  },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      wx.getSetting({
        success: res => {
          //先判断是否授权，未授权要跳到第一个授权界面
          if (res.authSetting['scope.userInfo']) {
            console.log("【用户授权】【已授权】")
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                console.log('【获取用户信息】【获取openid信息成功】', res.userInfo)//调试：输出获取到的用户信息判断是否成功获取
                // this.setData({
                //   userInfo: res.userInfo//把成功获取的内容存到这个page的data里面
                // })
                // this.globalData.userInfo=res.userInfo
                // wx.cloud.callFunction({
                //   name: 'getOpenid', 
                //   complete: res => {
                //     this.globalData.openid = res.result.openid;
                //   }
                // }),
                wx.cloud.callFunction({
                  name: 'login',
                  data: {},
                  success: res => {
                    db.collection('user').where({
                      openid: res.result.openid
                    })
                      .get({
                        success: res => {
                          console.log('【获取指定用户user集合中的记录id】【获取成功】', res.data[0]._id, this.data.userList[0].id)
                          //通过上面通过openid在集合获得的id去对照成员列表
                          //并且通过遍历找到是否存由该成员
                          //有则去index界面
                          //无则去填入备注并加入团队
                          for (var i = 0; i <= this.data.userList.length; i++) {
                            if (i == this.data.userList.length && this.data.hide == false) {
                              this.setData({
                                hide:true
                              })
                              console.log('【用户是否已存在团队之中】，【不存在同时显示加入团队按钮】')
                              break;
                            }
                            if (this.data.userList[i].id == res.data[0]._id) {
                              wx.switchTab({
                                url: '/pages/index/index'
                              })
                              console.log('【用户是否已存在团队之中】，【已存在并跳转首页】')
                              break;
                            }
                          }
                        }
                      })
                  }


                })
                // console.log("【用户信息存入】【信息成功存入globalData中】", getApp().globalData)//若完成上一步走到这一步的话输出“成功”
              }
            })
          }
        }
      })
      //插入登录的用户的相关信息到数据库
      userCollection.add({
        data: {
          "nickName": this.data.userInfo.nickName,//读取这个页面的data里面userInfo这个列表的nickName项
          // "gender": this.data.userInfo.gender,//同理
          "avatarUrl": this.data.userInfo.avatarUrl
          // "city": "CITY",
          // "province": "PROVINCE",
          // "country": "COUNTRY",
          // "avatarUrl": "AVATARURL",
          // "unionId": "UNIONID"
          // "avatarUrl": res.userInfo.avatarUrl,
          // "userInfo": res.userInfo
          // "watermark":
          // {
          //   "appid": "APPID",
          //   "timestamp": TIMESTAMP
          // }

        }
      })
      //授权成功后，跳转进入小程序首页
      
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '提示',
        content: '您点击了拒绝授权，将无法进入团队，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },
  onUserOtherNameInput: function (e) {
    this.setData({
      userOtherName: e.detail.value
    })
  },
  addTeam:function(e){
    if(this.data.userOtherName){
      wx.cloud.callFunction({
        name: 'addTeamMember',
        data: {
          id:this.data.userId,
          nickName: this.data.userInfo.nickName,
          url:this.data.userInfo.avatarUrl
        },
        success: res => {
          // output: res.result === 3
        },
        fail: err => {
          // handle error
        },
        complete: () => {
          // ...
        }
      })
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})