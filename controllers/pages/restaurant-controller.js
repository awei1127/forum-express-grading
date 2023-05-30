const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ],
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurants didn't exist!")
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)
        return Promise.all([
          restaurant.increment('viewCounts', { by: 1 }),
          res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
        ])
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        Comment
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurants didn't exist!")
        restaurant = restaurant.toJSON()
        res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [
          ['createdAt', 'DESC']
        ],
        include: [Category],
        nest: true,
        raw: true
      }),
      Comment.findAll({
        limit: 10,
        order: [
          ['createdAt', 'DESC']
        ],
        include: [Restaurant, User],
        nest: true,
        raw: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    // 取得所有餐廳 跟他們的FavoritedUsers
    return Restaurant.findAll({
      include: { model: User, as: 'FavoritedUsers' }
    })
      .then(restaurants => {
        const result = restaurants.map(restaurant => ({
          ...restaurant.toJSON(),
          isFavorited: req.user && restaurant.FavoritedUsers.some(fu => fu.id === req.user.id),
          favoritedCount: restaurant.FavoritedUsers.length
        }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
          .slice(0, 10)
        res.render('top-restaurants', { restaurants: result })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
