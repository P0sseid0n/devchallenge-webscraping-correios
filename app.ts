import puppeteer from 'puppeteer'

const CEP = '20540330'

function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

;(async () => {
	if (CEP.length != 8 || isNaN(Number(CEP))) return console.log('CEP invalido')

	const browser = await puppeteer.launch({
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--single-process', // <- this one doesn't works in Windows
			'--disable-gpu',
		],
		headless: false,
	})

	const page = await browser.newPage()

	await page.setRequestInterception(true)
	page.on('request', req => {
		if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') req.abort()
		else req.continue()
	})

	await page.goto('https://buscacepinter.correios.com.br/app/endereco/index.php')

	await page.focus('#endereco')
	page.keyboard.type(CEP)
	await wait(50)
	await page.click('#btn_pesquisar')

	await wait(2_000)
	const info = await page.evaluate(() => {
		let info: string[] = []
		const infos: Array<typeof info> = []

		document.querySelectorAll('#resultado-DNEC td').forEach((element, index) => {
			const td = element as HTMLTableCellElement
			info.push(td.innerText)
			if ((index + 1) % 4 == 0) {
				infos.push(info)
				info = []
			}
		})
		return infos
	})

	console.log(info)

	await browser.close()
})()
