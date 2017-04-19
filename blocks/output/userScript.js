const Block = require('../block')

const path = require('path')

class UserScript extends Block {
  constructor (data) {
    super(data)
    try {
      const plugin = require(path.join(data.cwd, data.script))
      const electron = require('electron')
      this.script = plugin({
        console: this.logger,
        cwd: data.cwd,
        clipboard: electron.clipboard,
        nativeImage: electron.nativeImage,
      })
    } catch (e) {
      this.script = false
      this.loadError = e
    }
  }

  call (state, env = {}) {
    if (!this.script) {
      this.logger.error('Plugin failed to load', this.loadError)
      return Promise.resolve()
    }
    this.logger.log('verbose', 'Executing Script', { value: state.value })
    return this._ensurePromise(this.script(state.value, env)).then((output) => {
      state.value = output
      this.logger.log('info', 'User Script results', { value: state.value })
      return state.next()
    }).catch((error) => {
      this.logger.error('User Script failed', { value: state.value, error })
    })
  }
}

module.exports = UserScript
