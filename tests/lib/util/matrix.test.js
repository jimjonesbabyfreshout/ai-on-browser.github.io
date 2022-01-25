import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'

describe('Matrix', () => {
	describe('constructor', () => {
		test('default', () => {
			const mat = new Matrix(2, 3)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(0)
				}
			}
		})

		test('scalar', () => {
			const mat = new Matrix(2, 3, 2)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(2)
				}
			}
		})

		test('array', () => {
			const mat = new Matrix(2, 3, [0, 1, 2, 3, 4, 5])
			for (let i = 0, p = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(mat.at(i, j)).toBe(p)
				}
			}
		})

		test('multi array', () => {
			const mat = new Matrix(2, 3, [
				[0, 1, 2],
				[3, 4, 5],
			])
			for (let i = 0, p = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(mat.at(i, j)).toBe(p)
				}
			}
		})
	})

	test('zeros', () => {
		const mat = Matrix.zeros(2, 3)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(i, j)).toBe(0)
			}
		}
	})

	test('ones', () => {
		const mat = Matrix.ones(2, 3)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(i, j)).toBe(1)
			}
		}
	})

	describe('eye', () => {
		test('default', () => {
			const mat = Matrix.eye(100, 10)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBe(i === j ? 1 : 0)
				}
			}
		})

		test('scaler', () => {
			const mat = Matrix.eye(100, 10, 3)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBe(i === j ? 3 : 0)
				}
			}
		})
	})

	describe('random', () => {
		test('default', () => {
			const mat = Matrix.random(100, 10)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(0)
					expect(mat.at(i, j)).toBeLessThan(1)
				}
			}
		})

		test('min max', () => {
			const mat = Matrix.random(100, 10, -1, 2)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(-1)
					expect(mat.at(i, j)).toBeLessThan(2)
				}
			}
		})
	})

	describe('randn', () => {
		const calcMV = mat => {
			const [n, m] = mat.sizes
			const sum = Array(m).fill(0)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < m; j++) {
					sum[j] += mat.at(i, j)
				}
			}
			const mean = sum.map(v => v / n)
			const diff = []
			for (let j = 0; j < m; j++) {
				diff[j] = Array(m).fill(0)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < m; j++) {
					for (let k = 0; k < m; k++) {
						diff[j][k] += (mat.at(i, j) - mean[j]) * (mat.at(i, k) - mean[k])
					}
				}
			}
			const vari = diff.map(r => r.map(v => v / n))
			return [mean, vari]
		}

		test.each([10, 9])('default', n => {
			const mat = Matrix.randn(10001, n)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < n; j++) {
				expect(mean[j]).toBeCloseTo(0, 1)
				for (let k = 0; k < n; k++) {
					if (j === k) {
						expect(vari[j][k]).toBeCloseTo(1, 0.9)
					} else {
						expect(vari[j][k]).toBeCloseTo(0, 1)
					}
				}
			}
		})

		test('scaler', () => {
			const mat = Matrix.randn(100000, 10, -10, 0.1)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 10; j++) {
				expect(mean[j]).toBeCloseTo(-10, 2)
				for (let k = 0; k < 10; k++) {
					expect(vari[j][k]).toBeCloseTo(j === k ? 0.1 : 0, 2)
				}
			}
		})

		test('array mean', () => {
			const mat = Matrix.randn(100001, 3, [3, 6, 9], 2)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 3; j++) {
				expect(mean[j]).toBeCloseTo(j * 3 + 3, 1)
				for (let k = 0; k < 3; k++) {
					expect(vari[j][k]).toBeCloseTo(j === k ? 2 : 0, 1)
				}
			}
		})

		test('matrix mean', () => {
			const mat = Matrix.randn(100000, 2, Matrix.fromArray([3, 5]), 1.5)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 2; j++) {
				expect(mean[j]).toBeCloseTo(j * 2 + 3, 1)
				for (let k = 0; k < 2; k++) {
					expect(vari[j][k]).toBeCloseTo(j === k ? 1.5 : 0, 1)
				}
			}
		})

		test('array vari', () => {
			const cov = [
				[0.3, 0.1],
				[0.1, 0.5],
			]
			const mat = Matrix.randn(100000, 2, 5, cov)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 2; j++) {
				expect(mean[j]).toBeCloseTo(5, 1)
				for (let k = 0; k < 2; k++) {
					expect(vari[j][k]).toBeCloseTo(cov[j][k], 1)
				}
			}
		})

		test('matrix vari', () => {
			const cov = Matrix.fromArray([
				[0.3, 0.1],
				[0.1, 0.5],
			])
			const mat = Matrix.randn(100000, 2, 5, cov)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 2; j++) {
				expect(mean[j]).toBeCloseTo(5, 1)
				for (let k = 0; k < 2; k++) {
					expect(vari[j][k]).toBeCloseTo(cov.at(j, k), 1)
				}
			}
		})

		test.each([[3, 5, 7], Matrix.randn(2, 2)])('fail invalid mean %p', m => {
			expect(() => Matrix.randn(100000, 2, m, 1)).toThrowError(
				"'myu' cols must be same as 'cols' and rows must be 1."
			)
		})

		test.each([
			[
				[1, 2],
				[3, 4],
				[5, 6],
			],
			Matrix.randn(2, 3),
		])('fail invalid mean %p', s => {
			expect(() => Matrix.randn(100000, 2, 0, s)).toThrowError("'sigma' cols and rows must be same as 'cols'.")
		})
	})

	describe('diag', () => {
		test('scalar', () => {
			const mat = Matrix.diag([1, 2, 3, 4])
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					expect(mat.at(i, j)).toBe(i === j ? i + 1 : 0)
				}
			}
		})

		test('matrix', () => {
			const d = Matrix.randn(2, 3)
			const mat = Matrix.diag([1, d, 3, 4])
			expect(mat.sizes).toEqual([5, 6])
			expect(mat.at(0, 0)).toEqual(1)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i + 1, j + 1)).toBe(d.at(i, j))
				}
			}
			expect(mat.at(3, 4)).toEqual(3)
			expect(mat.at(4, 5)).toEqual(4)
		})
	})

	describe('fromArray', () => {
		test('matrix', () => {
			const org = Matrix.randn(10, 5)
			const mat = Matrix.fromArray(org)
			expect(mat).toBe(org)
		})

		test('scaler', () => {
			const mat = Matrix.fromArray(7)
			expect(mat.sizes).toEqual([1, 1])
			expect(mat.at(0, 0)).toBe(7)
		})

		test('empty', () => {
			const mat = Matrix.fromArray([])
			expect(mat.sizes).toEqual([0, 0])
		})

		test('array', () => {
			const mat = Matrix.fromArray([1, 2, 3])
			expect(mat.sizes).toEqual([3, 1])
			for (let i = 0; i < 3; i++) {
				expect(mat.at(i, 0)).toBe(i + 1)
			}
		})

		test('multi array', () => {
			const mat = Matrix.fromArray([
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
			])
			expect(mat.sizes).toEqual([3, 3])
			for (let i = 0, p = 1; i < 3; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(mat.at(i, j)).toBe(p)
				}
			}
		})
	})

	test('dimension', () => {
		const mat = new Matrix(2, 3)
		expect(mat.dimension).toBe(2)
	})

	test.each([
		[2, 3],
		[0, 1],
	])('sizes[%i, %i]', (n, m) => {
		const mat = new Matrix(n, m)
		expect(mat.sizes).toHaveLength(2)
		expect(mat.sizes).toEqual([n, m])
	})

	test.each([
		[2, 3],
		[0, 1],
	])('length[%i, %i]', (n, m) => {
		const mat = new Matrix(n, m)
		expect(mat).toHaveLength(n * m)
	})

	test.each([
		[2, 3],
		[0, 1],
	])('rows[%i, %i]', (n, m) => {
		const mat = new Matrix(n, m)
		expect(mat.rows).toBe(n)
	})

	test.each([
		[2, 3],
		[0, 1],
	])('cols[%i, %i]', (n, m) => {
		const mat = new Matrix(n, m)
		expect(mat.cols).toBe(m)
	})

	test('value', () => {
		const mat = new Matrix(2, 3)
		expect(mat.value).toBeInstanceOf(Array)
		expect(mat.value).toHaveLength(6)
	})

	test('t', () => {
		const org = Matrix.randn(2, 3)
		const mat = org.t
		expect(mat.sizes).toEqual([3, 2])
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(j, i)).toBe(org.at(i, j))
			}
		}
	})

	test('iterate', () => {
		const mat = Matrix.randn(10, 3)
		let i = 0
		for (const v of mat) {
			expect(v).toBe(mat.value[i++])
		}
	})

	test('toArray', () => {
		const mat = Matrix.randn(2, 3)
		const array = mat.toArray()
		expect(array).toBeInstanceOf(Array)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(array[i][j]).toBe(mat.at(i, j))
			}
		}
	})

	describe('toScaler', () => {
		test('success', () => {
			const mat = Matrix.randn(1, 1)
			const value = mat.toScaler()
			expect(value).toBe(mat.at(0, 0))
		})

		test.each([
			[1, 2],
			[2, 1],
			[0, 1],
			[1, 0],
			[2, 2],
		])('fail[%i, %i]', (r, c) => {
			const mat = new Matrix(r, c)
			expect(() => mat.toScaler()).toThrowError('The matrix cannot convert to scaler.')
		})
	})

	test('toString', () => {
		const mat = new Matrix(2, 3, [
			[1, 2, 3],
			[4, 5, 6],
		])
		const str = mat.toString()
		expect(str).toEqual('[[1, 2, 3],\n [4, 5, 6]]')
	})

	describe('copy', () => {
		test('default', () => {
			const org = Matrix.randn(2, 3)
			const mat = org.copy()
			expect(mat._value).not.toBe(org._value)
			expect(mat._value).toEqual(org._value)
		})

		test('copy self dst', () => {
			const org = Matrix.randn(2, 3)
			const mat = org.copy(org)
			expect(mat).toBe(org)
		})

		test('dst', () => {
			const org = Matrix.randn(2, 3)
			const cp = new Matrix(0, 0)
			const mat = org.copy(cp)
			expect(mat).toBe(cp)
			expect(mat._value).not.toBe(org._value)
			expect(mat._value).toEqual(org._value)
		})
	})

	describe('equals', () => {
		test('same', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const mat1 = new Matrix(2, 3, data)
			const mat2 = new Matrix(2, 3, data)
			expect(mat1.equals(mat2)).toBeTruthy()
		})

		test('not same size', () => {
			const mat1 = Matrix.randn(2, 3)
			const mat2 = Matrix.randn(3, 2)
			expect(mat1.equals(mat2)).toBeFalsy()
		})

		test('not same value', () => {
			const mat1 = Matrix.randn(2, 3)
			const mat2 = Matrix.randn(2, 3)
			expect(mat1.equals(mat2)).toBeFalsy()
		})

		test('not matrix', () => {
			const mat = Matrix.randn(2, 3)
			expect(mat.equals(1)).toBeFalsy()
		})

		test.todo('tol')
	})

	describe('at', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const mat = new Matrix(2, 3, data)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(data[i][j])
					expect(mat.at([i, j])).toBe(data[i][j])
				}
			}
		})

		test.each([
			[-1, 0],
			[2, 0],
			[0, -1],
			[0, 3],
		])('fail[%i, %i]', (i, j) => {
			const mat = new Matrix(2, 3)
			expect(() => mat.at(i, j)).toThrowError('Index out of bounds.')
			expect(() => mat.at([i, j])).toThrowError('Index out of bounds.')
		})
	})

	describe('set', () => {
		test('scaler', () => {
			const mat = new Matrix(2, 3)
			mat.set(1, 2, 1.5)
			expect(mat.at(1, 2)).toBe(1.5)
		})

		test('scaler array', () => {
			const mat = new Matrix(2, 3)
			mat.set([1, 2], 1.5)
			expect(mat.at(1, 2)).toBe(1.5)
		})

		test.each([
			[-1, 0],
			[2, 0],
			[0, -1],
			[0, 3],
		])('fail scaler[%i, %i]', (i, j) => {
			const mat = new Matrix(2, 3)
			expect(() => mat.set(i, j, 0)).toThrowError('Index out of bounds.')
			expect(() => mat.set([i, j], 0)).toThrowError('Index out of bounds.')
		})

		test('matrix', () => {
			const mat = new Matrix(3, 4)
			const data = [
				[1, 2],
				[3, 4],
			]
			const smat = new Matrix(2, 2, data)
			mat.set(1, 2, smat)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(mat.at(i + 1, j + 2)).toBe(data[i][j])
				}
			}
		})

		test('matrix array', () => {
			const mat = new Matrix(3, 4)
			const data = [
				[1, 2],
				[3, 4],
			]
			const smat = new Matrix(2, 2, data)
			mat.set([1, 2], smat)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(mat.at(i + 1, j + 2)).toBe(data[i][j])
				}
			}
		})

		test.each([
			[-1, 0],
			[3, 0],
			[0, -1],
			[0, 4],
			[2, 0],
			[0, 3],
		])('fail matrix[%i, %i]', (i, j) => {
			const mat = new Matrix(3, 4)
			const smat = new Matrix(2, 2)
			expect(() => mat.set(i, j, smat)).toThrowError('Index out of bounds.')
			expect(() => mat.set([i, j], smat)).toThrowError('Index out of bounds.')
		})
	})

	describe('row', () => {
		test.each([0, 1])('scaler[%i]', r => {
			const org = Matrix.randn(2, 3)
			const mat = org.row(r)
			expect(mat.sizes).toEqual([1, 3])
			for (let j = 0; j < 3; j++) {
				expect(mat.at(0, j)).toBe(org.at(r, j))
			}
		})

		test.each([-1, 2])('fail scaler[%i]', i => {
			const mat = new Matrix(2, 3)
			expect(() => mat.row(i)).toThrowError('Index out of bounds.')
		})

		test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array %p', r => {
			const org = Matrix.randn(3, 5)
			const mat = org.row(r)
			expect(mat.sizes).toEqual([2, 5])
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 5; j++) {
					expect(mat.at(i, j)).toBe(org.at(r[i], j))
				}
			}
		})

		test.each([[[-1, 0]], [[0, 3]]])('fail array %p', r => {
			const mat = Matrix.randn(3, 5)
			expect(() => mat.row(r)).toThrowError('Index out of bounds.')
		})

		test.each([[[false, true, false]], [[true, false, true]]])('boolean %p', r => {
			const org = Matrix.randn(3, 5)
			const mat = org.row(r)
			let p = 0
			for (let i = 0; i < 3; i++) {
				if (!r[i]) {
					continue
				}
				for (let j = 0; j < 5; j++) {
					expect(mat.at(p, j)).toBe(org.at(i, j))
				}
				p++
			}
			expect(mat.sizes).toEqual([p, 5])
		})

		test.each([[[false]], [[true, false]]])('fail boolean %p', r => {
			const mat = Matrix.randn(3, 5)
			expect(() => mat.row(r)).toThrowError('Length is invalid.')
		})
	})

	describe('col', () => {
		test.each([0, 1, 2])('scaler[%i]', c => {
			const org = Matrix.randn(2, 3)
			const mat = org.col(c)
			expect(mat.sizes).toEqual([2, 1])
			for (let i = 0; i < 2; i++) {
				expect(mat.at(i, 0)).toBe(org.at(i, c))
			}
		})

		test.each([-1, 3])('fail scaler[%i]', i => {
			const mat = new Matrix(2, 3)
			expect(() => mat.col(i)).toThrowError('Index out of bounds.')
		})

		test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array %p', c => {
			const org = Matrix.randn(5, 3)
			const mat = org.col(c)
			expect(mat.sizes).toEqual([5, 2])
			for (let i = 0; i < 5; i++) {
				for (let j = 0; j < 2; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, c[j]))
				}
			}
		})

		test.each([[[-1, 0]], [[0, 3]]])('fail array %p', c => {
			const mat = Matrix.randn(5, 3)
			expect(() => mat.col(c)).toThrowError('Index out of bounds.')
		})

		test.each([[[false, true, false]], [[true, false, true]]])('boolean %p', c => {
			const org = Matrix.randn(5, 3)
			const mat = org.col(c)
			let p = 0
			for (let j = 0; j < 3; j++) {
				if (!c[j]) {
					continue
				}
				for (let i = 0; i < 5; i++) {
					expect(mat.at(i, p)).toBe(org.at(i, j))
				}
				p++
			}
			expect(mat.sizes).toEqual([5, p])
		})

		test.each([[[false]], [[true, false]]])('fail boolean %p', c => {
			const mat = Matrix.randn(5, 3)
			expect(() => mat.col(c)).toThrowError('Length is invalid.')
		})
	})

	describe('slice', () => {
		test.each([
			[1, 3],
			[0, 5],
			[8, 10],
		])('row %p', (f, t) => {
			const mat = Matrix.randn(10, 3)
			const slice = mat.slice(f, t, 0)
			expect(slice.sizes).toEqual([t - f, 3])
			for (let i = 0; i < t - f; i++) {
				for (let j = 0; j < 3; j++) {
					expect(slice.at(i, j)).toBe(mat.at(i + f, j))
				}
			}
		})

		test.each([
			[null, null],
			[3, null],
			[null, 5],
		])('row with null %p', (f, t) => {
			const mat = Matrix.randn(10, 3)
			const slice = mat.slice(f, t, 0)

			if (typeof f !== 'number') f = 0
			if (typeof t !== 'number') t = mat.rows

			expect(slice.sizes).toEqual([t - f, 3])
			for (let i = 0; i < t - f; i++) {
				for (let j = 0; j < 3; j++) {
					expect(slice.at(i, j)).toBe(mat.at(i + f, j))
				}
			}
		})

		test.each([
			[1, 3],
			[0, 5],
			[8, 10],
		])('col %p', (f, t) => {
			const mat = Matrix.randn(3, 10)
			const slice = mat.slice(f, t, 1)
			expect(slice.sizes).toEqual([3, t - f])
			for (let j = 0; j < t - f; j++) {
				for (let i = 0; i < 3; i++) {
					expect(slice.at(i, j)).toBe(mat.at(i, j + f))
				}
			}
		})

		test.each([
			[null, null],
			[3, null],
			[null, 5],
		])('col with null %p', (f, t) => {
			const mat = Matrix.randn(3, 10)
			const slice = mat.slice(f, t, 1)

			if (typeof f !== 'number') f = 0
			if (typeof t !== 'number') t = mat.cols

			expect(slice.sizes).toEqual([3, t - f])
			for (let j = 0; j < t - f; j++) {
				for (let i = 0; i < 3; i++) {
					expect(slice.at(i, j)).toBe(mat.at(i, j + f))
				}
			}
		})

		test('fail invalid axis', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.slice(0, 3, 2)).toThrowError('Invalid axis.')
		})
	})

	describe('block', () => {
		test.each([
			[0, 0, 2, 2],
			[0, 1, 2, 3],
			[4, 5, 7, 9],
		])('%p', (rf, cf, rt, ct) => {
			const mat = Matrix.randn(8, 10)
			const block = mat.block(rf, cf, rt, ct)

			expect(block.sizes).toEqual([rt - rf, ct - cf])
			for (let i = 0; i < rt - rf; i++) {
				for (let j = 0; j < ct - cf; j++) {
					expect(block.at(i, j)).toBe(mat.at(i + rf, j + cf))
				}
			}
		})

		test.each([
			[null, null, null, null],
			[null, null, 4, 5],
			[3, 2, null, null],
		])('with null %p', (rf, cf, rt, ct) => {
			const mat = Matrix.randn(8, 10)
			const block = mat.block(rf, cf, rt, ct)

			if (typeof rf !== 'number') rf = 0
			if (typeof cf !== 'number') cf = 0
			if (typeof rt !== 'number') rt = mat.rows
			if (typeof ct !== 'number') ct = mat.cols

			expect(block.sizes).toEqual([rt - rf, ct - cf])
			for (let i = 0; i < rt - rf; i++) {
				for (let j = 0; j < ct - cf; j++) {
					expect(block.at(i, j)).toBe(mat.at(i + rf, j + cf))
				}
			}
		})
	})

	describe('remove', () => {
		describe('row', () => {
			test.each([0, 1, 2])('scaler[%i]', r => {
				const data = [
					[1, 2, 3],
					[4, 5, 6],
					[7, 8, 9],
				]
				const mat = new Matrix(3, 3, data)
				mat.remove(r)
				expect(mat.sizes).toEqual([2, 3])
				for (let k = 0, i = 0; k < 3; k++) {
					if (k === r) {
						continue
					}
					for (let j = 0; j < 3; j++) {
						expect(mat.at(i, j)).toBe(data[k][j])
					}
					i++
				}
			})

			test.each([-1, 2])('fail scaler[%i]', i => {
				const mat = new Matrix(2, 3)
				expect(() => mat.remove(i)).toThrowError('Index out of bounds.')
			})

			test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array[%p]', r => {
				const mat = Matrix.randn(4, 5)
				const data = mat.toArray()
				mat.remove(r)
				expect(mat.sizes).toEqual([2, 5])
				for (let k = 0, i = 0; k < 4; k++) {
					if (r.indexOf(k) >= 0) {
						continue
					}
					for (let j = 0; j < 5; j++) {
						expect(mat.at(i, j)).toBe(data[k][j])
					}
					i++
				}
			})

			test.each([[[-1, 0]], [[0, 3]]])('fail array[%p]', r => {
				const mat = Matrix.randn(3, 5)
				expect(() => mat.remove(r)).toThrowError('Index out of bounds.')
			})
		})

		describe('col', () => {
			test.each([0, 1, 2])('scaler[%i]', c => {
				const data = [
					[1, 2, 3],
					[4, 5, 6],
					[7, 8, 9],
				]
				const mat = new Matrix(3, 3, data)
				mat.remove(c, 1)
				expect(mat.sizes).toEqual([3, 2])
				for (let i = 0; i < 3; i++) {
					for (let k = 0, j = 0; k < 3; k++) {
						if (k === c) {
							continue
						}
						expect(mat.at(i, j)).toBe(data[i][k])
						j++
					}
				}
			})

			test.each([-1, 3])('fail scaler[%i]', i => {
				const mat = new Matrix(2, 3)
				expect(() => mat.remove(i, 1)).toThrowError('Index out of bounds.')
			})

			test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array[%p]', c => {
				const mat = Matrix.randn(4, 5)
				const data = mat.toArray()
				mat.remove(c, 1)
				expect(mat.sizes).toEqual([4, 3])
				for (let i = 0; i < 4; i++) {
					for (let k = 0, j = 0; k < 5; k++) {
						if (c.indexOf(k) >= 0) {
							continue
						}
						expect(mat.at(i, j)).toBe(data[i][k])
						j++
					}
				}
			})

			test.each([[[-1, 0]], [[0, 3]]])('fail array[%p]', r => {
				const mat = Matrix.randn(5, 3)
				expect(() => mat.remove(r, 1)).toThrowError('Index out of bounds.')
			})
		})

		test('fail invalid axis', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.remove(0, 2)).toThrowError('Invalid axis.')
		})
	})

	describe('removeIf', () => {
		test('row', () => {
			const org = Matrix.randn(100, 3)
			const mat = org.copy()
			mat.removeIf(r => r.some(v => v < 0), 0)

			for (let i = 0, r = 0; i < org.rows; i++) {
				if (org.row(i).some(v => v < 0)) {
					continue
				}
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(r, j)).toBe(org.at(i, j))
				}
				r++
			}
		})

		test('col', () => {
			const org = Matrix.randn(3, 100)
			const mat = org.copy()
			mat.removeIf(r => r.some(v => v < 0), 1)

			for (let j = 0, c = 0; j < org.cols; j++) {
				if (org.col(j).some(v => v < 0)) {
					continue
				}
				for (let i = 0; i < org.rows; i++) {
					expect(mat.at(i, c)).toBe(org.at(i, j))
				}
				c++
			}
		})

		test('fail invalid axis', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.removeIf(() => false, 2)).toThrowError('Invalid axis.')
		})
	})

	describe('sample', () => {
		test('row', () => {
			const n = 3
			const org = Matrix.randn(10, 5)
			const mat = org.sample(n)

			const expidx = []
			for (let k = 0; k < n; k++) {
				for (let i = 0; i < org.rows; i++) {
					let flg = true
					for (let j = 0; j < org.cols; j++) {
						flg &= mat.at(k, j) === org.at(i, j)
					}
					if (flg) {
						expidx.push(i)
						break
					}
				}
			}
			expect(expidx).toHaveLength(n)
			for (let k = 0; k < n; k++) {
				for (let i = k + 1; i < n; i++) {
					expect(expidx[k]).not.toBe(expidx[i])
				}
			}
		})

		test('row index', () => {
			const n = 3
			const org = Matrix.randn(10, 5)
			const [mat, idx] = org.sample(n, 0, true)
			expect(idx).toHaveLength(n)

			const expidx = []
			for (let k = 0; k < n; k++) {
				for (let i = 0; i < org.rows; i++) {
					let flg = true
					for (let j = 0; j < org.cols; j++) {
						flg &= mat.at(k, j) === org.at(i, j)
					}
					if (flg) {
						expidx.push(i)
						break
					}
				}
			}
			expect(expidx).toHaveLength(n)
			expect(expidx).toEqual(idx)
		})

		test('col', () => {
			const n = 3
			const org = Matrix.randn(10, 5)
			const mat = org.sample(n, 1)

			const expidx = []
			for (let k = 0; k < n; k++) {
				for (let j = 0; j < org.cols; j++) {
					let flg = true
					for (let i = 0; i < org.rows; i++) {
						flg &= mat.at(i, k) === org.at(i, j)
					}
					if (flg) {
						expidx.push(j)
						break
					}
				}
			}
			expect(expidx).toHaveLength(n)
			for (let k = 0; k < n; k++) {
				for (let i = k + 1; i < n; i++) {
					expect(expidx[k]).not.toBe(expidx[i])
				}
			}
		})

		test('col index', () => {
			const n = 3
			const org = Matrix.randn(10, 5)
			const [mat, idx] = org.sample(n, 1, true)
			expect(idx).toHaveLength(n)

			const expidx = []
			for (let k = 0; k < n; k++) {
				for (let j = 0; j < org.cols; j++) {
					let flg = true
					for (let i = 0; i < org.rows; i++) {
						flg &= mat.at(i, k) === org.at(i, j)
					}
					if (flg) {
						expidx.push(j)
						break
					}
				}
			}
			expect(expidx).toHaveLength(n)
			expect(expidx).toEqual(idx)
		})

		test('fail invalid axis', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.sample(4, 2)).toThrowError('Invalid axis.')
		})
	})

	test('fill', () => {
		const mat = new Matrix(2, 3)
		mat.fill(6)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(i, j)).toBe(6)
			}
		}
	})

	test('map', () => {
		const org = Matrix.randn(2, 3)
		const mat = org.copy()
		mat.map(v => v ** 2)
		for (let i = 0; i < mat.length; i++) {
			expect(mat.value[i]).toBe(org.value[i] ** 2)
		}
	})

	test.todo('copyMap')

	describe('forEach', () => {
		test('values', () => {
			const mat = Matrix.randn(2, 3)
			const value = []
			mat.forEach(v => value.push(v))
			for (let i = 0; i < mat.length; i++) {
				expect(value[i]).toBe(mat.value[i])
			}
		})

		test.todo('index')
	})

	describe('transpose', () => {
		test('default', () => {
			const org = new Matrix(2, 3, [
				[1, 2, 3],
				[4, 5, 6],
			])
			const mat = org.transpose()
			expect(mat.sizes).toEqual([3, 2])
			for (let i = 0, p = 1; i < 2; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(mat.at(j, i)).toBe(p)
				}
			}
		})
	})

	test.todo('adjoint')

	describe('flip', () => {
		test.each([[undefined], [0]])('axis %i', axis => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const mat = new Matrix(2, 3, data)
			mat.flip(axis)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(1 - i, j)).toBe(data[i][j])
				}
			}
		})

		test('axis 1', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const mat = new Matrix(2, 3, data)
			mat.flip(1)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, 2 - j)).toBe(data[i][j])
				}
			}
		})

		test('fail invalid axis', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.flip(2)).toThrowError('Invalid axis.')
		})
	})

	describe('swap', () => {
		test.each([
			[0, 1],
			[0, 2],
			[1, 2],
		])('swap %i and %i (axis=0)', (a, b) => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
			]
			const mat = new Matrix(3, 3, data)
			mat.swap(a, b, 0)
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(data[i === a ? b : i === b ? a : i][j])
				}
			}
		})

		test.each([
			[-1, 0],
			[1, 2],
			[-1, 2],
		])('fail swap %i and %i (axis=0)', (a, b) => {
			const mat = Matrix.random(2, 3)
			expect(() => mat.swap(a, b, 0)).toThrowError('Index out of bounds.')
		})

		test.each([
			[0, 1],
			[0, 2],
			[1, 2],
		])('swap %i and %i (axis=1)', (a, b) => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
			]
			const mat = new Matrix(3, 3, data)
			mat.swap(a, b, 1)
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(data[i][j === a ? b : j === b ? a : j])
				}
			}
		})

		test.each([
			[-1, 0],
			[2, 3],
			[-1, 3],
		])('fail swap %i and %i (axis=1)', (a, b) => {
			const mat = Matrix.random(2, 3)
			expect(() => mat.swap(a, b, 1)).toThrowError('Index out of bounds.')
		})

		test('fail invalid axis', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.swap(0, 1, 2)).toThrowError('Invalid axis.')
		})
	})

	describe('sort', () => {
		test('axis 0', () => {
			const org = Matrix.randn(10, 5)
			const mat = org.copy()
			const p = mat.sort(0)
			for (let i = 0; i < org.rows; i++) {
				let comp = true
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(p[i], j))
					if (i > 0 && comp) {
						expect(mat.at(i, j)).toBeGreaterThanOrEqual(mat.at(i - 1, j))
						comp &= mat.at(i, j) === mat.at(i - 1, j)
					}
				}
			}
		})

		test('axis 0 has same row', () => {
			const org = Matrix.randn(10, 5)
			for (let j = 0; j < org.cols; j++) {
				org.set(2, j, org.at(4, j))
			}
			const mat = org.copy()
			const p = mat.sort(0)
			for (let i = 0; i < org.rows; i++) {
				let comp = true
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(p[i], j))
					if (i > 0 && comp) {
						expect(mat.at(i, j)).toBeGreaterThanOrEqual(mat.at(i - 1, j))
						comp &= mat.at(i, j) === mat.at(i - 1, j)
					}
				}
			}
		})

		test('axis 1', () => {
			const org = Matrix.randn(5, 10)
			const mat = org.copy()
			const p = mat.sort(1)
			for (let j = 0; j < org.cols; j++) {
				let comp = true
				for (let i = 0; i < org.rows; i++) {
					expect(mat.at(i, j)).toBe(org.at(i, p[j]))
					if (j > 0 && comp) {
						expect(mat.at(i, j)).toBeGreaterThanOrEqual(mat.at(i, j - 1))
						comp &= mat.at(i, j) === mat.at(i, j - 1)
					}
				}
			}
		})

		test('axis 1 has same col', () => {
			const org = Matrix.randn(5, 10)
			for (let i = 0; i < org.rows; i++) {
				org.set(i, 2, org.at(i, 4))
			}
			const mat = org.copy()
			const p = mat.sort(1)
			for (let j = 0; j < org.cols; j++) {
				let comp = true
				for (let i = 0; i < org.rows; i++) {
					expect(mat.at(i, j)).toBe(org.at(i, p[j]))
					if (j > 0 && comp) {
						expect(mat.at(i, j)).toBeGreaterThanOrEqual(mat.at(i, j - 1))
						comp &= mat.at(i, j) === mat.at(i, j - 1)
					}
				}
			}
		})

		test('fail invalid axis', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.sort(2)).toThrowError('Invalid axis.')
		})
	})

	describe('shuffle', () => {
		test('axis 0', () => {
			const org = Matrix.randn(10, 5)
			const mat = org.copy()
			mat.shuffle(0)

			const expidx = []
			for (let k = 0; k < org.rows; k++) {
				for (let i = 0; i < org.rows; i++) {
					let flg = true
					for (let j = 0; j < org.cols; j++) {
						flg &= mat.at(k, j) === org.at(i, j)
					}
					if (flg) {
						expidx.push(i)
						break
					}
				}
			}
			expidx.sort((a, b) => a - b)
			expect(expidx).toHaveLength(org.rows)
			for (let i = 0; i < org.rows; i++) {
				expect(expidx[i]).toBe(i)
			}
		})

		test('axis 1', () => {
			const org = Matrix.randn(5, 10)
			const mat = org.copy()
			mat.shuffle(1)

			const expidx = []
			for (let k = 0; k < org.cols; k++) {
				for (let j = 0; j < org.cols; j++) {
					let flg = true
					for (let i = 0; i < org.rows; i++) {
						flg &= mat.at(i, k) === org.at(i, j)
					}
					if (flg) {
						expidx.push(j)
						break
					}
				}
			}
			expidx.sort((a, b) => a - b)
			expect(expidx).toHaveLength(org.cols)
			for (let i = 0; i < org.cols; i++) {
				expect(expidx[i]).toBe(i)
			}
		})

		test('fail invalid axis', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.shuffle(2)).toThrowError('Invalid axis.')
		})
	})

	describe('resize', () => {
		test.each([
			[5, 6],
			[3, 6],
			[6, 4],
			[3, 4],
			[2, 4],
			[3, 2],
			[2, 3],
			[2, 7],
			[5, 2],
		])('default [%i, %i]', (r, c) => {
			const mat = Matrix.randn(3, 4)
			const resize = mat.resize(r, c)
			expect(resize.sizes).toEqual([r, c])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					if (i >= Math.min(mat.rows, r) || j >= Math.min(mat.cols, c)) {
						expect(resize.at(i, j)).toBe(0)
					} else {
						expect(resize.at(i, j)).toBe(mat.at(i, j))
					}
				}
			}
		})

		test.each([
			[5, 6],
			[3, 6],
			[6, 4],
			[3, 4],
			[2, 4],
			[3, 2],
			[2, 3],
			[2, 7],
			[5, 2],
		])('init [%i, %i]', (r, c) => {
			const mat = Matrix.randn(3, 4)
			const resize = mat.resize(r, c, 3)
			expect(resize.sizes).toEqual([r, c])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					if (i >= Math.min(mat.rows, r) || j >= Math.min(mat.cols, c)) {
						expect(resize.at(i, j)).toBe(3)
					} else {
						expect(resize.at(i, j)).toBe(mat.at(i, j))
					}
				}
			}
		})
	})

	describe('reshape', () => {
		test('success', () => {
			const org = Matrix.randn(3, 8)
			const mat = org.copy()
			mat.reshape(4, 6)
			expect(mat.sizes).toEqual([4, 6])
			expect(mat.length).toBe(org.length)
			expect(mat.value).toEqual(org.value)
		})

		test.each([
			[-1, 6],
			[3, 4],
			[6, 0],
		])('fail [%i, %i]', (r, c) => {
			const mat = Matrix.random(2, 3)
			expect(() => mat.reshape(r, c)).toThrowError('Length is different.')
		})
	})

	describe('repeat', () => {
		test.each([
			[1, 0],
			[[1], 0],
			[1, 1],
			[[1], 1],
			[[1, 1], null],
		])('no repeat %p', (n, axis) => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat(n, axis)
			expect(mat.sizes).toEqual([org.rows, org.cols])
			for (let i = 0; i < org.rows; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j))
				}
			}
		})

		test('axis 0', () => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat(3, 0)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j))
				}
			}
		})

		test('axis 1', () => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat(3, 1)
			expect(mat.sizes).toEqual([org.rows, org.cols * 3])
			for (let i = 0; i < org.rows; i++) {
				for (let j = 0; j < org.cols * 3; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j % org.cols))
				}
			}
		})

		test('array 1', () => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat([3], 0)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j))
				}
			}
		})

		test('array 2', () => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat([3, 4], 0)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols * 4])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols * 4; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j % org.cols))
				}
			}
		})
	})

	test.todo('copyRepeat')

	describe('concat', () => {
		test('axis 0', () => {
			const a = Matrix.randn(3, 10)
			const b = Matrix.randn(5, 10)
			const concat = a.concat(b, 0)
			expect(concat.sizes).toEqual([8, 10])
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 10; j++) {
					expect(concat.at(i, j)).toBe(i < 3 ? a.at(i, j) : b.at(i - 3, j))
				}
			}
		})

		test('fail axis 0', () => {
			const a = Matrix.randn(3, 10)
			const b = Matrix.randn(3, 9)
			expect(() => a.concat(b)).toThrowError('Size is different.')
		})

		test('axis 1', () => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(10, 5)
			const concat = a.concat(b, 1)
			expect(concat.sizes).toEqual([10, 8])
			for (let i = 0; i < 10; i++) {
				for (let j = 0; j < 8; j++) {
					expect(concat.at(i, j)).toBe(j < 3 ? a.at(i, j) : b.at(i, j - 3))
				}
			}
		})

		test('fail axis 1', () => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(9, 3)
			expect(() => a.concat(b, 1)).toThrowError('Size is different.')
		})

		test('fail invalid axis', () => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(9, 3)
			expect(() => a.concat(b, 2)).toThrowError('Invalid axis.')
		})
	})

	describe('reduce', () => {
		describe('axis -1', () => {
			test('no init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, null)
				expect(reduce).toBeCloseTo(mat.sum())
			})

			test('with init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, 1)
				expect(reduce).toBeCloseTo(mat.sum() + 1)
			})
		})

		describe('axis 0', () => {
			test('no init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, undefined, 0)
				expect(reduce.sizes).toEqual([1, 7])

				const sum = mat.sum(0)
				for (let i = 0; i < mat.cols; i++) {
					expect(reduce.at(0, i)).toBeCloseTo(sum.at(0, i))
				}
			})

			test('with init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, 1, 0)
				expect(reduce.sizes).toEqual([1, 7])

				const sum = mat.sum(0)
				for (let i = 0; i < mat.cols; i++) {
					expect(reduce.at(0, i)).toBeCloseTo(sum.at(0, i) + 1)
				}
			})
		})

		describe('axis 1', () => {
			test('no init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, undefined, 1)
				expect(reduce.sizes).toEqual([5, 1])

				const sum = mat.sum(1)
				for (let i = 0; i < mat.rows; i++) {
					expect(reduce.at(i, 0)).toBeCloseTo(sum.at(i, 0))
				}
			})

			test('with init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, 1, 1)
				expect(reduce.sizes).toEqual([5, 1])

				const sum = mat.sum(1)
				for (let i = 0; i < mat.rows; i++) {
					expect(reduce.at(i, 0)).toBeCloseTo(sum.at(i, 0) + 1)
				}
			})
		})
	})

	describe('every', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.every(v => v > 0)).toBe(true)
			expect(org.every(v => v > 1)).toBe(false)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const every = org.every(v => v > 1, 0)
			expect(every.sizes).toEqual([1, 3])
			expect(every.value).toEqual([false, true, true])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const every = org.every(v => v > 1, 1)
			expect(every.sizes).toEqual([2, 1])
			expect(every.value).toEqual([false, true])
		})
	})

	describe('some', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.some(v => v > 4)).toBe(true)
			expect(org.some(v => v > 6)).toBe(false)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const some = org.some(v => v > 4, 0)
			expect(some.sizes).toEqual([1, 3])
			expect(some.value).toEqual([false, true, true])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const some = org.some(v => v > 5, 1)
			expect(some.sizes).toEqual([2, 1])
			expect(some.value).toEqual([false, true])
		})
	})

	describe('max', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.max()).toBe(6)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const max = org.max(0)
			expect(max.sizes).toEqual([1, 3])
			expect(max.value).toEqual([4, 5, 6])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const max = org.max(1)
			expect(max.sizes).toEqual([2, 1])
			expect(max.value).toEqual([5, 6])
		})
	})

	describe('min', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.min()).toBe(1)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const min = org.min(0)
			expect(min.sizes).toEqual([1, 3])
			expect(min.value).toEqual([1, 2, 3])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const min = org.min(1)
			expect(min.sizes).toEqual([2, 1])
			expect(min.value).toEqual([1, 2])
		})
	})

	describe('median', () => {
		test('even', () => {
			const data = [
				[0, 2, 3],
				[4, 5, 7],
			]
			const org = new Matrix(2, 3, data)
			expect(org.median()).toBe(3.5)
		})

		test('odd', () => {
			const data = [
				[0, 2, 3],
				[4, 5, 6],
				[10, 11, 12],
			]
			const org = new Matrix(3, 3, data)
			expect(org.median()).toBe(5)
		})

		test('axis 0', () => {
			const data = [
				[1, 2, 6],
				[4, 5, 9],
				[12, 7, 8],
				[10, 11, 3],
			]
			const org = new Matrix(4, 3, data)
			const median = org.median(0)
			expect(median.sizes).toEqual([1, 3])
			expect(median.value).toEqual([7, 6, 7])
		})

		test('axis 1', () => {
			const data = [
				[1, 2, 6],
				[4, 5, 9],
				[12, 7, 8],
				[10, 11, 3],
			]
			const org = new Matrix(4, 3, data)
			const median = org.median(1)
			expect(median.sizes).toEqual([4, 1])
			expect(median.value).toEqual([2, 5, 8, 10])
		})
	})

	describe('quantile', () => {
		const quantile = (a, q) => {
			a.sort((a, b) => a - b)
			if (q === 0) {
				return a[0]
			} else if (q === 1) {
				return a[a.length - 1]
			}
			const n = (a.length - 1) * q
			const l = Math.floor(n)
			return a[l] + (n - l) * (a[l + 1] - a[l])
		}

		test.each([0, 0.1, 0.5, 0.8, 1])('single q=%f', q => {
			const data = Math.random()
			const org = new Matrix(1, 1, data)
			expect(org.quantile(q)).toBeCloseTo(data)
		})

		test.each([0, 0.1, 0.5, 0.8, 1])('even q=%f', q => {
			const data = [
				[0, 2, 3],
				[4, 5, 7],
			]
			const org = new Matrix(2, 3, data)
			expect(org.quantile(q)).toBeCloseTo(quantile(data.flat(), q))
		})

		test.each([0, 0.1, 0.5, 0.8, 1])('odd q=%f', q => {
			const data = [
				[0, 2, 3],
				[4, 5, 6],
				[10, 11, 12],
			]
			const org = new Matrix(3, 3, data)
			expect(org.quantile(q)).toBeCloseTo(quantile(data.flat(), q))
		})

		test.each([0, 0.1, 0.5, 0.8, 1])('axis 0, q=%f', q => {
			const data = [
				[1, 2, 6],
				[4, 5, 9],
				[12, 7, 8],
				[10, 11, 3],
			]
			const org = new Matrix(4, 3, data)
			const quant = org.quantile(q, 0)
			expect(quant.sizes).toEqual([1, 3])
			for (let i = 0; i < org.cols; i++) {
				expect(quant.at(0, i)).toBeCloseTo(
					quantile(
						data.map(r => r[i]),
						q
					)
				)
			}
		})

		test.each([0, 0.1, 0.5, 0.8, 1])('axis 1, q=%f', q => {
			const data = [
				[1, 2, 6],
				[4, 5, 9],
				[12, 7, 8],
				[10, 11, 3],
			]
			const org = new Matrix(4, 3, data)
			const quant = org.quantile(q, 1)
			expect(quant.sizes).toEqual([4, 1])
			for (let i = 0; i < org.rows; i++) {
				expect(quant.at(i, 0)).toBeCloseTo(quantile(data[i], q))
			}
		})
	})

	describe('argmax', () => {
		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const argmax = org.argmax(0)
			expect(argmax.sizes).toEqual([1, 3])
			expect(argmax.value).toEqual([1, 0, 1])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const argmax = org.argmax(1)
			expect(argmax.sizes).toEqual([2, 1])
			expect(argmax.value).toEqual([1, 2])
		})
	})

	describe('argmin', () => {
		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const argmin = org.argmin(0)
			expect(argmin.sizes).toEqual([1, 3])
			expect(argmin.value).toEqual([0, 1, 0])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const argmin = org.argmin(1)
			expect(argmin.sizes).toEqual([2, 1])
			expect(argmin.value).toEqual([0, 1])
		})
	})

	describe('sum', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.sum()).toBe(21)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const sum = org.sum(0)
			expect(sum.sizes).toEqual([1, 3])
			expect(sum.value).toEqual([5, 7, 9])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const sum = org.sum(1)
			expect(sum.sizes).toEqual([2, 1])
			expect(sum.value).toEqual([9, 12])
		})
	})

	describe('mean', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.mean()).toBe(3.5)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const mean = org.mean(0)
			expect(mean.sizes).toEqual([1, 3])
			expect(mean.value).toEqual([2.5, 3.5, 4.5])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const mean = org.mean(1)
			expect(mean.sizes).toEqual([2, 1])
			expect(mean.value).toEqual([3, 4])
		})
	})

	describe('prod', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.prod()).toBe(720)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.prod(0)
			expect(prod.sizes).toEqual([1, 3])
			expect(prod.value).toEqual([4, 10, 18])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.prod(1)
			expect(prod.sizes).toEqual([2, 1])
			expect(prod.value).toEqual([15, 48])
		})
	})

	describe('variance', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.variance()).toBe(17.5 / 6)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.variance(0)
			expect(prod.sizes).toEqual([1, 3])
			expect(prod.value).toEqual([4.5 / 2, 4.5 / 2, 4.5 / 2])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.variance(1)
			expect(prod.sizes).toEqual([2, 1])
			expect(prod.value).toEqual([8 / 3, 8 / 3])
		})
	})

	describe('std', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.std()).toBe(Math.sqrt(17.5 / 6))
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.std(0)
			expect(prod.sizes).toEqual([1, 3])
			expect(prod.value).toEqual([Math.sqrt(4.5 / 2), Math.sqrt(4.5 / 2), Math.sqrt(4.5 / 2)])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.std(1)
			expect(prod.sizes).toEqual([2, 1])
			expect(prod.value).toEqual([Math.sqrt(8 / 3), Math.sqrt(8 / 3)])
		})
	})

	describe('isSquare', () => {
		test.each([
			[0, 0],
			[1, 1],
			[10, 10],
		])('expect true [%i, %i]', (r, c) => {
			const mat = Matrix.random(r, c)
			expect(mat.isSquare()).toBeTruthy()
		})

		test.each([
			[0, 1],
			[1, 0],
			[10, 9],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.random(r, c)
			expect(mat.isSquare()).toBeFalsy()
		})
	})

	describe('isDiag', () => {
		test.each([
			[0, 0],
			[1, 1],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect true [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					if (i === j) {
						mat.set(i, j, Math.random())
					}
				}
			}
			expect(mat.isDiag()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const a = Math.floor(Math.random() * r)
			mat.set(a, (a + 1) % c, Math.random())
			expect(mat.isDiag()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					const r = Math.random() * 2 - 1
					if (i === j) {
						mat.set(i, j, r)
					} else {
						mat.set(i, j, r / 1.0e4)
					}
				}
			}

			expect(mat.isDiag(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const mat = Matrix.zeros(5, 5)
			const a = Math.floor(Math.random() * 5)
			mat.set(a, (a + 1) % 5, 1.1e-4)
			expect(mat.isDiag(1.0e-4)).toBeFalsy()
		})
	})

	describe('isIdentity', () => {
		test.each([0, 1, 2, 3, 5])('expect true %i', n => {
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				mat.set(i, i, 1)
			}
			expect(mat.isIdentity()).toBeTruthy()
		})

		test.each([
			[0, 1],
			[2, 3],
		])('expect false (not square) [%i %i]', (r, c) => {
			const mat = new Matrix(r, c)
			for (let i = 0; i < Math.min(r, c); i++) {
				mat.set(i, i, 1)
			}
			expect(mat.isIdentity()).toBeFalsy()
		})

		test.each([1, 3, 5])('expect false (diag is not 1) %i', n => {
			const mat = new Matrix(n, n)
			expect(mat.isIdentity()).toBeFalsy()
		})

		test.each([3, 5])('expect false (non diag is not 0) %i', n => {
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				mat.set(i, i, 1)
			}
			const r = Math.floor(Math.random() * n)
			mat.set(r, (r + 1) % n, 1)
			expect(mat.isIdentity()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					const r = Math.random() * 2 - 1
					if (i === j) {
						mat.set(i, j, 1 + r / 1.0e4)
					} else {
						mat.set(i, j, r / 1.0e4)
					}
				}
			}

			expect(mat.isIdentity(1.0e-4)).toBeTruthy()
		})

		test('tol expect false (diag is not 1)', () => {
			const mat = new Matrix(5, 5)
			for (let i = 0; i < 5; i++) {
				mat.set(i, i, 1 + 1.1e-4)
			}
			expect(mat.isIdentity(1.0e-4)).toBeFalsy()
		})

		test('tol expect false (non diag is not 0)', () => {
			const mat = new Matrix(5, 5)
			for (let i = 0; i < 5; i++) {
				mat.set(i, i, 1)
			}
			const r = Math.floor(Math.random() * 5)
			mat.set(r, (r + 1) % 5, 1.1e-4)
			expect(mat.isIdentity(1.0e-4)).toBeFalsy()
		})
	})

	describe('isTriangular', () => {
		describe.each(['lower', 'upper'])('%s', t => {
			const toZero = (a, b) => (t === 'lower' ? a > b : b < a)
			test.each([
				[0, 0],
				[1, 1],
				[1, 3],
				[3, 1],
				[10, 10],
				[5, 7],
				[7, 5],
			])('expect true [%i, %i]', (r, c) => {
				const mat = Matrix.random(r, c)
				for (let i = 0; i < r; i++) {
					for (let j = 0; j < c; j++) {
						if (toZero(i, j)) {
							mat.set(i, j, 0)
						}
					}
				}
				expect(mat.isTriangular()).toBeTruthy()
			})

			test('tol', () => {
				const n = 5
				const mat = Matrix.randn(n, n)
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < n; j++) {
						if (toZero(i, j)) {
							const r = Math.random() * 2 - 1
							mat.set(i, j, r / 1.0e4)
						}
					}
				}

				expect(mat.isTriangular(1.0e-4)).toBeTruthy()
			})

			test('tol expect false', () => {
				const n = 5
				const mat = Matrix.randn(n, n)

				const toZeroIdx = []
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < n; j++) {
						if (toZero(i, j)) {
							toZeroIdx.push([i, j])
						}
					}
				}
				const idx = toZeroIdx[Math.floor(Math.random() * toZeroIdx.length)]
				mat.set(idx[0], idx[1], 1.1e4)

				expect(mat.isTriangular(1.0e-4)).toBeFalsy()
			})
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const ua = Math.floor(Math.random() * Math.min(r, c - 1))
			const ub = ua + Math.floor(Math.random() * (c - ua - 1)) + 1
			mat.set(ua, ub, Math.random())
			const la = Math.floor(Math.random() * (r - 1)) + 1
			const lb = Math.min(c - 1, Math.floor(Math.random() * la))
			mat.set(la, lb, Math.random())
			expect(mat.isTriangular()).toBeFalsy()
		})
	})

	describe('isLowerTriangular', () => {
		test.each([
			[0, 0],
			[1, 1],
			[1, 3],
			[3, 1],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect true [%i, %i]', (r, c) => {
			const mat = Matrix.random(r, c)
			for (let i = 0; i < r; i++) {
				for (let j = i + 1; j < c; j++) {
					mat.set(i, j, 0)
				}
			}
			expect(mat.isLowerTriangular()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const a = Math.floor(Math.random() * Math.min(r, c - 1))
			const b = a + Math.floor(Math.random() * (c - a - 1)) + 1
			mat.set(a, b, Math.random())
			expect(mat.isLowerTriangular()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r / 1.0e4)
				}
			}

			expect(mat.isLowerTriangular(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			const toZeroIdx = []
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					toZeroIdx.push([i, j])
				}
			}
			const idx = toZeroIdx[Math.floor(Math.random() * toZeroIdx.length)]
			mat.set(idx[0], idx[1], 1.1e4)

			expect(mat.isLowerTriangular(1.0e-4)).toBeFalsy()
		})
	})

	describe('isUpperTriangular', () => {
		test.each([
			[0, 0],
			[1, 1],
			[1, 3],
			[3, 1],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect true [%i, %i]', (r, c) => {
			const mat = Matrix.random(r, c)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < Math.min(i, c); j++) {
					mat.set(i, j, 0)
				}
			}
			expect(mat.isUpperTriangular()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const a = Math.floor(Math.random() * (r - 1)) + 1
			const b = Math.min(c - 1, Math.floor(Math.random() * a))
			mat.set(a, b, Math.random())
			expect(mat.isUpperTriangular()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r / 1.0e4)
				}
			}

			expect(mat.isUpperTriangular(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			const toZeroIdx = []
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					toZeroIdx.push([i, j])
				}
			}
			const idx = toZeroIdx[Math.floor(Math.random() * toZeroIdx.length)]
			mat.set(idx[0], idx[1], 1.1e4)

			expect(mat.isUpperTriangular(1.0e-4)).toBeFalsy()
		})
	})

	describe('isSymmetric', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.add(mat.t)
			expect(mat.isSymmetric()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isSymmetric()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r)
					if (i !== j) {
						mat.set(j, i, r + r / 1.0e4)
					}
				}
			}

			expect(mat.isSymmetric(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			mat.add(mat.t)

			const i = Math.floor(Math.random() * n)
			const j = (i + 1) % n
			mat.set(i, j, mat.at(j, i) + 1.1e-4)

			expect(mat.isSymmetric(1.0e-4)).toBeFalsy()
		})
	})

	describe('isHermitian', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.add(mat.adjoint())
			expect(mat.isHermitian()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isHermitian()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r)
					if (i !== j) {
						mat.set(j, i, r + r / 1.0e4)
					}
				}
			}

			expect(mat.isHermitian(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			mat.add(mat.adjoint())

			const i = Math.floor(Math.random() * n)
			const j = (i + 1) % n
			mat.set(i, j, mat.at(j, i) + 1.1e-4)

			expect(mat.isHermitian(1.0e-4)).toBeFalsy()
		})
	})

	describe('isAlternating', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.sub(mat.t)
			expect(mat.isAlternating()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isAlternating()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r)
					if (i !== j) {
						mat.set(j, i, -r + r / 1.0e4)
					}
				}
			}

			expect(mat.isAlternating(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			mat.sub(mat.t)

			const i = Math.floor(Math.random() * n)
			const j = (i + 1) % n
			mat.set(i, j, mat.at(j, i) + 1.1e-4)

			expect(mat.isAlternating(1.0e-4)).toBeFalsy()
		})
	})

	describe('isSkewHermitian', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.sub(mat.adjoint())
			expect(mat.isSkewHermitian()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isSkewHermitian()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r)
					if (i !== j) {
						mat.set(j, i, -r + r / 1.0e4)
					}
				}
			}

			expect(mat.isSkewHermitian(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			mat.sub(mat.adjoint())

			const i = Math.floor(Math.random() * n)
			const j = (i + 1) % n
			mat.set(i, j, mat.at(j, i) + 1.1e-4)

			expect(mat.isSkewHermitian(1.0e-4)).toBeFalsy()
		})
	})

	describe('isRegular', () => {
		test.each([0, 1, 2, 5])('expect true %i', n => {
			const mat = Matrix.random(n, n).gram()
			const evalue = mat.eigenValues()
			mat.sub(Matrix.eye(n, n, evalue[0]))
			expect(mat.isRegular(1.0e-10)).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isRegular()).toBeFalsy()
		})
	})

	describe('isNormal', () => {
		test.each([0, 1, 2, 5])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.add(mat.t)
			mat.div(2)
			expect(mat.isNormal(1.0e-12)).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isNormal()).toBeFalsy()
		})
	})

	describe('isOrthogonal', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			for (let i = 0; i < n; i++) {
				const a = mat.row(i)
				for (let k = 0; k < i; k++) {
					const u = mat.row(k)
					u.mult(mat.row(i).dot(u.t))
					a.sub(u)
				}
				a.div(a.norm())
				mat.set(i, 0, a)
			}
			expect(mat.isOrthogonal(1.0e-12)).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isOrthogonal()).toBeFalsy()
		})
	})

	describe('isUnitary', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			for (let i = 0; i < n; i++) {
				const a = mat.row(i)
				for (let k = 0; k < i; k++) {
					const u = mat.row(k)
					u.mult(mat.row(i).dot(u.t))
					a.sub(u)
				}
				a.div(a.norm())
				mat.set(i, 0, a)
			}
			expect(mat.isUnitary(1.0e-12)).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isUnitary()).toBeFalsy()
		})
	})

	describe('isNilpotent', () => {
		test.each([0, 1, 2, 3, 10])('expect true %i', n => {
			const mat = Matrix.zeros(n, n)
			for (let i = 0; i < n - 1; i++) {
				mat.set(i, i + 1, 1)
			}
			expect(mat.isNilpotent(1.0e-12)).toBeTruthy()
		})

		test('expect false (not zero)', () => {
			const mat = Matrix.fromArray([
				[1, 2],
				[2, 1],
			])
			expect(mat.isNilpotent()).toBeFalsy()
		})

		test('expect false (NaN)', () => {
			const mat = Matrix.fromArray([
				[1, -1],
				[2, 1],
			])
			expect(mat.isNilpotent()).toBeFalsy()
		})

		test.each([
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isNilpotent()).toBeFalsy()
		})
	})

	test('diag', () => {
		const mat = Matrix.random(10, 10)
		const diag = mat.diag()
		for (let i = 0; i < diag.length; i++) {
			expect(diag[i]).toBe(mat.at(i, i))
		}
	})

	test('trace', () => {
		const mat = Matrix.random(10, 10)
		const trace = mat.trace()
		let s = 0
		for (let i = 0; i < 10; i++) {
			s += mat.at(i, i)
		}
		expect(trace).toBe(s)
	})

	describe('norm', () => {
		test('1', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.norm(1)
			expect(norm).toBeCloseTo(mat.value.reduce((s, v) => s + Math.abs(v), 0))
		})

		test('2', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.norm(2)
			expect(norm).toBeCloseTo(Math.sqrt(mat.value.reduce((s, v) => s + v ** 2, 0)))
		})

		test('Infinity', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.norm(Infinity)
			expect(norm).toBeCloseTo(mat.value.reduce((s, v) => Math.max(s, Math.abs(v)), 0))
		})
	})

	describe('rank', () => {
		test.each([
			[1, 1],
			[4, 4],
			[2, 3],
			[3, 2],
		])('regular (%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			const rank = mat.rank(1.0e-12)
			expect(rank).toBe(Math.min(r, c))
		})

		test('not regular', () => {
			const r = 4
			const c = 5
			const mat = Matrix.randn(r, c)
			for (let i = 0; i < c; i++) {
				mat.set(r - 3, i, mat.at(r - 2, i))
			}
			const rank = mat.rank(1.0e-12)
			expect(rank).toBe(3)
		})

		test.todo('tol')
	})

	describe('det', () => {
		test('0', () => {
			const mat = new Matrix(0, 0)
			expect(mat.det()).toBe(0)
		})

		test('1', () => {
			const mat = Matrix.randn(1, 1)
			expect(mat.det()).toBe(mat.value[0])
		})

		test.each([2, 3, 4, 5])('%i', n => {
			const mat = Matrix.randn(n, n)
			const idx = []
			for (let i = 0; i < n; i++) {
				idx[i] = i
			}
			let det = 0
			let sign = 1
			let endflg = false
			do {
				let deti = 1
				for (let i = 0; i < n; i++) {
					deti *= mat.at(i, idx[i])
				}
				det += sign * deti

				endflg = true
				for (let i = n - 2; i >= 0; i--) {
					if (idx[i] < idx[i + 1]) {
						endflg = false
						let j = n - 1
						for (; j > i; j--) {
							if (idx[j] > idx[i]) {
								break
							}
						}
						;[idx[i], idx[j]] = [idx[j], idx[i]]
						sign *= -1
						for (let k = i + 1, l = n - 1; k < l; k++, l--) {
							;[idx[k], idx[l]] = [idx[l], idx[k]]
							sign *= -1
						}
						break
					}
				}
			} while (!endflg)
			expect(mat.det()).toBeCloseTo(det)
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.det()).toThrowError('Determine only define square matrix.')
		})
	})

	test('negative', () => {
		const mat = Matrix.randn(100, 10)
		const neg = mat.copy()
		neg.negative()
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				expect(neg.at(i, j)).toBe(-mat.at(i, j))
			}
		}
	})

	test('abs', () => {
		const mat = Matrix.randn(100, 10)
		const abs = mat.copy()
		abs.abs()
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				expect(abs.at(i, j)).toBe(Math.abs(mat.at(i, j)))
			}
		}
	})

	describe.each([
		[
			'add',
			{
				calc: (a, b) => a + b,
				message: 'Addition size invalid.',
			},
		],
		[
			'sub',
			{
				calc: (a, b) => a - b,
				message: 'Subtract size invalid.',
			},
		],
		[
			'isub',
			{
				calc: (a, b) => b - a,
				message: 'Addition size invalid.',
			},
		],
		[
			'mult',
			{
				calc: (a, b) => a * b,
				message: 'Multiple size invalid.',
			},
		],
		[
			'div',
			{
				calc: (a, b) => a / b,
				message: 'Divide size invalid.',
			},
		],
		[
			'idiv',
			{
				calc: (a, b) => b / a,
				message: 'Divide size invalid.',
			},
		],
	])('%s', (name, info) => {
		test('scalar', () => {
			const mat = Matrix.randn(100, 10)
			const cp = mat.copy()
			cp[name](2)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(info.calc(mat.at(i, j), 2))
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(100, 10)

			const cp = mat.copy()
			cp[name](other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(info.calc(mat.at(i, j), other.at(i, j)))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('small matrix [%i %i]', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)

			const cp = mat.copy()
			cp[name](other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(info.calc(mat.at(i, j), other.at(i % other.rows, j % other.cols)))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('big matrix [%i  %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const other = Matrix.randn(100, 10)

			const cp = mat.copy()
			cp[name](other)
			expect(cp.sizes).toEqual(other.sizes)
			for (let i = 0; i < other.rows; i++) {
				for (let j = 0; j < other.cols; j++) {
					expect(cp.at(i, j)).toBe(info.calc(mat.at(i % mat.rows, j % mat.cols), other.at(i, j)))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
			[2, 20],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)
			expect(() => mat[name](other)).toThrowError(info.message)
		})

		test('at', () => {
			const mat = Matrix.randn(100, 10)
			const cp = mat.copy()
			cp[name + 'At'](1, 3, 2)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					if (i === 1 && j === 3) {
						expect(cp.at(i, j)).toBe(info.calc(mat.at(i, j), 2))
					} else {
						expect(cp.at(i, j)).toBe(mat.at(i, j))
					}
				}
			}
		})

		test.each([
			[-1, 0],
			[0, -1],
			[100, 0],
			[0, 10],
		])('fail at(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			expect(() => mat[name + 'At'](r, c, 2)).toThrowError('Index out of bounds.')
		})

		test('copy', () => {
			const mat = Matrix.randn(100, 10)
			const cp = mat['copy' + name[0].toUpperCase() + name.substr(1)](2)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(info.calc(mat.at(i, j), 2))
				}
			}
		})
	})

	describe('dot', () => {
		test.each([
			[
				[0, 0],
				[0, 0],
				[0, 0],
			],
			[
				[1, 1],
				[1, 1],
				[1, 1],
			],
			[
				[3, 5],
				[5, 4],
				[3, 4],
			],
		])('a%p, b%p', (sa, sb, sc) => {
			const a = Matrix.randn(...sa)
			const b = Matrix.randn(...sb)
			const dot = a.dot(b)
			expect(dot.sizes).toEqual(sc)
			for (let i = 0; i < sc[0]; i++) {
				for (let j = 0; j < sc[1]; j++) {
					let v = 0
					for (let k = 0; k < sa[1]; k++) {
						v += a.at(i, k) * b.at(k, j)
					}
					expect(dot.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('sparce', () => {
			const a = Matrix.randn(20, 18)
			for (let i = 0; i < a.rows; i++) {
				const p = Math.floor(Math.random() * a.cols)
				for (let j = 0; j < a.cols; j++) {
					if (j !== p) {
						a.set(i, j, 0)
					}
				}
			}
			const b = Matrix.randn(18, 16)
			const dot = a.dot(b)
			expect(dot.sizes).toEqual([a.rows, b.cols])
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					let v = 0
					for (let k = 0; k < a.cols; k++) {
						v += a.at(i, k) * b.at(k, j)
					}
					expect(dot.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('zeros', () => {
			const a = Matrix.zeros(20, 18)
			const b = Matrix.randn(18, 16)
			const dot = a.dot(b)
			expect(dot.sizes).toEqual([a.rows, b.cols])
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(dot.at(i, j)).toBe(0)
				}
			}
		})

		test('fail', () => {
			const a = Matrix.randn(4, 10)
			const b = Matrix.randn(4, 6)
			expect(() => a.dot(b)).toThrowError('Dot size invalid.')
		})
	})

	describe('tDot', () => {
		test.each([
			[
				[0, 0],
				[0, 0],
				[0, 0],
			],
			[
				[1, 1],
				[1, 1],
				[1, 1],
			],
			[
				[5, 3],
				[5, 4],
				[3, 4],
			],
		])('a%p, b%p', (sa, sb, sc) => {
			const a = Matrix.randn(...sa)
			const b = Matrix.randn(...sb)
			const tDot = a.tDot(b)
			expect(tDot.sizes).toEqual(sc)
			for (let i = 0; i < sc[0]; i++) {
				for (let j = 0; j < sc[1]; j++) {
					let v = 0
					for (let k = 0; k < sa[0]; k++) {
						v += a.at(k, i) * b.at(k, j)
					}
					expect(tDot.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('fail', () => {
			const a = Matrix.randn(10, 4)
			const b = Matrix.randn(4, 6)
			expect(() => a.tDot(b)).toThrowError('tDot size invalid.')
		})
	})

	test('kron', () => {
		const a = Matrix.randn(2, 3)
		const b = Matrix.randn(2, 3)
		const kron = a.kron(b)
		expect(kron.sizes).toEqual([4, 9])
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 9; j++) {
				expect(kron.at(i, j)).toBeCloseTo(a.at(Math.floor(i / 2), Math.floor(j / 3)) * b.at(i % 2, j % 3))
			}
		}
	})

	describe('convolute', () => {
		test('normalized', () => {
			const r = 10
			const c = 5
			const org = Matrix.randn(r, c)
			const mat = org.copy()
			const kernel = [
				[1, 2, 3],
				[2, 3, 4],
				[3, 4, 5],
			]
			mat.convolute(kernel)

			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					let v = 0
					let count = 0
					for (let s = Math.max(0, i - 1); s <= Math.min(r - 1, i + 1); s++) {
						for (let t = Math.max(0, j - 1); t <= Math.min(c - 1, j + 1); t++) {
							count += kernel[s - i + 1][t - j + 1]
							v += org.at(s, t) * kernel[s - i + 1][t - j + 1]
						}
					}
					expect(mat.at(i, j)).toBeCloseTo(v / count)
				}
			}
		})

		test('not normalized', () => {
			const r = 10
			const c = 5
			const org = Matrix.randn(r, c)
			const mat = org.copy()
			const kernel = [
				[1, 2, 3],
				[2, 3, 4],
				[3, 4, 5],
			]
			mat.convolute(kernel, false)

			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					let v = 0
					for (let s = Math.max(0, i - 1); s <= Math.min(r - 1, i + 1); s++) {
						for (let t = Math.max(0, j - 1); t <= Math.min(c - 1, j + 1); t++) {
							v += org.at(s, t) * kernel[s - i + 1][t - j + 1]
						}
					}
					expect(mat.at(i, j)).toBeCloseTo(v)
				}
			}
		})
	})

	describe('reducedRowEchelonForm', () => {
		test('not regular', () => {
			const r = 4
			const c = 5
			const org = Matrix.randn(r, c)
			for (let i = 0; i < c; i++) {
				org.set(r - 3, i, org.at(r - 2, i))
			}
			const mat = org.copy()
			mat.reducedRowEchelonForm(1.0e-12)

			for (let i = 0; i < r - 1; i++) {
				for (let j = 0; j < r - 1; j++) {
					expect(mat.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
			for (let j = 0; j < c; j++) {
				expect(mat.at(r - 1, j)).toBeCloseTo(0)
			}
		})

		test.todo('tol')
	})

	describe('inv', () => {
		test.each([0, 1, 2, 3, 10])('symmetric sizes[%i]', n => {
			const mat = Matrix.randn(n, n).gram()
			const inv = mat.inv()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([0, 1, 2, 3, 10])('upper triangular[%i]', n => {
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					mat.set(i, j, 0)
				}
			}
			const inv = mat.inv()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([0, 1, 2, 3, 10])('lower triangular[%i]', n => {
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					mat.set(i, j, 0)
				}
			}
			const inv = mat.inv()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.inv()).toThrowError('Inverse matrix only define square matrix.')
		})
	})

	describe('invLowerTriangular', () => {
		test.each([0, 1, 2, 3, 10])('sizes[%i]', n => {
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					mat.set(i, j, 0)
				}
			}
			const inv = mat.invLowerTriangular()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.invLowerTriangular()).toThrowError('Inverse matrix only define square matrix.')
		})
	})

	describe('invUpperTriangular', () => {
		test.each([0, 1, 2, 3, 10])('sizes[%i]', n => {
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					mat.set(i, j, 0)
				}
			}
			const inv = mat.invUpperTriangular()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.invUpperTriangular()).toThrowError('Inverse matrix only define square matrix.')
		})
	})

	describe('invRowReduction', () => {
		test.each([0, 1, 2, 3, 10])('symmetric sizes[%i]', n => {
			const mat = Matrix.randn(n, n).gram()
			const inv = mat.invRowReduction()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('pivot', () => {
			const mat = Matrix.randn(5, 5).gram()
			mat.set(0, 0, 0)
			const inv = mat.invRowReduction()

			const eye = mat.dot(inv)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.invRowReduction()).toThrowError('Inverse matrix only define square matrix.')
		})
	})

	describe('invLU', () => {
		test.each([0, 1, 2, 3, 10])('symmetric sizes[%i]', n => {
			const mat = Matrix.randn(n, n).gram()
			const inv = mat.invLU()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.invLU()).toThrowError('Inverse matrix only define square matrix.')
		})
	})

	describe('sqrt', () => {
		test('empty', () => {
			const mat = Matrix.randn(0, 0)
			const sqrt = mat.sqrt()
			expect(sqrt).toBe(mat)
		})

		test('diag', () => {
			const n = 5
			const mat = Matrix.diag(Matrix.randn(n, 1).value.map(Math.abs))
			const sqrt = mat.sqrt()

			for (let i = 0; i < n; i++) {
				expect(sqrt.at(i, i)).toBeCloseTo(Math.sqrt(mat.at(i, i)))
			}

			const sqrt2 = sqrt.dot(sqrt)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(sqrt2.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test.each([1, 2, 3])('size %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const sqrt = mat.sqrt()

			const sqrt2 = sqrt.dot(sqrt)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(sqrt2.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.sqrt()).toThrowError('sqrt only define square matrix.')
		})
	})

	describe('power', () => {
		test('0', () => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(0)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(pow.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('0.5', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const pow = mat.power(0.5)

			const pow2 = pow.dot(pow)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(pow2.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test('1', () => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(1)
			expect(pow).not.toBe(mat)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(pow.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test.each([2, 3, 4, 10])('%i(non symmetric)', p => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(p)

			let matp = mat
			for (let i = 1; i < p; i++) {
				matp = matp.dot(mat)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(pow.at(i, j)).toBeCloseTo(matp.at(i, j))
				}
			}
		})

		test.each([2, 3, 4, 10])('%i(symmetric)', p => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const pow = mat.power(p)

			let matp = mat
			for (let i = 1; i < p; i++) {
				matp = matp.dot(mat)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					let value = pow.at(i, j)
					const scale = 10 ** Math.floor(Math.log10(Math.abs(value)))
					expect(pow.at(i, j) / scale).toBeCloseTo(matp.at(i, j) / scale, 1)
				}
			}
		})

		test('-1', () => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(-1)

			const eye = mat.dot(pow)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([-2, -3, -4])('%i(non symmetric)', p => {
			const n = 10
			const mat = Matrix.random(n, n, -1, 1)
			const pow = mat.power(p)

			let eye = pow
			for (let i = 0; i < -p; i++) {
				eye = eye.dot(mat)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([-2, -3])('%i(symmetric)', p => {
			const n = 3
			const mat = Matrix.random(n, n, -0.5, 0.5).gram()
			const pow = mat.power(p)

			let eye = pow
			for (let i = 0; i < -p; i++) {
				eye = eye.dot(mat)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0, 1)
				}
			}
		})

		test('-0.5', () => {
			const n = 3
			const mat = Matrix.randn(n, n).gram()
			const pow = mat.power(-0.5)

			const pow2 = pow.dot(pow)
			const eye = pow2.dot(mat)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([0, 0.1, 0.5, 1, 2, 3, 3.4, -0.1, -1, -2, -5])('%f(diag)', p => {
			const diag = [1, 2, 3, 4, 5]
			const mat = Matrix.diag(diag)
			const pow = mat.power(p)

			for (let i = 0; i < diag.length; i++) {
				expect(pow.at(i, i)).toBeCloseTo(Math.pow(diag[i], p))
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.power(2)).toThrowError('Only square matrix can power.')
		})

		test('fail not int', () => {
			const mat = Matrix.randn(3, 3)
			expect(() => mat.power(2.3)).toThrowError('Power only defined integer.')
		})
	})

	describe('exp', () => {
		test('diag', () => {
			const mat = Matrix.diag(Matrix.randn(5, 1).value)
			const exp = mat.exp()

			for (let i = 0; i < mat.rows; i++) {
				expect(exp.at(i, i)).toBeCloseTo(Math.exp(mat.at(i, i)))
			}
			expect(exp.det()).toBeCloseTo(Math.exp(mat.trace()))
		})

		test('one', () => {
			const mat = Matrix.randn(1, 1)
			const exp = mat.exp()

			expect(exp.at(0, 0)).toBeCloseTo(Math.exp(mat.at(0, 0)))
			expect(exp.det()).toBeCloseTo(Math.exp(mat.trace()))
		})

		test.each([2, 3, 10])('%i', n => {
			const mat = Matrix.randn(n, n)
			const exp = mat.exp()

			expect(exp.det()).toBeCloseTo(Math.exp(mat.trace()))
		})

		test('fail not square', () => {
			const mat = Matrix.randn(3, 4)
			expect(() => mat.exp()).toThrowError('Only square matrix can exp.')
		})
	})

	describe('log', () => {
		test('diag', () => {
			const mat = Matrix.diag(Matrix.random(5, 1).value)
			const log = mat.log()

			for (let i = 0; i < mat.rows; i++) {
				expect(log.at(i, i)).toBeCloseTo(Math.log(mat.at(i, i)))
			}
			expect(log.trace()).toBeCloseTo(Math.log(mat.det()))
		})

		test('one', () => {
			const mat = Matrix.random(1, 1)
			const log = mat.log()

			expect(log.at(0, 0)).toBeCloseTo(Math.log(mat.at(0, 0)))
			expect(log.trace()).toBeCloseTo(Math.log(mat.det()))
		})

		test.each([2, 3, 10])('%i', n => {
			const mat = Matrix.randn(n, n).gram()
			const log = mat.log()

			expect(log.trace()).toBeCloseTo(Math.log(mat.det()))
		})

		test('fail not square', () => {
			const mat = Matrix.randn(3, 4)
			expect(() => mat.log()).toThrowError('Only square matrix can exp.')
		})
	})

	describe('cov', () => {
		test('ddof 0', () => {
			const mat = Matrix.randn(100, 5, [1, 2, 3, 4, 5], 0.1)
			const cov = mat.cov()
			expect(cov.sizes).toEqual([5, 5])

			const d = mat.copySub(mat.mean(0))
			const c = d.tDot(d)
			c.div(mat.rows)
			for (let i = 0; i < 5; i++) {
				for (let j = 0; j < 5; j++) {
					expect(cov.at(i, j)).toBeCloseTo(c.at(i, j))
				}
			}
		})

		test('ddof 1', () => {
			const mat = Matrix.randn(100, 5, [1, 2, 3, 4, 5], 0.1)
			const cov = mat.cov(1)
			expect(cov.sizes).toEqual([5, 5])

			const d = mat.copySub(mat.mean(0))
			const c = d.tDot(d)
			c.div(mat.rows - 1)
			for (let i = 0; i < 5; i++) {
				for (let j = 0; j < 5; j++) {
					expect(cov.at(i, j)).toBeCloseTo(c.at(i, j))
				}
			}
		})
	})

	test('gram', () => {
		const mat = Matrix.randn(10, 5)
		const gram = mat.gram()

		expect(gram.sizes).toEqual([5, 5])
		const dot = mat.tDot(mat)
		for (let i = 0; i < 5; i++) {
			for (let j = 0; j < 5; j++) {
				expect(gram.at(i, j)).toBeCloseTo(dot.at(i, j))
			}
		}
	})

	describe('solve', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			const b = Matrix.randn(n, 1)

			const a = x.solve(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test.each([0, 1, 5])('excessive columns (%i)', n => {
			const x = Matrix.randn(n, n + 1 + Math.floor(Math.random() * 10))
			const b = Matrix.randn(n, 1 + Math.floor(Math.random() * 10))

			const a = x.solve(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 4)
			const b = Matrix.randn(10, 1)
			expect(() => a.solve(b)).toThrowError(
				'Only square matrix or matrix with more columns than rows can be solved.'
			)
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(3, 4)
			const b = Matrix.randn(4, 1)
			expect(() => a.solve(b)).toThrowError('b size is invalid.')
		})
	})

	describe('solveLowerTriangular', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					x.set(i, j, 0)
				}
			}
			const b = Matrix.randn(n, 1)

			const a = x.solveLowerTriangular(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 9)
			const b = Matrix.randn(10, 1)
			expect(() => a.solveLowerTriangular(b)).toThrowError('Only square matrix can solve.')
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(4, 4)
			const b = Matrix.randn(3, 1)
			expect(() => a.solveLowerTriangular(b)).toThrowError('b size is invalid.')
		})
	})

	describe('solveUpperTriangular', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					x.set(i, j, 0)
				}
			}
			const b = Matrix.randn(n, 1)

			const a = x.solveUpperTriangular(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 9)
			const b = Matrix.randn(10, 1)
			expect(() => a.solveUpperTriangular(b)).toThrowError('Only square matrix can solve.')
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(4, 4)
			const b = Matrix.randn(3, 1)
			expect(() => a.solveUpperTriangular(b)).toThrowError('b size is invalid.')
		})
	})

	describe('bidiag', () => {
		test.each([
			[2, 3],
			[3, 2],
		])('[%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const bidiag = mat.bidiag()
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					if (i !== j && i + 1 !== j) {
						expect(bidiag.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})
	})

	describe('tridiag', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n, 0, 0.1).gram()
			const tridiag = mat.tridiag()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (Math.abs(i - j) > 1) {
						expect(tridiag.at(i, j)).toBeCloseTo(0)
					} else if (Math.abs(i - j) === 1) {
						expect(tridiag.at(i, j)).toBeCloseTo(tridiag.at(j, i))
					}
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = tridiag.copySub(Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[3, 3],
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.tridiag()).toThrowError('Tridiagonal only define symmetric matrix.')
		})
	})

	describe('tridiagHouseholder', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n, 0, 0.1).gram()
			const tridiag = mat.tridiagHouseholder()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (Math.abs(i - j) > 1) {
						expect(tridiag.at(i, j)).toBeCloseTo(0)
					} else if (Math.abs(i - j) === 1) {
						expect(tridiag.at(i, j)).toBeCloseTo(tridiag.at(j, i))
					}
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = tridiag.copySub(Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[3, 3],
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.tridiagHouseholder()).toThrowError('Tridiagonal only define symmetric matrix.')
		})
	})

	describe('tridiagLanczos', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n, 0, 0.1).gram()
			const tridiag = mat.tridiagLanczos()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (Math.abs(i - j) > 1) {
						expect(tridiag.at(i, j)).toBeCloseTo(0)
					} else if (Math.abs(i - j) === 1) {
						expect(tridiag.at(i, j)).toBeCloseTo(tridiag.at(j, i))
					}
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = tridiag.copySub(Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.todo('k')

		test.each([
			[3, 3],
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.tridiagLanczos()).toThrowError('Tridiagonal only define symmetric matrix.')
		})
	})

	describe('hessenberg', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const hessenberg = mat.hessenberg()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = hessenberg.copySub(Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([2, 3, 5])('not symmetric %i', n => {
			const mat = Matrix.randn(n, n)
			const hessenberg = mat.hessenberg()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				if (isNaN(orgeig[i])) {
					continue
				}
				const s = hessenberg.copySub(Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.hessenberg()).toThrowError('Hessenberg only define square matrix.')
		})
	})

	describe('hessenbergArnoldi', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const hessenberg = mat.hessenbergArnoldi()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = hessenberg.copySub(Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([2, 3, 5])('not symmetric %i', n => {
			const mat = Matrix.randn(n, n)
			const hessenberg = mat.hessenbergArnoldi()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				if (isNaN(orgeig[i])) {
					continue
				}
				const s = hessenberg.copySub(Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.todo('k')

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.hessenbergArnoldi()).toThrowError('Hessenberg only define square matrix.')
		})
	})

	describe('lu', () => {
		test.each([0, 1, 2, 3, 5])('success %i', n => {
			const mat = Matrix.randn(n, n)
			const [l, u] = mat.lu()

			const res = l.dot(u)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i > j) {
						expect(u.at(i, j)).toBeCloseTo(0)
					} else if (i < j) {
						expect(l.at(i, j)).toBeCloseTo(0)
					} else {
						expect(l.at(i, j)).toBeCloseTo(1)
					}
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.lu()).toThrowError('LU decomposition only define square matrix.')
		})
	})

	describe('qr', () => {
		test.each([
			[0, 0],
			[1, 10],
			[10, 10],
			[10, 7],
			[7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [q, r] = mat.qr()
			expect(q.sizes).toEqual([rows, rows])
			expect(r.sizes).toEqual([rows, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i > j && i < cols) {
						expect(r.at(i, j)).toBeCloseTo(0)
					}
				}
			}

			const eye = q.tDot(q)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < rows; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('success [10, 1]', () => {
			const rows = 10
			const cols = 1
			const mat = Matrix.randn(rows, cols)
			const [q, r] = mat.qr()
			expect(q.sizes).toEqual([rows, cols])
			expect(r.sizes).toEqual([cols, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i > j && i < cols) {
						expect(r.at(i, j)).toBeCloseTo(0)
					}
				}
			}

			const eye = q.tDot(q)
			expect(eye.at(0, 0)).toBeCloseTo(1)
		})
	})

	describe('qrGramSchmidt', () => {
		test.each([
			// [1, 10],
			[10, 1],
			[10, 10],
			[10, 7],
			// [7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [q, r] = mat.qrGramSchmidt()
			expect(q.sizes).toEqual([rows, cols])
			expect(r.sizes).toEqual([cols, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i > j && i < cols) {
						expect(r.at(i, j)).toBeCloseTo(0)
					}
				}
			}

			const eye = q.tDot(q)
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < cols; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})
	})

	describe('qrHouseholder', () => {
		test.each([
			[0, 0],
			[1, 10],
			[10, 1],
			[10, 10],
			[10, 7],
			[7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [q, r] = mat.qrHouseholder()
			expect(q.sizes).toEqual([rows, rows])
			expect(r.sizes).toEqual([rows, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i > j && i < cols) {
						expect(r.at(i, j)).toBeCloseTo(0)
					}
				}
			}

			const eye = q.tDot(q)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < rows; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})
	})

	test.each([
		[10, 6],
		[6, 10],
	])('singularValues [%i, %i]', (r, c) => {
		const mat = Matrix.randn(r, c)
		const sv = mat.singularValues()
		expect(sv).toHaveLength(r)
		for (let i = 0; i < r; i++) {
			expect(sv[i]).toBeGreaterThanOrEqual(0)
			if (i > 0) {
				expect(sv[i]).toBeLessThanOrEqual(sv[i - 1])
			}
		}
		expect(sv.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mat.dot(mat.t).det())
		expect(sv.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mat.dot(mat.t).trace())
	})

	describe('svd', () => {
		test.each([
			[10, 10],
			[10, 7],
			[7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [u, d, v] = mat.svd()
			const minsize = Math.min(rows, cols)
			expect(u.sizes).toEqual([rows, minsize])
			expect(d).toHaveLength(minsize)
			expect(v.sizes).toEqual([cols, minsize])

			const res = u.dot(Matrix.diag(d)).dot(v.t)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}

			const eyeu = u.tDot(u)
			const eyev = v.tDot(v)
			for (let i = 0; i < minsize; i++) {
				for (let j = 0; j < minsize; j++) {
					expect(eyeu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					expect(eyev.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})
	})

	test.todo('svdEigen')

	test.todo('svdGolubKahan')

	describe('cholesky', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const chol = mat.cholesky()

			const res = chol.dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i < j) {
						expect(chol.at(i, j)).toBeCloseTo(0, 1)
					}
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.cholesky()).toThrowError('Cholesky decomposition only define symmetric matrix.')
		})
	})

	describe('choleskyBanachiewicz', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const chol = mat.choleskyBanachiewicz()

			const res = chol.dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i < j) {
						expect(chol.at(i, j)).toBeCloseTo(0, 1)
					}
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.choleskyBanachiewicz()).toThrowError(
				'Cholesky decomposition only define symmetric matrix.'
			)
		})
	})

	describe('choleskyLDL', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const [chol, d] = mat.choleskyLDL()

			const res = chol.dot(Matrix.diag(d)).dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i < j) {
						expect(chol.at(i, j)).toBeCloseTo(0, 1)
					}
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.choleskyLDL()).toThrowError('Cholesky decomposition only define symmetric matrix.')
		})
	})

	describe('eigen', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const [eigvalues, eigvectors] = mat.eigen()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvectors.col(i))
				const y = eigvectors.col(i).copyMult(eigvalues[i])
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
			}
			const eye = eigvectors.tDot(eigvectors)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const [eigvalues, eigvectors] = mat.eigen()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvectors.col(i))
				const y = eigvectors.col(i).copyMult(eigvalues[i])
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigen()).toThrowError('Eigen values only define square matrix.')
		})
	})

	describe('eigenValues', () => {
		test.each([0, 1, 2, 3, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvalues = mat.eigenValues()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test('non symmetric', () => {
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const eigvalues = mat.eigenValues()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenValues()).toThrowError('Eigen values only define square matrix.')
		})
	})

	describe('eigenVectors', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvectors = mat.eigenVectors()

			for (let i = 0; i < n; i++) {
				const x = mat.dot(eigvectors.col(i))
				x.div(eigvectors.col(i))
				for (let k = 1; k < n; k++) {
					expect(x.at(0, 0)).toBeCloseTo(x.at(k, 0))
				}
			}
			const eye = eigvectors.tDot(eigvectors)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const eigvectors = mat.eigenVectors()

			for (let i = 0; i < n; i++) {
				const x = mat.dot(eigvectors.col(i))
				x.div(eigvectors.col(i))
				for (let k = 1; k < n; k++) {
					expect(x.at(0, 0)).toBeCloseTo(x.at(k, 0))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenVectors()).toThrowError('Eigen vectors only define square matrix.')
		})
	})

	describe('eigenValuesBiSection', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvalues = mat.eigenValuesBiSection()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenValuesBiSection()).toThrowError('eigenValuesBiSection can only use symmetric matrix.')
		})
	})

	describe('eigenValuesLR', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvalues = mat.eigenValuesLR()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test('non symmetric', () => {
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const eigvalues = mat.eigenValuesLR()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenValuesLR()).toThrowError('Eigen values only define square matrix.')
		})
	})

	describe('eigenValuesQR', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvalues = mat.eigenValuesQR()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test('non symmetric', () => {
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const eigvalues = mat.eigenValuesQR()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenValuesQR()).toThrowError('Eigen values only define square matrix.')
		})
	})

	describe('eigenJacobi', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const [eigvalues, eigvectors] = mat.eigenJacobi()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvectors.col(i))
				const y = eigvectors.col(i).copyMult(eigvalues[i])
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
			}
			const eye = eigvectors.tDot(eigvectors)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenJacobi()).toThrowError('Jacobi method can only use symmetric matrix.')
		})

		describe('log mock', () => {
			let orgLog
			beforeAll(() => {
				orgLog = console.log
				console.log = jest.fn()
			})

			afterAll(() => {
				console.log = orgLog
			})

			test('not converged', () => {
				const mat = Matrix.randn(10, 10).gram()
				console.log = jest.fn()

				mat.eigenJacobi(1)
				const msg = console.log.mock.calls[0][0]
				expect(msg.constructor.name).toBe('MatrixException')
				expect(msg.message).toBe('eigenJacobi not converged.')
			})
		})
	})

	describe('eigenPowerIteration', () => {
		test.each([1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const [eigvalue, eigvector] = mat.eigenPowerIteration()

			const cmat = mat.copy()
			for (let k = 0; k < n; k++) {
				cmat.subAt(k, k, eigvalue)
			}
			expect(cmat.det()).toBeCloseTo(0)

			const x = mat.dot(eigvector)
			const y = eigvector.copyMult(eigvalue)
			for (let k = 0; k < n; k++) {
				expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
			}
			const eye = eigvector.tDot(eigvector)
			expect(eye.at(0, 0)).toBeCloseTo(1)
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const [eigvalue, eigvector] = mat.eigenPowerIteration()

			const cmat = mat.copy()
			for (let k = 0; k < n; k++) {
				cmat.subAt(k, k, eigvalue)
			}
			expect(cmat.det()).toBeCloseTo(0)

			const x = mat.dot(eigvector)
			const y = eigvector.copyMult(eigvalue)
			for (let k = 0; k < n; k++) {
				expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
			}
			const eye = eigvector.tDot(eigvector)
			expect(eye.at(0, 0)).toBeCloseTo(1)
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenPowerIteration()).toThrowError('Eigen vectors only define square matrix.')
		})
	})

	describe('eigenInverseIteration', () => {
		test.each([1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const ev = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const e = ev[i] - (ev[i] - (ev[i + 1] || ev[i] - 1)) / 4
				const [eigvalue, eigvector] = mat.eigenInverseIteration(e)

				expect(eigvalue).toBeCloseTo(ev[i])

				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalue)
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvector)
				const y = eigvector.copyMult(eigvalue)
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
				const eye = eigvector.tDot(eigvector)
				expect(eye.at(0, 0)).toBeCloseTo(1)
			}
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const ev = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const e = ev[i] - (ev[i] - (ev[i + 1] || ev[i] - 1)) / 4
				const [eigvalue, eigvector] = mat.eigenInverseIteration(e)

				expect(eigvalue).toBeCloseTo(ev[i])

				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalue)
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvector)
				const y = eigvector.copyMult(eigvalue)
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
				const eye = eigvector.tDot(eigvector)
				expect(eye.at(0, 0)).toBeCloseTo(1)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenInverseIteration()).toThrowError('Eigen vectors only define square matrix.')
		})
	})
})
