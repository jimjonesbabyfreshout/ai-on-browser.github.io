import NeuralNetwork from './neuralnetwork.js'

export default class Word2Vec {
	// https://qiita.com/g-k/items/69afa87c73654af49d36
	constructor(method, n, wordsOrNumber, reduce_size, optimizer) {
		this._words = [null]
		this._wordsIdx = {}
		this._wordsNumber = null
		this._n = n
		this._method = method

		if (Array.isArray(wordsOrNumber)) {
			this._words = [null, ...new Set(wordsOrNumber)]
			this._wordsNumber = this._words.length
			for (let i = 1; i < this._wordsNumber; i++) {
				this._wordsIdx[this._words[i]] = i
			}
		} else {
			this._wordsNumber = wordsOrNumber
		}
		this._layers = [{ type: 'input', name: 'in' }]
		this._layers.push({
			type: 'full',
			out_size: reduce_size,
			name: 'reduce',
		})
		this._layers.push({
			type: 'full',
			out_size: this._wordsNumber,
		})

		this._model = new NeuralNetwork(this._layers, 'mse', optimizer)
		this._epoch = 0
	}

	get epoch() {
		return this._epoch
	}

	fit(words, iteration, rate, batch) {
		const idxs = []
		for (const word of words) {
			if (this._wordsIdx.hasOwnProperty(word)) {
				idxs.push(this._wordsIdx[word])
			} else if (this._wordsNumber <= this._words.length) {
				idxs.push(0)
			} else {
				this._words.push(word)
				idxs.push((this._wordsIdx[word] = this._words.length - 1))
			}
		}
		const x = []
		const y = []
		if (this._method === 'CBOW') {
			for (let i = 0; i < idxs.length; i++) {
				const xi = Array(this._wordsNumber).fill(0)
				const yi = Array(this._wordsNumber).fill(0)
				for (let k = 1; k <= this._n; k++) {
					if (i - k >= 0) {
						xi[idxs[i - k]]++
					}
					if (i + k < idxs.length) {
						xi[idxs[i + k]]++
					}
				}
				yi[idxs[i]] = 1
				x.push(xi)
				y.push(yi)
			}
		} else {
			for (let i = 0; i < idxs.length; i++) {
				const xi = Array(this._wordsNumber).fill(0)
				xi[idxs[i]] = 1
				for (let k = 1; k <= this._n; k++) {
					if (i - k >= 0) {
						const yi = Array(this._wordsNumber).fill(0)
						yi[idxs[i - k]] = 1
						x.push(xi)
						y.push(yi)
					}
					if (i + k < idxs.length) {
						const yi = Array(this._wordsNumber).fill(0)
						yi[idxs[i + k]] = 1
						x.push(xi)
						y.push(yi)
					}
				}
			}
		}
		this._model.fit(x, y, iteration, rate, batch)
		this._epoch += iteration
	}

	predict(x) {
		const tx = []
		for (const word of x) {
			const v = Array(this._wordsNumber).fill(0)
			if (this._wordsIdx.hasOwnProperty(word)) {
				v[this._wordsIdx[word]] = 1
			} else {
				v[0] = 1
			}
			tx.push(v)
		}
		const pred = this._model.calc(tx)
		return pred.toArray()
	}

	reduce(x) {
		const tx = []
		for (const word of x) {
			const v = Array(this._wordsNumber).fill(0)
			if (this._wordsIdx.hasOwnProperty(word)) {
				v[this._wordsIdx[word]] = 1
			} else {
				v[0] = 1
			}
			tx.push(v)
		}
		const red = this._model.calc(tx, null, ['reduce'])
		return red.reduce.toArray()
	}
}