const jwt = require('jsonwebtoken')

const userController = {
  signIn: (req, res, next) => {
    // 拿著已驗證的驗證資訊，用jwt套件來做token並且用res.json來把token跟req.user回傳 (在呼叫這個方法前需要通過中間件的驗證並把已驗證的user放在req.user)
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController
