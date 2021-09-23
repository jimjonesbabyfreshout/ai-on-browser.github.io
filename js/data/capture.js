import ImageData from './image.js'

export default class CaptureData extends ImageData {
	constructor(manager) {
		super(manager)

		this._size = [240, 360]

		const elm = this.setting.data.configElement
		this._mngelm = elm.append('div')
		this._mngelm
			.append('input')
			.attr('type', 'button')
			.attr('value', 'Add data')
			.on('click', () => this.startVideo())
		this._slctImg = this._mngelm.append('select').on('change', () => {
			this._manager.platform.render()
			this._thumbnail.selectAll('*').remove()
			this._thumbnail.node().append(this._createCanvas(this.x[0]))
		})
		this._thumbnail = this._mngelm.append('span')
		this._videoElm = elm.append('div')
		this.startVideo()

		this._x = []
		this._y = []
	}

	get availTask() {
		return ['SG', 'DN', 'ED']
	}

	get x() {
		const idx = +this._slctImg.property('value') - 1
		if (this._x.length === 0 || !this._x[idx]) {
			return []
		}
		return [this._x[idx]]
	}

	startVideo() {
		this._mngelm.style('display', 'none')
		this._videoElm.append('div').text('Click video to use as data.')
		this._video = this._videoElm
			.append('video')
			.attr('width', this._size[1])
			.attr('height', this._size[0])
			.property('autoplay', true)
			.on('click', () => {
				this.readImage(this._video, image => {
					this._x.push(image)
					this._y.push(0)
					this._slctImg.append('option').attr('value', this._x.length).text(this._x.length)
					this._slctImg.property('value', this._x.length)
					this._thumbnail.selectAll('*').remove()
					this._thumbnail.node().append(this._createCanvas(image))

					this.stopVideo()
					this._mngelm.style('display', null)
					if (this._manager.platform.render) {
						setTimeout(() => {
							this._manager.platform.render()
						}, 0)
					}
				})
			})
			.node()

		navigator.mediaDevices
			.getDisplayMedia({ video: true })
			.then(stream => {
				this._video.srcObject = stream
			})
			.catch(e => {
				console.error(e)
				this.stopVideo()
				this._mngelm.style('display', null)
			})
	}

	stopVideo() {
		if (this._video) {
			const stream = this._video.srcObject
			if (stream) {
				stream.getTracks().forEach(track => {
					track.stop()
				})
				this._video.srcObject = null
			}
			this._video = null
		}
		this._videoElm.selectAll('*').remove()
	}

	terminate() {
		super.terminate()
		this.stopVideo()
	}
}