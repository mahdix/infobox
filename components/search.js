const React = require('react')
const globalEmitter = require('../lib/globalEmitter')
const keyboard = require('../lib/keyboard')
const mergeUnique = require('../lib/mergeUnique')

const Search = React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
    handleQueryChange: React.PropTypes.func.isRequired,
  },

  getInitialState () {
    return {
      input: null,
      history: [],
    }
  },

  selectAll () {
    if (this.state.historyId === -1 || !this.state.input) return
    this.state.input.select()
  },

  focus () {
    this.state.input && this.state.input.focus()
  },

  handleSaveQuery () {
    if (!this.props.value) return
    const haystack = mergeUnique(this.props.value, this.state.history)
    this.setState({
      historyId: -1,
      history: haystack.slice(0, 10),
    })
  },

  canTraverseValue () {
    const { input } = this.state
    if (!input) return false
    const hasNoText = input.value.length === 0
    const isFullySelected = input.selectionStart !== input.selectionEnd
    return hasNoText || isFullySelected
  },

  handlePreviousSearch () {
    const historyId = this.state.historyId + 1
    this.props.handleQueryChange(this.state.history[historyId])
    this.setState({
      historyId,
    })
  },

  handleNextSearch () {
    const historyId = this.state.historyId - 1
    this.props.handleQueryChange(this.state.history[historyId])
    this.setState({
      historyId,
    })
  },

  componentDidMount () {
    globalEmitter.on('hideWindow', this.handleSaveQuery)
    keyboard.bind('search', 'up', () => {
      if (this.canTraverseValue()) {
        this.handlePreviousSearch()
      }
    })
    keyboard.bind('search', 'down', () => {
      if (this.canTraverseValue()) {
        this.handleNextSearch()
      }
    })
    this.focus()
  },

  componentWillUnmount () {
    globalEmitter.removeListener('hideWindow', this.handleSaveQuery)
    keyboard.unbind('search')
  },

  componentDidUpdate () {
    if (this.props.value === '') {
      this.focus()
    }
    this.selectAll()
  },

  handleQueryChange (event) {
    const query = event.target.value
    this.props.handleQueryChange(query)
    this.setState({
      historyId: -1,
    })
  },

  setReference (input) {
    this.setState({
      input,
    })
  },

  render () {
    const { value } = this.props

    return (
      <input
        title='Search Zazu'
        className='mousetrap'
        ref={this.setReference}
        type='text'
        onChange={this.handleQueryChange}
        value={value} />
    )
  },
})

module.exports = Search
