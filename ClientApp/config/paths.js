const path = require('path')

function paths() {
  this.root = path.join(__dirname, '../')
  this.src = path.join(this.root, 'src/')
  this.config = path.join(this.root, 'config/')
  this.dist = path.join(this.root, 'dist/')
  this.modules = path.join(this.root, 'node_modules')
  this.public = path.join(this.root, 'public')
}

module.exports = new paths()