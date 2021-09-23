const movingMedian = (data, n) => {
	const p = []
	const d = data[0].length
	for (let i = 0; i < data.length; i++) {
		const m = Math.max(0, i - n + 1)
		const pi = []
		for (let j = 0; j < d; j++) {
			const v = []
			for (let k = m; k <= i; k++) {
				v.push(data[k][j])
			}
			v.sort((a, b) => a - b)
			if (v.length % 2 === 1) {
				pi[j] = v[(v.length - 1) / 2]
			} else {
				pi[j] = (v[v.length / 2] + v[v.length / 2 - 1]) / 2
			}
		}
		p.push(pi)
	}
	return p
}

export default movingMedian