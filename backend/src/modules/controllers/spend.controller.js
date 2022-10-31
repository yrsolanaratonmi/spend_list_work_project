const Spend = require('../../db/models/spend/index')

module.exports.createSpend = (req, res) => {
  const {place, price} = req.body
  try {
    if (typeof place === 'string' &&
        place &&
        price &&
        price > 0
    ) {
      const time = new Date()
      const spend = new Spend({place : req.body.place, time, price : req.body.price})
      spend.save().then(result => res.send(result))
    } else {
      res.status(400).send ('uncorrected data')
    }
  }
  catch (error) {
    res.status(500).send(`server error : ${error}`)
  }


}

module.exports.getAllSpends = (req, res) => {
  try {
    Spend.find().then(result => {
      res.send(result)
    })
  }
  catch (error) {
    res.status(500).send(`server error : ${error}`)
  }

}

module.exports.updateSpend = (req, res) => {
  try {
    const date = new Date(req.body.time)
    const {place, price} = req.body
    if (typeof place === 'string' &&
        place &&
        price &&
        price > 0 &&
        date.toString() != 'Invalid Date'
    ) {
      Spend.findByIdAndUpdate(req.body._id, {place : req.body.place, time : req.body.time, price : req.body.price}).then(result => res.send(result))
    } else res.status(400).send('uncorrected data')
  }
  catch (error) {
    res.status(500).send(`server error : ${error}`)
  }

}

module.exports.deleteSpend = (req, res) => {
  try {
    Spend.findByIdAndDelete({_id: req.query._id}).then(result => res.send(result))
  }
  catch (error) {
    res.status(500).send(`server error : ${error}`)
  }
}