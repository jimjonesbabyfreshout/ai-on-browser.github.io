import Matrix from '../../../lib/util/matrix.js'
import S3VM from '../../../lib/model/s3vm.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test.each(['gaussian', 'linear'])('semi-classifier %s', kernel => {
	const model = new S3VM(kernel)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	const t_org = []
	for (let i = 0; i < x.length; i++) {
		t_org[i] = t[i] = Math.floor(i / 50) * 2 - 1
		if (Math.random() < 0.5) {
			t[i] = null
		}
	}
	model.init(x, t)
	for (let i = 0; i < 1000; i++) {
		model.fit()
	}
	const y = model.predict(x)
	const acc = accuracy(y.map(Math.sign), t_org.map(Math.sign))
	expect(acc).toBeGreaterThan(0.95)
})
