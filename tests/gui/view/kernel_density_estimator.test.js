import { getPage } from '../helper/browser'

describe('density estimation', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('DE')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('kernel_density_estimator')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const kernel = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await kernel.getProperty('value')).jsonValue()).resolves.toBe('gaussian')
		const auto = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await auto.getProperty('checked')).jsonValue()).resolves.toBeTruthy()
		const h = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await h.getProperty('value')).jsonValue()).resolves.toBe('0.1')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('DE')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('kernel_density_estimator')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const fitButton = await buttons.waitForSelector('input[value=Fit]')
		await fitButton.evaluate(el => el.click())

		const h = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await h.getProperty('value')).jsonValue()).resolves.toMatch(/^[0-9.]+$/)

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile-render image')
		expect((await svg.$$('.tile-render image')).length).toBeGreaterThan(0)
	}, 10000)
})
