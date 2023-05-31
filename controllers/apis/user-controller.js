const jwt = require('jsonwebtoken')

const userController = {
  signIn: (req, res, next) => {
    // 用jwt套件來做token並且用res.json來把token跟req.user回傳
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
